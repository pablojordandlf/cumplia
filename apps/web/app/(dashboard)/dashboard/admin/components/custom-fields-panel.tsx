'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, FormInput, Text, Hash, Link, Mail, AlignLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner'
import { useCustomFieldTemplates } from '@/hooks/use-custom-field-templates';
import { CustomFieldTemplate } from '@/types/custom-fields';
import { CreateCustomFieldDialog } from './create-custom-field-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const FIELD_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  text: Text,
  textarea: AlignLeft,
  url: Link,
  email: Mail,
  number: Hash,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  textarea: 'Texto Largo',
  url: 'URL',
  email: 'Email',
  number: 'Número',
};

const APPLIES_TO_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  global: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', label: 'Todos' },
  high_risk: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'Alto Riesgo' },
  limited_risk: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', label: 'Riesgo Limitado' },
  minimal_risk: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', label: 'Riesgo Mínimo' },
  prohibited: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', label: 'Prohibido' },
  gpai_model: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', label: 'GPAI Model' },
  gpai_system: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', label: 'GPAI System' },
  gpai_sr: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', label: 'GPAI-SR' },
  unclassified: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', label: 'Por Clasificar' },
};

export function CustomFieldsPanel() {
  const { templates, loading, updateTemplate, deleteTemplate } = useCustomFieldTemplates();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<CustomFieldTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<CustomFieldTemplate | null>(null);

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await updateTemplate(id, { is_active: isActive });
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    const success = await deleteTemplate(templateToDelete.id);
    if (success) {
      setTemplateToDelete(null);
    }
  };

  const handleEdit = (template: CustomFieldTemplate) => {
    setTemplateToEdit(template);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setTemplateToEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mis Plantillas de Campos</h2>
          <p className="text-gray-500 text-sm">
            Define campos adicionales personalizados para recopilar información específica según el nivel de riesgo
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Crear Template
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FormInput className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center mb-4">
              No tienes templates de campos personalizados
            </p>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear tu primer template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const appliesTo = template.applies_to_levels || [template.applies_to || 'global'];
            const primaryLevel = appliesTo[0];
            const colors = APPLIES_TO_COLORS[primaryLevel] || APPLIES_TO_COLORS.global;
            
            return (
              <Card key={template.id} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <FormInput className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        {template.description && (
                          <CardDescription className="line-clamp-1">
                            {template.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Display all applicable levels as badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {appliesTo.map((level) => {
                      const levelColors = APPLIES_TO_COLORS[level] || APPLIES_TO_COLORS.global;
                      return (
                        <Badge 
                          key={level} 
                          variant="outline" 
                          className={`${levelColors.bg} ${levelColors.text} ${levelColors.border}`}
                        >
                          {levelColors.label}
                        </Badge>
                      );
                    })}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Campos ({template.field_definitions.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {template.field_definitions.slice(0, 3).map((field) => {
                          const Icon = FIELD_TYPE_ICONS[field.type] || Text;
                          return (
                            <Badge key={field.id} variant="outline" className="flex items-center gap-1">
                              <Icon className="w-3 h-3" />
                              {field.label}
                            </Badge>
                          );
                        })}
                        {template.field_definitions.length > 3 && (
                          <Badge variant="outline">+{template.field_definitions.length - 3} más</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => handleToggleActive(template.id, checked)}
                        />
                        <span className="text-sm text-gray-500">
                          {template.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTemplateToDelete(template)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateCustomFieldDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        templateToEdit={templateToEdit}
      />

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se desactivará permanentemente el template
              <strong>{templateToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}