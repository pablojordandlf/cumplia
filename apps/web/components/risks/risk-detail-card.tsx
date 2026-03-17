// components/risks/risk-detail-card.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Save, 
  AlertTriangle,
  CheckCircle,
  Shield,
  AlertCircle,
  Calendar,
  User,
  FileText,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  AISystemRisk, 
  RiskStatus, 
  RiskLevel,
  RISK_STATUS_CONFIG,
  RISK_LEVEL_CONFIG,
  calculateResidualRisk,
  getRiskLevelFromScore
} from '@/types/risk-management';

interface RiskDetailCardProps {
  risk: AISystemRisk;
  aiSystemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRiskUpdated: (risk: AISystemRisk) => void;
}

export function RiskDetailCard({ 
  risk, 
  aiSystemId,
  open, 
  onOpenChange,
  onRiskUpdated
}: RiskDetailCardProps) {
  const [loading, setLoading] = useState(false);
  const [editedRisk, setEditedRisk] = useState<AISystemRisk>(risk);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/ai-systems/${aiSystemId}/risks/${risk.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: editedRisk.status,
            probability: editedRisk.probability,
            impact: editedRisk.impact,
            mitigation_measures: editedRisk.mitigation_measures,
            responsible_person: editedRisk.responsible_person,
            due_date: editedRisk.due_date,
            notes: editedRisk.notes
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update risk');
      }

      const data = await response.json();
      onRiskUpdated(data.risk);
      toast({
        title: 'Riesgo actualizado',
        description: 'Los cambios han sido guardados correctamente'
      });
    } catch (error) {
      console.error('Error updating risk:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar el riesgo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProbabilityChange = (value: RiskLevel) => {
    const newScore = calculateResidualRisk(value, editedRisk.impact);
    setEditedRisk(prev => ({
      ...prev,
      probability: value,
      residual_risk_score: newScore
    }));
  };

  const handleImpactChange = (value: RiskLevel) => {
    const newScore = calculateResidualRisk(editedRisk.probability, value);
    setEditedRisk(prev => ({
      ...prev,
      impact: value,
      residual_risk_score: newScore
    }));
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 8) return 'text-red-600';
    if (score >= 5) return 'text-orange-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  const catalogRisk = risk.catalog_risk;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono">#{catalogRisk?.risk_number}</span>
            <span>{catalogRisk?.name}</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Risk Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Información del Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant="outline" 
                    className={getCriticalityColor(catalogRisk?.criticality || '')}
                  >
                    Criticidad: {catalogRisk?.criticality === 'critical' ? 'Crítica' :
                                catalogRisk?.criticality === 'high' ? 'Alta' :
                                catalogRisk?.criticality === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <Badge variant="outline">{catalogRisk?.domain}</Badge>
                  <Badge variant="outline">{catalogRisk?.ai_act_article}</Badge>
                  <Badge variant="outline">
                    {catalogRisk?.timing === 'pre-deployment' ? 'Pre-despliegue' :
                     catalogRisk?.timing === 'post-deployment' ? 'Post-despliegue' : 'Ambos'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {catalogRisk?.description}
                </p>
              </CardContent>
            </Card>

            {/* Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Evaluación del Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select 
                      value={editedRisk.status} 
                      onValueChange={(value: RiskStatus) => 
                        setEditedRisk(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="identified">Identificado</SelectItem>
                        <SelectItem value="assessed">Evaluado</SelectItem>
                        <SelectItem value="mitigated">Mitigado</SelectItem>
                        <SelectItem value="accepted">Aceptado</SelectItem>
                        <SelectItem value="not_applicable">No Aplicable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Riesgo Residual</Label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted">
                      <span className={`text-lg font-bold ${getRiskScoreColor(editedRisk.residual_risk_score)}`}>
                        {editedRisk.residual_risk_score || '-'}/10
                      </span>
                      {editedRisk.residual_risk_score && (
                        <Badge variant="outline">
                          {getRiskLevelFromScore(editedRisk.residual_risk_score)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probabilidad</Label>
                    <Select 
                      value={editedRisk.probability || ''} 
                      onValueChange={handleProbabilityChange}
                    >
                      <SelectTrigger id="probability">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impact">Impacto</Label>
                    <Select 
                      value={editedRisk.impact || ''} 
                      onValueChange={handleImpactChange}
                    >
                      <SelectTrigger id="impact">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Bajo</SelectItem>
                        <SelectItem value="medium">Medio</SelectItem>
                        <SelectItem value="high">Alto</SelectItem>
                        <SelectItem value="critical">Crítico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mitigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Mitigación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mitigation">Medidas de Mitigación</Label>
                  <Textarea
                    id="mitigation"
                    placeholder="Describe las medidas implementadas o planificadas para mitigar este riesgo..."
                    value={editedRisk.mitigation_measures || ''}
                    onChange={(e) => setEditedRisk(prev => ({ 
                      ...prev, 
                      mitigation_measures: e.target.value 
                    }))}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsible" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Responsable
                    </Label>
                    <Input
                      id="responsible"
                      placeholder="Nombre del responsable"
                      value={editedRisk.responsible_person || ''}
                      onChange={(e) => setEditedRisk(prev => ({ 
                        ...prev, 
                        responsible_person: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Límite
                    </Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={editedRisk.due_date || ''}
                      onChange={(e) => setEditedRisk(prev => ({ 
                        ...prev, 
                        due_date: e.target.value 
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notas Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Notas, comentarios o evidencia adicional..."
                  value={editedRisk.notes || ''}
                  onChange={(e) => setEditedRisk(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
