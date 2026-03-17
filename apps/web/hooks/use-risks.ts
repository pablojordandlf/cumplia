// hooks/use-risks.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AISystemRisk, RiskManagementStatus, getRiskManagementStatus } from '@/types/risk-management';

interface UseRisksOptions {
  aiSystemId: string;
  aiActLevel: string;
  autoFetch?: boolean;
}

interface UseRisksReturn {
  risks: AISystemRisk[];
  status: RiskManagementStatus | null;
  loading: boolean;
  error: string | null;
  fetchRisks: () => Promise<void>;
  applyTemplate: (templateId: string) => Promise<AISystemRisk[]>;
  updateRisk: (riskId: string, data: Partial<AISystemRisk>) => Promise<AISystemRisk | null>;
  deleteRisk: (riskId: string) => Promise<boolean>;
  clearAllRisks: () => Promise<boolean>;
}

export function useRisks({ aiSystemId, aiActLevel, autoFetch = true }: UseRisksOptions): UseRisksReturn {
  const [risks, setRisks] = useState<AISystemRisk[]>([]);
  const [status, setStatus] = useState<RiskManagementStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRisks = useCallback(async () => {
    if (!aiSystemId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data.risks || []);
      setStatus(getRiskManagementStatus(aiActLevel, data.risks || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [aiSystemId, aiActLevel]);

  const applyTemplate = useCallback(async (templateId: string): Promise<AISystemRisk[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: templateId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply template');
      }

      const data = await response.json();
      setRisks(data.risks || []);
      setStatus(getRiskManagementStatus(aiActLevel, data.risks || []));
      return data.risks || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [aiSystemId, aiActLevel]);

  const updateRisk = useCallback(async (riskId: string, data: Partial<AISystemRisk>): Promise<AISystemRisk | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks/${riskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update risk');
      }

      const result = await response.json();
      const updatedRisk = result.risk;
      
      setRisks(prev => prev.map(r => r.id === riskId ? updatedRisk : r));
      setStatus(getRiskManagementStatus(aiActLevel, risks.map(r => r.id === riskId ? updatedRisk : r)));
      
      return updatedRisk;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [aiSystemId, aiActLevel, risks]);

  const deleteRisk = useCallback(async (riskId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks/${riskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete risk');
      }

      const updatedRisks = risks.filter(r => r.id !== riskId);
      setRisks(updatedRisks);
      setStatus(getRiskManagementStatus(aiActLevel, updatedRisks));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [aiSystemId, aiActLevel, risks]);

  const clearAllRisks = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear risks');
      }

      setRisks([]);
      setStatus(getRiskManagementStatus(aiActLevel, []));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [aiSystemId, aiActLevel]);

  useEffect(() => {
    if (autoFetch) {
      fetchRisks();
    }
  }, [autoFetch, fetchRisks]);

  return {
    risks,
    status,
    loading,
    error,
    fetchRisks,
    applyTemplate,
    updateRisk,
    deleteRisk,
    clearAllRisks
  };
}
