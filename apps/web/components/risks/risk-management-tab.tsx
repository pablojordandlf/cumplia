// components/risks/risk-management-tab.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  ShieldCheck,
  Shield,
  AlertCircle,
  Lock,
  Plus,
  Eye
} from 'lucide-react';
import { 
  AISystemRisk, 
  RiskManagementStatus, 
  AI_ACT_RISK_CONFIG,
  getRiskManagementStatus 
} from '@/types/risk-management';
import { RiskRegistry } from './risk-registry';
import { RiskMatrix } from './risk-matrix';
import { RiskTemplateSelector } from './risk-template-selector';
import { RiskProgressIndicator } from './risk-progress-indicator';
import { AddCustomRiskDialog } from './add-custom-risk-dialog';
import { RiskAnalysisToggleSimple } from './risk-analysis-toggle-simple';

interface RiskManagementTabProps {
  aiSystemId: string;
  aiActLevel: string;
  isReadOnly?: boolean;
  systemName?: string;
  riskAnalysisCompleted?: boolean;
}

export function RiskManagementTab({ 
  aiSystemId, 
  aiActLevel, 
  isReadOnly = false,
  systemName = 'Sistema sin nombre',
  riskAnalysisCompleted = false
}: RiskManagementTabProps) {
  const [risks, setRisks] = useState<AISystemRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<RiskManagementStatus | null>(null);
  const [activeTab, setActiveTab] = useState('registry');
  const [showAddRiskDialog, setShowAddRiskDialog] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(riskAnalysisCompleted);
  const { toast } = useToast();

  const config = AI_ACT_RISK_CONFIG[aiActLevel] || AI_ACT_RISK_CONFIG.unclassified;

  useEffect(() => {
    fetchRisks();
  }, [aiSystemId]);

  useEffect(() => {
    if (risks.length > 0 || aiActLevel) {
      setStatus(getRiskManagementStatus(aiActLevel, risks));
    }
  }, [risks, aiActLevel]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data.risks || []);
    } catch (error) {
      console.error('Error fetching risks:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los riesgos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateApplied = (newRisks: AISystemRisk[]) => {
    setRisks(newRisks);
    toast({
      title: 'Template aplicado',
      description: `Se han creado ${newRisks.length} riesgos para este sistema`
    });
  };

  const handleRiskUpdated = (updatedRisk: AISystemRisk) => {
    setRisks(prev => prev.map(r => r.id === updatedRisk.id ? updatedRisk : r));
  };

  const handleRiskDeleted = (riskId: string) => {
    setRisks(prev => prev.filter(r => r.id !== riskId));
  };

  // Render blocked state for prohibited systems
  if (aiActLevel === 'prohibited') {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Sistema No Desplegable
            </h3>
            <p className="text-red-700 max-w-md">
              Según el Artículo 5 del AI Act, este sistema de IA pertenece a la categoría 
              de prácticas prohibidas y no puede ser desplegado en la UE.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Analysis Toggle - Top */}
      {risks.length > 0 && !isReadOnly && (
        <RiskAnalysisToggleSimple
          systemId={aiSystemId}
          systemName={systemName}
          aiActLevel={aiActLevel}
          hasApplicableFactors={risks.some(r => r.applicable === true)}
          isCompleted={analysisCompleted}
          onCompletionChange={setAnalysisCompleted}
        />
      )}

      {/* Status Alert */}
      {status && (
        <Alert variant={status.required && status.completion_percentage < 100 ? 'destructive' : 'default'}>
          <div className="flex items-start gap-3">
            {status.blocked ? (
              <Lock className="h-5 w-5" />
            ) : status.required ? (
              status.completion_percentage === 100 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )
            ) : (
              <Shield className="h-5 w-5" />
            )}
            <div className="flex-1">
              <AlertDescription className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{config.label}:</span>
                <Badge 
                  variant={
                    status.badge === 'required' || status.badge === 'incomplete' 
                      ? 'destructive' 
                      : status.badge === 'complete' 
                        ? 'default' 
                        : 'secondary'
                  }
                >
                  {status.message}
                </Badge>
              </AlertDescription>
              {status.required && status.critical_open > 0 && (
                <p className="text-sm mt-2 text-red-600">
                  ⚠️ {status.critical_open} riesgo(s) crítico(s) pendiente(s) de mitigación
                </p>
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Progress Indicator */}
      {risks.length > 0 && status && (
        <RiskProgressIndicator 
          total={status.total_risks}
          assessed={status.assessed_risks}
          mitigated={status.mitigated_risks}
          completionPercentage={status.completion_percentage}
        />
      )}

      {/* Template Selector (only if no risks yet AND not read-only) */}
      {risks.length === 0 && !isReadOnly && (
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Gestión de Riesgos</CardTitle>
            <CardDescription>
              Selecciona una plantilla para comenzar el registro de riesgos de este sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskTemplateSelector 
              aiSystemId={aiSystemId}
              aiActLevel={aiActLevel}
              onTemplateApplied={handleTemplateApplied}
            />
          </CardContent>
        </Card>
      )}

      {/* Read-only notice when no risks */}
      {risks.length === 0 && isReadOnly && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-blue-100 p-4 mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Sin Riesgos Registrados
              </h3>
              <p className="text-blue-700 max-w-md">
                Este sistema de IA aún no tiene riesgos registrados. 
                Contacta a un administrador para iniciar la gestión de riesgos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Management Tabs */}
      {risks.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between gap-4">
            <TabsList className="grid flex-1 grid-cols-2 max-w-md">
              <TabsTrigger value="registry">Registro de Riesgos</TabsTrigger>
              <TabsTrigger value="matrix">Matriz de Riesgos</TabsTrigger>
            </TabsList>
            {!isReadOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddRiskDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Riesgos
              </Button>
            )}
          </div>
          
          <TabsContent value="registry" className="mt-4">
            <RiskRegistry 
              risks={risks}
              aiSystemId={aiSystemId}
              aiActLevel={aiActLevel}
              onRiskUpdated={handleRiskUpdated}
              onRiskDeleted={handleRiskDeleted}
              onRefresh={fetchRisks}
              isReadOnly={isReadOnly}
            />
          </TabsContent>
          
          <TabsContent value="matrix" className="mt-4">
            <RiskMatrix risks={risks} />
          </TabsContent>
        </Tabs>
      )}

      {/* Add Custom Risk Dialog */}
      {!isReadOnly && (
        <AddCustomRiskDialog
          aiSystemId={aiSystemId}
          existingRiskIds={risks.map(r => r.catalog_risk_id)}
          open={showAddRiskDialog}
          onOpenChange={setShowAddRiskDialog}
          onRisksAdded={fetchRisks}
        />
      )}
    </div>
  );
}
