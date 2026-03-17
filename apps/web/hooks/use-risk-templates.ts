// hooks/use-risk-templates.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { RiskTemplate, RiskTemplateWithItems } from '@/types/risk-management';

interface UseRiskTemplatesOptions {
  aiActLevel?: string;
  includeSystem?: boolean;
  autoFetch?: boolean;
}

interface UseRiskTemplatesReturn {
  templates: RiskTemplateWithItems[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  createTemplate: (data: {
    name: string;
    description?: string;
    ai_act_level: string;
    risk_ids: string[];
  }) => Promise<RiskTemplate | null>;
  updateTemplate: (id: string, data: Partial<RiskTemplate>) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
}

export function useRiskTemplates({
  aiActLevel,
  includeSystem = true,
  autoFetch = true
}: UseRiskTemplatesOptions = {}): UseRiskTemplatesReturn {
  const [templates, setTemplates] = useState<RiskTemplateWithItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (aiActLevel) params.append('ai_act_level', aiActLevel);
      if (!includeSystem) params.append('include_system', 'false');
      
      const response = await fetch(`/api/v1/risks/templates?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [aiActLevel, includeSystem]);

  const createTemplate = useCallback(async (templateData: {
    name: string;
    description?: string;
    ai_act_level: string;
    risk_ids: string[];
  }): Promise<RiskTemplate | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/risks/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const data = await response.json();
      await fetchTemplates(); // Refresh list
      return data.template;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, data: Partial<RiskTemplate>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/risks/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      await fetchTemplates(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/risks/templates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [autoFetch, fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
}
