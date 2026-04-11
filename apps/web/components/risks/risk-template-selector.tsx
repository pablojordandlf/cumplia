// components/risks/risk-template-selector.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  ShieldCheck, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  List,
  Info
} from 'lucide-react';
import { toast } from 'sonner'
import { RiskTemplate, RiskTemplateWithItems, AISystemRisk } from '@/types/risk-management';

interface RiskTemplateSelectorProps {
  aiSystemId: string;
  aiActLevel: string;
  onTemplateApplied: (risks: AISystemRisk[]) => void;
}

const TEMPLATE_DESCRIPTIONS: Record<string, { icon: React.ReactNode; description: string }> = {
  high_risk: {
    icon: <ShieldCheck className="h-5 w-5 text-red-600" />,
    description: 'Catálogo completo con los 50 riesgos del MIT AI Risk Repository. Requerido para cumplir con el Artículo 9 del AI Act.'
  },
  limited_risk: {
    icon: <Shield className="h-5 w-5 text-yellow-600" />,
    description: 'Catálogo reducido con los 15 riesgos prioritarios recomendados para sistemas de riesgo limitado.'
  },
  minimal_risk: {
    icon: <AlertTriangle className="h-5 w-5 text-[#E8FF47]" />,
    description: 'Catálogo básico opcional para documentación voluntaria de sistemas de riesgo mínimo.'
  }
};

export function RiskTemplateSelector({ 
  aiSystemId, 
  aiActLevel, 
  onTemplateApplied 
}: RiskTemplateSelectorProps) {
  const [templates, setTemplates] = useState<RiskTemplateWithItems[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [aiActLevel]);

  const fetchTemplates = async () => {
    try {
      setFetchingTemplates(true);
      const response = await fetch(`/api/v1/risks/templates?ai_act_level=${aiActLevel}`);
      
      if (!response.ok) throw new Error('Failed to fetch templates');
      
      const data = await response.json();
      // Include both system and custom templates that are active
      const allTemplates = data.templates?.filter((t: RiskTemplate) => 
        t.is_active !== false
      ) || [];
      
      // Sort: system templates first, then custom templates by name
      const sortedTemplates = allTemplates.sort((a: RiskTemplate, b: RiskTemplate) => {
        if (a.is_system !== b.is_system) {
          return b.is_system ? 1 : -1; // System templates first
        }
        return (a.name || '').localeCompare(b.name || '');
      });
      
      setTemplates(sortedTemplates);
      
      // Auto-select the default template
      const defaultTemplate = sortedTemplates.find((t: RiskTemplate) => t.is_default);
      if (defaultTemplate) {
        setSelectedTemplateId(defaultTemplate.id);
      } else if (sortedTemplates.length > 0) {
        // If no default, select the first (preferred: system template)
        setSelectedTemplateId(sortedTemplates[0].id);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Error', { description: 'No se pudieron cargar las plantillas' });
    } finally {
      setFetchingTemplates(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId) {
      toast.error('Selección requerida', { description: 'Por favor selecciona una plantilla' });
      return;
    }

    setShowConfirmDialog(false);
    setLoading(true);

    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: selectedTemplateId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply template');
      }

      const data = await response.json();
      onTemplateApplied(data.risks || []);
      
      toast.success('Plantilla aplicada', { description: `Se han creado ${data.risks?.length || 0} riesgos para este sistema` });
    } catch (error) {
      console.error('Error applying template:', error);
      const errorMessage = error instanceof Error ? error.message : 'No se pudo aplicar la plantilla';
      
      // Provide more helpful error messages
      let displayMessage = errorMessage;
      if (errorMessage.includes('Not authorized')) {
        displayMessage = 'No tienes permisos para modificar este sistema. Contacta al administrador.';
      } else if (errorMessage.includes('Failed to create')) {
        displayMessage = 'Error al crear los riesgos. Por favor intenta de nuevo.';
      }
      
      toast.error('Error', { description: displayMessage });
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const templateConfig = selectedTemplate 
    ? TEMPLATE_DESCRIPTIONS[selectedTemplate.ai_act_level] 
    : null;

  if (fetchingTemplates) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        value={selectedTemplateId}
        onValueChange={setSelectedTemplateId}
        className="grid gap-4"
      >
        {templates.map((template) => {
          const config = TEMPLATE_DESCRIPTIONS[template.ai_act_level];
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplateId === template.id 
                  ? 'border-primary ring-1 ring-primary' 
                  : 'hover:border-muted-foreground'
              }`}
              onClick={() => setSelectedTemplateId(template.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <RadioGroupItem 
                    value={template.id} 
                    id={template.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {config?.icon}
                      <Label 
                        htmlFor={template.id}
                        className="text-base font-semibold cursor-pointer"
                      >
                        {template.name}
                      </Label>
                      {template.is_default && (
                        <Badge variant="secondary" className="text-xs">
                          Recomendado
                        </Badge>
                      )}
                      {template.is_system && (
                        <Badge variant="outline" className="text-xs">
                          Sistema
                        </Badge>
                      )}
                      {!template.is_system && (
                        <Badge variant="outline" className="text-xs bg-[#FFE8D1]">
                          Personalizado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {config?.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <Badge variant="outline">
                        <List className="h-3 w-3 mr-1" />
                        {template.risk_count} riesgos
                      </Badge>
                      <Badge variant="outline">
                        {template.ai_act_level === 'high_risk' 
                          ? 'Alto Riesgo' 
                          : template.ai_act_level === 'limited_risk'
                            ? 'Riesgo Limitado'
                            : 'Riesgo Mínimo'
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </RadioGroup>

      {selectedTemplate && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Al aplicar esta plantilla se crearán {selectedTemplate.risk_count} riesgos 
            para este sistema. Podrás evaluar y mitigar cada riesgo individualmente después.
          </AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={() => setShowConfirmDialog(true)}
        disabled={!selectedTemplateId || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Aplicando plantilla...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Aplicar Plantilla Seleccionada
          </>
        )}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar aplicación de plantilla</DialogTitle>
            <DialogDescription>
              Esta acción creará {selectedTemplate?.risk_count} riesgos para este sistema 
              basados en la plantilla "{selectedTemplate?.name}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Una vez aplicada, podrás:
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
              <li>Evaluar cada riesgo individualmente (probabilidad e impacto)</li>
              <li>Definir medidas de mitigación</li>
              <li>Asignar responsables y fechas límite</li>
              <li>Seguimiento del estado de cada riesgo</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyTemplate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                'Confirmar y Aplicar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
