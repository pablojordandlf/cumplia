'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Pencil, 
  GripVertical, 
  X, 
  FileText,
  LayoutTemplate,
  Globe,
  AlertTriangle,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface FieldDefinition {
  id: string;
  key: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  applies_to: string;
  field_definitions: FieldDefinition[];
  is_active: boolean;
  created_at: string;
}

const riskLevels = [
  { value: 'global', label: 'Todos los casos de uso', icon: Globe, color: 'bg-blue-100 text-blue-800' },
  { value: 'prohibited', label: 'Prohibido', icon: AlertTriangle, color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'Alto Riesgo', icon: ShieldAlert, color: 'bg-orange-100 text-orange-800' },
  { value: 'limited', label: 'Riesgo Limitado', icon: Shield, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'minimal', label: 'Riesgo Mínimo', icon: ShieldCheck, color: 'bg-green-100 text-green-800' },
  { value: 'gpai', label: 'GPAI', icon: Brain, color: 'bg-purple-100 text-purple-800' },
  { value: 'unclassified', label: 'Sin clasificar', icon: FileText, color: 'bg-gray-100 text-gray-800' },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [appliesTo, setAppliesTo] = useState('global');
  const [fieldDefinitions, setFieldDefinitions] = useState<FieldDefinition[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('custom_field_templates')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setTemplateName('');
    setTemplateDescription('');
    setAppliesTo('global');
    setFieldDefinitions([]);
    setNewFieldKey('');
    setEditingTemplate(null);
  }

  function openCreateDialog() {
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(template: Template) {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplateDescription(template.description || '');
    setAppliesTo(template.applies_to);
    setFieldDefinitions(template.field_definitions || []);
    setIsDialogOpen(true);
  }

  function addFieldDefinition() {
    if (!newFieldKey.trim()) {
      toast({ title: 'Error', description: 'El nombre del campo es obligatorio', variant: 'destructive' });
      return;
    }

    const newField: FieldDefinition = {
      id: crypto.randomUUID(),
      key: newFieldKey.trim()
    };

    setFieldDefinitions([...fieldDefinitions, newField]);
    setNewFieldKey('');
  }

  function removeFieldDefinition(fieldId: string) {
    setFieldDefinitions(fieldDefinitions.filter(f => f.id !== fieldId));
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      toast({ title: 'Error', description: 'El nombre de la plantilla es obligatorio', variant: 'destructive' });
      return;
    }

    if (fieldDefinitions.length === 0) {
      toast({ title: 'Error', description: 'Añade al menos un campo a la plantilla', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast({ title: 'Error', description: 'Sesión no válida', variant: 'destructive' });
        return;
      }

      const templateData = {
        user_id: session.user.id,
        name: templateName.trim(),
        description: templateDescription.trim() || null,
        applies_to: appliesTo,
        field_definitions: fieldDefinitions,
        is_active: true,
      };

      if (editingTemplate) {
        // Update existing
        const { error } = await supabase
          .from('custom_field_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast({ title: 'Plantilla actualizada', description: 'Los cambios se han guardado correctamente.' });
      } else {
        // Create new
        const { error } = await supabase
          .from('custom_field_templates')
          .insert(templateData);

        if (error) throw error;
        toast({ title: 'Plantilla creada', description: 'La plantilla se ha creado correctamente.' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(templateId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no afecta a los casos de uso existentes.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_field_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;
      toast({ title: 'Plantilla eliminada', description: 'La plantilla se ha eliminado correctamente.' });
      loadTemplates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  function getRiskLevelInfo(value: string) {
    return riskLevels.find(r => r.value === value) || riskLevels[0];
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutTemplate className="w-7 h-7 text-blue-600" />
                Plantillas de Campos
              </h1>
              <p className="text-gray-600 text-sm">
                Define plantillas de campos personalizados que se aplicarán automáticamente a los casos de uso
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Plantilla
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <LayoutTemplate className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">¿Cómo funcionan las plantillas?</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Las plantillas permiten definir campos personalizados que se aplican automáticamente a los casos de uso. 
                  Puedes crear plantillas que apliquen a todos los casos de uso o solo a los de un nivel de riesgo específico. 
                  Los campos definidos en las plantillas aparecerán vacíos en cada caso de uso, listos para ser rellenados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        {templates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <LayoutTemplate className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas</h3>
              <p className="text-gray-600 mb-4">
                Crea tu primera plantilla para automatizar los campos personalizados en tus casos de uso.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Plantilla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const riskInfo = getRiskLevelInfo(template.applies_to);
              const RiskIcon = riskInfo.icon;
              
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(template)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={riskInfo.color}>
                        <RiskIcon className="w-3 h-3 mr-1" />
                        {riskInfo.label}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {template.field_definitions.length} campo{template.field_definitions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {/* Preview fields */}
                    <div className="space-y-1">
                      {template.field_definitions.slice(0, 3).map((field) => (
                        <div key={field.id} className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText className="w-3 h-3" />
                          {field.key}
                        </div>
                      ))}
                      {template.field_definitions.length > 3 && (
                        <p className="text-sm text-gray-400 italic">
                          +{template.field_definitions.length - 3} más...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </DialogTitle>
              <DialogDescription>
                Define los campos que se añadirán automáticamente a los casos de uso.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Template Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la plantilla *</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ej: Plantilla para sistemas de Alto Riesgo"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Descripción opcional de la plantilla..."
                  rows={2}
                />
              </div>

              {/* Applies To */}
              <div className="space-y-2">
                <Label>Aplica a *</Label>
                <Select value={appliesTo} onValueChange={setAppliesTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <level.icon className="w-4 h-4" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Esta plantilla se aplicará automáticamente a los casos de uso que coincidan con este criterio.
                </p>
              </div>

              {/* Field Definitions */}
              <div className="space-y-3">
                <Label>Campos de la plantilla *</Label>
                
                {/* Add field */}
                <div className="flex gap-2">
                  <Input
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    placeholder="Nombre del campo (ej: Responsable, URL...)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFieldDefinition();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={addFieldDefinition}
                    disabled={!newFieldKey.trim()}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Fields list */}
                <div className="space-y-2">
                  {fieldDefinitions.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg text-gray-500 text-sm">
                      No hay campos definidos. Añade campos arriba.
                    </div>
                  ) : (
                    fieldDefinitions.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{field.key}</span>
                          <span className="text-xs text-gray-400">(vacío por defecto)</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFieldDefinition(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={saveTemplate}
                disabled={saving || !templateName.trim() || fieldDefinitions.length === 0}
              >
                {saving ? 'Guardando...' : editingTemplate ? 'Guardar cambios' : 'Crear plantilla'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
