'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  RiaFormTemplate,
  CreateRiaTemplatePayload,
  UpdateRiaTemplatePayload,
} from '@/types/ria-form-template';

interface UseRiaTemplatesReturn {
  templates: RiaFormTemplate[];
  isLoading: boolean;
  error: string | null;
  createTemplate: (payload: CreateRiaTemplatePayload) => Promise<RiaFormTemplate>;
  updateTemplate: (id: string, payload: UpdateRiaTemplatePayload) => Promise<RiaFormTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, name: string) => Promise<RiaFormTemplate>;
  setDefaultTemplate: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useRiaTemplates(): UseRiaTemplatesReturn {
  const [templates, setTemplates] = useState<RiaFormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/ria-templates');
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al cargar plantillas');
      setTemplates(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(
    async (payload: CreateRiaTemplatePayload): Promise<RiaFormTemplate> => {
      const res = await fetch('/api/v1/ria-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al crear plantilla');
      await fetchTemplates();
      return json.data;
    },
    [fetchTemplates]
  );

  const updateTemplate = useCallback(
    async (id: string, payload: UpdateRiaTemplatePayload): Promise<RiaFormTemplate> => {
      const res = await fetch(`/api/v1/ria-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al actualizar plantilla');
      await fetchTemplates();
      return json.data;
    },
    [fetchTemplates]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`/api/v1/ria-templates/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al eliminar plantilla');
      await fetchTemplates();
    },
    [fetchTemplates]
  );

  const duplicateTemplate = useCallback(
    async (id: string, name: string): Promise<RiaFormTemplate> => {
      const res = await fetch(`/api/v1/ria-templates/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al duplicar plantilla');
      await fetchTemplates();
      return json.data;
    },
    [fetchTemplates]
  );

  const setDefaultTemplate = useCallback(
    async (id: string): Promise<void> => {
      const res = await fetch(`/api/v1/ria-templates/${id}/set-default`, { method: 'POST' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? 'Error al establecer plantilla por defecto');
      await fetchTemplates();
    },
    [fetchTemplates]
  );

  return {
    templates,
    isLoading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setDefaultTemplate,
    refresh: fetchTemplates,
  };
}
