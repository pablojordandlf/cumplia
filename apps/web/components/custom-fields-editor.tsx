'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { CustomFieldTemplate } from '@/types/custom-fields';

interface CustomField {
  id: string;
  key: string;
  value: string;
}

interface CustomFieldsEditorProps {
  useCase: {
    id: string;
    ai_act_level: string;
    custom_fields: CustomField[];
  };
  applicableTemplates: CustomFieldTemplate[];
  onSave: (fields: CustomField[]) => Promise<void>;
  readOnly?: boolean;
}

const APPLIES_TO_LABELS: Record<string, string> = {
  global: 'Todos',
  high_risk: 'Alto Riesgo',
  limited_risk: 'Riesgo Limitado',
  minimal_risk: 'Riesgo Mínimo',
  prohibited: 'Prohibido',
};

const APPLIES_TO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  global: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  high_risk: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  limited_risk: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  minimal_risk: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  prohibited: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

export function CustomFieldsEditor({
  useCase,
  applicableTemplates,
  onSave,
  readOnly = false,
}: CustomFieldsEditorProps) {
  const [fields, setFields] = useState<CustomField[]>(useCase.custom_fields || []);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get all field keys from applicable templates
  const templateFields = applicableTemplates
    .flatMap(template => template.field_definitions || [])
    .reduce((acc, field) => {
      if (!acc.find(f => f.key === field.key)) {
        acc.push({ key: field.key, label: field.label || field.key, type: field.type || 'text' });
      }
      return acc;
    }, [] as Array<{ key: string; label: string; type: string }>);

  const hasTemplates = applicableTemplates.length > 0;
  const templateFieldKeys = templateFields.map(f => f.key);
  const customFieldKeys = fields.map(f => f.key);
  const missingFields = templateFieldKeys.filter(key => !customFieldKeys.includes(key));

  const handleUpdateField = (key: string, value: string) => {
    const existingIndex = fields.findIndex(f => f.key === key);
    if (existingIndex >= 0) {
      const newFields = [...fields];
      newFields[existingIndex].value = value;
      setFields(newFields);
    } else {
      setFields([...fields, { id: Math.random().toString(36).substr(2, 9), key, value }]);
    }
  };

  const handleRemoveField = (key: string) => {
    setFields(fields.filter(f => f.key !== key));
  };

  const handleAddMissingFields = () => {
    const newFields = [...fields];
    missingFields.forEach(key => {
      if (!newFields.find(f => f.key === key)) {
        newFields.push({ id: Math.random().toString(36).substr(2, 9), key, value: '' });
      }
    });
    setFields(newFields);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(fields);
      setIsEditing(false);
      toast.success('Guardado', { description: 'Los campos personalizados se han actualizado correctamente.' });
    } catch (error: any) {
      toast.error('Error', { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasTemplates && fields.length === 0) {
    return null;
  }

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">Campos Personalizados</label>
        {!readOnly && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Plus className="w-3 h-3 mr-1" />
            Editar
          </Button>
        )}
      </div>

      {hasTemplates && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Plantillas aplicables:</strong> {applicableTemplates.map(t => t.name).join(', ')}
          </p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          {/* Existing fields editor */}
          {fields.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">Campos existentes:</p>
              {fields.map(field => {
                const template = templateFields.find(f => f.key === field.key);
                return (
                  <div key={field.key} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-medium text-gray-600">{field.key}</label>
                      {template && (
                        <p className="text-xs text-gray-500 mb-1">{template.label}</p>
                      )}
                      <Input
                        value={field.value}
                        onChange={(e) => handleUpdateField(field.key, e.target.value)}
                        placeholder={template?.label || field.key}
                        type={template?.type === 'email' ? 'email' : template?.type === 'number' ? 'number' : 'text'}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveField(field.key)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Missing fields from templates */}
          {missingFields.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2 items-start mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Hay {missingFields.length} campos pendientes en las plantillas
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleAddMissingFields}
                    className="text-yellow-700 p-0 mt-1"
                  >
                    Agregar campos pendientes
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Additional fields if templates support custom ones */}
          {hasTemplates && (
            <div className="pt-3 border-t">
              <p className="text-xs font-medium text-gray-600 mb-2">Otros campos disponibles:</p>
              <div className="space-y-2">
                {templateFields
                  .filter(f => !customFieldKeys.includes(f.key))
                  .map(field => (
                    <Button
                      key={field.key}
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateField(field.key, '')}
                      className="w-full justify-start"
                    >
                      <Plus className="w-3 h-3 mr-2" />
                      {field.label}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setFields(useCase.custom_fields || []);
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        // Read-only view
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.length > 0 ? (
            fields.map(field => (
              <div key={field.key} className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{field.key}</span>
                <p className="text-gray-600 text-sm mt-1">{field.value || '(vacío)'}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 col-span-full">
              No hay campos personalizados configurados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
