'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, FileWarning, Shield, Info, CheckCircle2, Ban, Settings, Target, XCircle, PlusCircle, Power, Copy, MoreVertical } from 'lucide-react';
import { toast } from 'sonner'
import { useRiskTemplates } from '@/hooks/use-risk-templates';
import { RiskTemplateWithItems } from '@/types/risk-management';
import { CreateRiskTemplateDialog } from './create-risk-template-dialog';
import { EditTemplateApplicabilityDialog } from './edit-template-applicability-dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const RISK_LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  prohibited: Ban,
  high_risk: Shield,
  limited_risk: Info,
  minimal_risk: CheckCircle2,
};

const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  prohibited: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  high_risk: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  limited_risk: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  minimal_risk: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
};

const RISK_LEVEL_LABELS: Record<string, string> = {
  prohibited: 'Prohibido',
  high_risk: 'Alto Riesgo',
  limited_risk: 'Riesgo Limitado',
  minimal_risk: 'Riesgo Mínimo',
};

export function RiskTemplatesPanel() {
  const { templates, loading, deleteTemplate, toggleTemplateActive, duplicateTemplate } = useRiskTemplates({ includeSystem: true });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<RiskTemplateWithItems | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<RiskTemplateWithItems | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    const success = await deleteTemplate(templateToDelete.id);
    if (success) {
      toast.success('Plantilla eliminada', { description: `La plantilla "${templateToDelete.name}" ha sido eliminada correctamente.` });
      setTemplateToDelete(null);
    } else {
      toast.error('Error al eliminar', { description: 'No se pudo eliminar la plantilla. Verifica que seas el propietario.' });
    }
  };

  const handleToggleActive = async (template: RiskTemplateWithItems) => {
    const success = await toggleTemplateActive(template.id, !template.is_active);
    if (success) {
      toast.success(template.is_active ? 'Plantilla desactivada' : 'Plantilla activada', { description: `La plantilla "${template.name}" ha sido ${template.is_active ? 'desactivada' : 'activada'}.` });
    }
  };

  const handleDuplicate = async (template: RiskTemplateWithItems) => {
    setDuplicating(template.id);
    try {
      const newTemplate = await duplicateTemplate(template.id);
      if (newTemplate) {
        toast.success('Plantilla duplicada', { description: `La plantilla "${template.name}" ha sido duplicada como "${newTemplate.name}".` });
      } else {
        toast.error('Error al duplicar', { description: 'No se pudo duplicar la plantilla. Verifica que seas el propietario.' });
      }
    } finally {
      setDuplicating(null);
    }
  };

  // Separate system and user templates
  const systemTemplates = templates.filter(t => t.is_system);
  const userTemplates = templates.filter(t => !t.is_system);
  
  // Track which tab is expanded
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const renderTemplateCard = (template: RiskTemplateWithItems, isSystem: boolean) => {
    const colors = RISK_LEVEL_COLORS[template.ai_act_level] || RISK_LEVEL_COLORS.high_risk;
    const Icon = RISK_LEVEL_ICONS[template.ai_act_level] || Shield;
    const riskCount = template.risk_count || template.items?.length || 0;

    return (
      <Card key={template.id} className={`group ${!template.is_active ? 'opacity-60' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colors.bg}`}>
                <Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {isSystem && (
                    <Badge variant="outline" className="text-xs">
                      Sistema
                    </Badge>
                  )}
                  {!template.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactiva
                    </Badge>
                  )}
                </div>
                {template.description && (
                  <CardDescription className="line-clamp-2 mt-1 max-w-md">
                    {template.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTemplateToEdit(template)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar
                  </DropdownMenuItem>
                  {isSystem && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleToggleActive(template)}
                        className={template.is_active ? "text-red-600" : "text-green-600"}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {template.is_active ? 'Desactivar' : 'Activar'}
                      </DropdownMenuItem>
                    </>
                  )}
                  {!isSystem && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => handleDuplicate(template)}
                        disabled={duplicating === template.id}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setTemplateToDelete(template)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Applicability Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Target className="w-4 h-4" />
                Aplicabilidad
              </div>
              
              {/* Applies to levels */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">Niveles:</span>
                {template.applies_to_levels?.length > 0 ? (
                  template.applies_to_levels.map(level => (
                    <Badge key={level} variant="outline" className="text-xs">
                      {RISK_LEVEL_LABELS[level] || level}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    {RISK_LEVEL_LABELS[template.ai_act_level] || template.ai_act_level}
                  </span>
                )}
              </div>

              {/* Exceptions */}
              {(template.excluded_systems?.length > 0 || template.included_systems?.length > 0) && (
                <div className="space-y-2 pt-2">
                  {template.excluded_systems?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-gray-600">
                        {template.excluded_systems.length} sistema(s) excluido(s)
                      </span>
                    </div>
                  )}
                  {template.included_systems?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <PlusCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">
                        {template.included_systems.length} sistema(s) incluido(s)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Risk Count */}
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{riskCount}</span>{' '}
                riesgos incluidos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* System Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Plantillas del Sistema</h2>
            <p className="text-gray-500 text-sm">
              Plantillas preconfiguradas que se aplican automáticamente según el nivel de riesgo AI Act
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
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
        ) : systemTemplates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileWarning className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-center text-sm">
                No hay plantillas del sistema configuradas.
                <br />
                Ejecuta la migración SQL para crear las plantillas por defecto.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {systemTemplates.map(template => renderTemplateCard(template, true))}
          </div>
        )}
      </div>

      {/* User Templates Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Mis Plantillas Personalizadas</h2>
            <p className="text-gray-500 text-sm">
              Crea tus propias plantillas de riesgos para casos de uso específicos
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Plantilla
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
        ) : userTemplates.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileWarning className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-center mb-4">
                No tienes plantillas personalizadas
              </p>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear tu primera plantilla
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTemplates.map(template => renderTemplateCard(template, false))}
          </div>
        )}
      </div>

      <CreateRiskTemplateDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />

      {templateToEdit && (
        <EditTemplateApplicabilityDialog
          template={templateToEdit}
          open={!!templateToEdit}
          onOpenChange={() => setTemplateToEdit(null)}
        />
      )}

      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la plantilla
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
