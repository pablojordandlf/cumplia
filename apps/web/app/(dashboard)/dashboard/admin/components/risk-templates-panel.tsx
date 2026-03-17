'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, FileWarning, Shield, AlertTriangle, Info, CheckCircle2, Ban, Brain, Bot, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRiskTemplates } from '@/hooks/use-risk-templates';
import { RiskTemplateWithItems } from '@/types/risk-management';
import { CreateRiskTemplateDialog } from './create-risk-template-dialog';
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

const RISK_LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  high_risk: Shield,
  limited_risk: Info,
  minimal_risk: CheckCircle2,
  prohibited: Ban,
  gpai_model: Brain,
  gpai_system: Bot,
  gpai_sr: Sparkles,
  unclassified: AlertTriangle,
};

const RISK_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high_risk: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  limited_risk: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  minimal_risk: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  prohibited: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
  gpai_model: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  gpai_system: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
  gpai_sr: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  unclassified: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

const RISK_LEVEL_LABELS: Record<string, string> = {
  high_risk: 'Alto Riesgo',
  limited_risk: 'Riesgo Limitado',
  minimal_risk: 'Riesgo Mínimo',
  prohibited: 'Prohibido',
  gpai_model: 'GPAI Model',
  gpai_system: 'GPAI System',
  gpai_sr: 'GPAI-SR',
  unclassified: 'Por Clasificar',
};

export function RiskTemplatesPanel() {
  const { templates, loading, deleteTemplate } = useRiskTemplates({ includeSystem: false });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<RiskTemplateWithItems | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    const success = await deleteTemplate(templateToDelete.id);
    if (success) {
      setTemplateToDelete(null);
    }
  };

  const userTemplates = templates.filter(t => !t.is_system);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Mis Plantillas de Riesgos</h2>
          <p className="text-gray-500 text-sm">
            Crea y gestiona tus propias plantillas de riesgos para reutilizar en tus sistemas de IA
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
          {userTemplates.map((template) => {
            const colors = RISK_LEVEL_COLORS[template.ai_act_level] || RISK_LEVEL_COLORS.unclassified;
            const Icon = RISK_LEVEL_ICONS[template.ai_act_level] || AlertTriangle;
            
            return (
              <Card key={template.id} className="group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
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
                    <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                      {RISK_LEVEL_LABELS[template.ai_act_level] || template.ai_act_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{template.risk_count || template.items?.length || 0}</span>{' '}
                      riesgos incluidos
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: 'Próximamente',
                            description: 'La edición de plantillas estará disponible pronto',
                          });
                        }}
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateRiskTemplateDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />

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