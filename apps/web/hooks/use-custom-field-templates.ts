'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'
import { 
  CustomFieldTemplate, 
  CreateCustomFieldTemplateData, 
  UpdateCustomFieldTemplateData 
} from '@/types/custom-fields';

interface UseCustomFieldTemplatesOptions {
  appliesTo?: string;
  includeInactive?: boolean;
  autoFetch?: boolean;
}

interface UseCustomFieldTemplatesReturn {
  templates: CustomFieldTemplate[];
  loading: boolean;
  error: string | null;
  fetchTemplates: (appliesTo?: string) => Promise<void>;
  createTemplate: (data: CreateCustomFieldTemplateData) => Promise<CustomFieldTemplate | null>;
  updateTemplate: (id: string, data: UpdateCustomFieldTemplateData) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
}

export function useCustomFieldTemplates({
  appliesTo,
  includeInactive = false,
  autoFetch = true
}: UseCustomFieldTemplatesOptions = {}): UseCustomFieldTemplatesReturn {
  const [templates, setTemplates] = useState<CustomFieldTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async (filterAppliesTo?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (filterAppliesTo || appliesTo) {
        params.append('applies_to', filterAppliesTo || appliesTo || '');
      }
      if (includeInactive) {
        params.append('include_inactive', 'true');
      }
      
      const response = await fetch(`/api/v1/custom-field-templates?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Error', { description: message });
    } finally {
      setLoading(false);
    }
  }, [appliesTo, includeInactive]);

  const createTemplate = useCallback(async (
    templateData: CreateCustomFieldTemplateData
  ): Promise<CustomFieldTemplate | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/v1/custom-field-templates', {
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
      
      toast.success('Éxito', { description: 'Plantilla creada correctamente' });
      
      return data.template;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Error', { description: message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const updateTemplate = useCallback(async (
    id: string, 
    data: UpdateCustomFieldTemplateData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/custom-field-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      await fetchTemplates(); // Refresh list
      
      toast.success('Éxito', { description: 'Plantilla actualizada correctamente' });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Error', { description: message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/custom-field-templates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast.success('Éxito', { description: 'Plantilla eliminada correctamente' });
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error('Error', { description: message });
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