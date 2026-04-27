'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Plus,
  Copy,
  Trash2,
  Star,
  MoreVertical,
  Lock,
  FileText,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRiaTemplates } from '@/hooks/use-ria-templates';
import { CreateRiaTemplateDialog } from './create-ria-template-dialog';
import { RiaTemplateEditor } from './ria-template-editor';
import type { RiaFormTemplate, RiaFormStructure } from '@/types/ria-form-template';

export function RiaFormPanel() {
  const { templates, isLoading, error, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, setDefaultTemplate } =
    useRiaTemplates();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<RiaFormTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<RiaFormTemplate | null>(null);

  const handleCreate = async (name: string, description: string, sourceId: string) => {
    try {
      await createTemplate({ name, description, source_template_id: sourceId, structure: undefined as never, classification_rules: undefined as never });
      toast.success('Plantilla creada', { description: `"${name}" ha sido creada correctamente.` });
    } catch (err) {
      toast.error('Error al crear', { description: err instanceof Error ? err.message : 'Error desconocido' });
      throw err;
    }
  };

  const handleDuplicate = async (template: RiaFormTemplate) => {
    try {
      const name = `${template.name} (copia)`;
      await duplicateTemplate(template.id, name);
      toast.success('Plantilla duplicada', { description: `"${name}" ha sido creada.` });
    } catch (err) {
      toast.error('Error al duplicar', { description: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  const handleSetDefault = async (template: RiaFormTemplate) => {
    try {
      await setDefaultTemplate(template.id);
      toast.success('Plantilla predeterminada', { description: `"${template.name}" es ahora la plantilla por defecto.` });
    } catch (err) {
      toast.error('Error', { description: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate(templateToDelete.id);
      toast.success('Plantilla eliminada', { description: `"${templateToDelete.name}" ha sido eliminada.` });
      setTemplateToDelete(null);
    } catch (err) {
      toast.error('Error al eliminar', { description: err instanceof Error ? err.message : 'Error desconocido' });
    }
  };

  const handleSaveStructure = async (structure: RiaFormStructure) => {
    if (!editingTemplate) return;
    await updateTemplate(editingTemplate.id, { structure });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const systemTemplate = templates.find((t) => t.is_system);
  const customTemplates = templates.filter((t) => !t.is_system);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Plantillas de Formulario RIA</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Gestiona las plantillas del formulario de evaluación de impacto.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nueva plantilla
        </Button>
      </div>

      {systemTemplate && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide">Plantilla del sistema</p>
          <TemplateCard
            template={systemTemplate}
            onDuplicate={handleDuplicate}
            onSetDefault={handleSetDefault}
            onEdit={setEditingTemplate}
            onDelete={setTemplateToDelete}
          />
        </div>
      )}

      {customTemplates.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-gray-400 tracking-wide">Plantillas personalizadas</p>
          {customTemplates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onDuplicate={handleDuplicate}
              onSetDefault={handleSetDefault}
              onEdit={setEditingTemplate}
              onDelete={setTemplateToDelete}
            />
          ))}
        </div>
      )}

      {customTemplates.length === 0 && !isLoading && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No tienes plantillas personalizadas.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Crea una basándote en la plantilla del sistema o en cualquier otra existente.
            </p>
          </CardContent>
        </Card>
      )}

      <CreateRiaTemplateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        templates={templates}
        onConfirm={handleCreate}
      />

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente <strong>{templateToDelete?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          {editingTemplate && (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle>Editar plantilla</SheetTitle>
                <SheetDescription>{editingTemplate.name}</SheetDescription>
              </SheetHeader>
              <RiaTemplateEditor
                template={editingTemplate}
                onSave={handleSaveStructure}
              />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface TemplateCardProps {
  template: RiaFormTemplate;
  onDuplicate: (t: RiaFormTemplate) => void;
  onSetDefault: (t: RiaFormTemplate) => void;
  onEdit: (t: RiaFormTemplate) => void;
  onDelete: (t: RiaFormTemplate) => void;
}

function TemplateCard({ template, onDuplicate, onSetDefault, onEdit, onDelete }: TemplateCardProps) {
  const stepCount = template.structure?.steps?.length ?? 0;
  const questionCount = template.structure?.steps?.reduce(
    (acc, step) =>
      acc + (step.sections?.reduce((a, s) => a + s.questions.length, 0) ?? 0),
    0
  ) ?? 0;

  return (
    <Card className={template.is_default ? 'border-blue-200 bg-blue-50/30' : ''}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-base">{template.name}</CardTitle>
              {template.is_system && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Lock className="w-3 h-3" />
                  Sistema
                </Badge>
              )}
              {template.is_default && (
                <Badge className="text-xs gap-1 bg-blue-600">
                  <Star className="w-3 h-3" />
                  Por defecto
                </Badge>
              )}
            </div>
            {template.description && (
              <CardDescription className="mt-0.5 text-xs">{template.description}</CardDescription>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {stepCount} pasos · {questionCount} preguntas
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!template.is_system && (
                <>
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Editar estructura
                  </DropdownMenuItem>
                  {!template.is_default && (
                    <DropdownMenuItem onClick={() => onSetDefault(template)}>
                      <Star className="w-4 h-4 mr-2" />
                      Establecer como predeterminada
                    </DropdownMenuItem>
                  )}
                </>
              )}
              <DropdownMenuItem onClick={() => onDuplicate(template)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              {!template.is_system && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(template)}
                    disabled={template.is_default}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
}
