'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Text, AlignLeft, Link, Mail, Hash, FormInput, AlertCircle } from 'lucide-react';
import { toast } from 'sonner'
import { useCustomFieldTemplates } from '@/hooks/use-custom-field-templates';
import { CustomFieldTemplate, CustomFieldDefinition } from '@/types/custom-fields';

interface CreateCustomFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateToEdit?: CustomFieldTemplate | null;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto', icon: Text },
  { value: 'textarea', label: 'Texto Largo', icon: AlignLeft },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'number', label: 'Número', icon: Hash },
];

const APPLIES_TO_OPTIONS = [
  { value: 'global', label: 'Todos los niveles' },
  { value: 'prohibited', label: 'Prohibido' },
  { value: 'high_risk', label: 'Alto Riesgo' },
  { value: 'limited_risk', label: 'Riesgo Limitado' },
  { value: 'minimal_risk', label: 'Riesgo Mínimo' },
];

// Generate a safe key from label
function generateKey(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function CreateCustomFieldDialog({ 
  open, 
  onOpenChange, 
  templateToEdit 
}: CreateCustomFieldDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appliesTo, setAppliesTo] = useState<string[]>([]);
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [submitting, setSubmitting] = useState(false);
  
  const { createTemplate, updateTemplate } = useCustomFieldTemplates({ autoFetch: false });
  const isEditing = !!templateToEdit;

  useEffect(() => {
    if (open && templateToEdit) {
      setName(templateToEdit.name);
      setDescription(templateToEdit.description || '');
      setAppliesTo(templateToEdit.applies_to_levels || [templateToEdit.applies_to || 'global']);
      setFields(templateToEdit.field_definitions);
    } else if (open) {
      // Reset form
      setName('');
      setDescription('');
      setAppliesTo(['global']);
      setFields([]);
      setNewFieldLabel('');
      setNewFieldType('text');
    }
  }, [open, templateToEdit]);

  const addField = () => {
    if (!newFieldLabel.trim()) {
      toast.error('Etiqueta requerida', { description: 'Por favor introduce un nombre para el campo' });
      return;
    }

    const key = generateKey(newFieldLabel);
    
    // Check for duplicate keys
    if (fields.some(f => f.key === key)) {
      toast.error('Campo duplicado', { description: 'Ya existe un campo con ese nombre' });
      return;
    }

    const newField: CustomFieldDefinition = {
      id: crypto.randomUUID(),
      key,
      label: newFieldLabel.trim(),
      type: newFieldType as 'text' | 'textarea' | 'url' | 'email' | 'number',
    };

    setFields([...fields, newField]);
    setNewFieldLabel('');
    setNewFieldType('text');
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newFields = [...fields];
      [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
      setFields(newFields);
    } else if (direction === 'down' && index < fields.length - 1) {
      const newFields = [...fields];
      [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
      setFields(newFields);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Nombre requerido', { description: 'Por favor introduce un nombre para el template' });
      return;
    }

    if (!appliesTo || appliesTo.length === 0) {
      toast.error('Nivel requerido', { description: 'Por favor selecciona al menos un nivel de riesgo' });
      return;
    }

    if (fields.length === 0) {
      toast.error('Campos requeridos', { description: 'Por favor añade al menos un campo' });
      return;
    }

    setSubmitting(true);

    let success;
    if (isEditing && templateToEdit) {
      success = await updateTemplate(templateToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        applies_to_levels: appliesTo as any,
        field_definitions: fields,
      });
    } else {
      const result = await createTemplate({
        name: name.trim(),
        description: description.trim() || undefined,
        applies_to_levels: appliesTo as any,
        field_definitions: fields,
      });
      success = !!result;
    }

    setSubmitting(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Template de Campos' : 'Crear Template de Campos'}
          </DialogTitle>
          <DialogDescription>
            Define campos personalizados para recopilar información adicional en tus sistemas de IA.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre * </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Información de Responsables"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de este template..."
                rows={2}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label>Aplica a * </Label>
                <p className="text-xs text-gray-500 mt-1">Selecciona uno o más niveles de riesgo</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                {appliesTo.includes('global') && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded flex gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Si seleccionas "Todos", se deseleccionarán los demás</p>
                    </div>
                  </div>
                )}
                
                {APPLIES_TO_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center gap-3">
                    <Checkbox
                      id={`applies-to-${option.value}`}
                      checked={appliesTo.includes(option.value)}
                      onCheckedChange={(checked) => {
                        if (option.value === 'global') {
                          // If selecting "global", deselect others
                          setAppliesTo(checked ? ['global'] : []);
                        } else {
                          // Remove "global" if selecting specific levels
                          let newValues = appliesTo.filter(v => v !== 'global');
                          if (checked) {
                            newValues = [...newValues, option.value];
                          } else {
                            newValues = newValues.filter(v => v !== option.value);
                          }
                          setAppliesTo(newValues);
                        }
                      }}
                    />
                    <Label
                      htmlFor={`applies-to-${option.value}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              
              {appliesTo.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {appliesTo.map((level) => (
                    <Badge key={level} variant="secondary">
                      {APPLIES_TO_OPTIONS.find(o => o.value === level)?.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-4 border-t pt-4">
            <Label>Campos ({fields.length}) * </Label>

            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const Icon = FIELD_TYPES.find(t => t.value === field.type)?.icon || Text;
                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <span className="font-medium">{field.label}</span>
                          <span className="text-xs text-gray-400 ml-2">({field.key})</span>
                        </div>
                        <Badge variant="outline">{FIELD_TYPES.find(t => t.value === field.type)?.label}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(index, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveField(index, 'down')}
                          disabled={index === fields.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Field */}
            <div className="flex items-end gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label className="text-sm">Nuevo campo </Label>
                <Input
                  placeholder="Nombre del campo (ej: Responsable Legal)"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addField();
                    }
                  }}
                />
              </div>
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addField}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || fields.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              isEditing ? 'Guardar Cambios' : `Crear Template (${fields.length} campos)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}