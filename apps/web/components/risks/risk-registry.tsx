'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Shield,
  RefreshCw,
  Lock,
  EyeOff,
  Eye
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { 
  AISystemRisk, 
  RiskStatus,
  RISK_STATUS_CONFIG,
  RISK_LEVEL_CONFIG
} from '@/types/risk-management';
import { RiskDetailCard } from './risk-detail-card';

interface RiskRegistryProps {
  risks: AISystemRisk[];
  aiSystemId: string;
  aiActLevel: string;
  onRiskUpdated: (risk: AISystemRisk) => void;
  onRiskDeleted: (riskId: string) => void;
  onRefresh: () => void;
  isReadOnly?: boolean;
}

export function RiskRegistry({ 
  risks, 
  aiSystemId, 
  aiActLevel,
  onRiskUpdated, 
  onRiskDeleted,
  onRefresh,
  isReadOnly = false
}: RiskRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<AISystemRisk | null>(null);
  const [togglingRiskId, setTogglingRiskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Filter risks
  const filteredRisks = risks.filter(risk => {
    const matchesSearch = 
      risk.catalog_risk?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.catalog_risk?.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      risk.catalog_risk?.domain.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || risk.status === statusFilter;
    const matchesCriticality = criticalityFilter === 'all' || risk.catalog_risk?.criticality === criticalityFilter;
    
    return matchesSearch && matchesStatus && matchesCriticality;
  });

  const handleToggleApplicable = async (risk: AISystemRisk, newValue: boolean) => {
    if (isReadOnly) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para modificar riesgos',
        variant: 'destructive'
      });
      return;
    }

    setTogglingRiskId(risk.id);
    try {
      const response = await fetch(
        `/api/v1/ai-systems/${aiSystemId}/risks/${risk.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicable: newValue })
        }
      );

      if (!response.ok) throw new Error('Failed to update risk');

      const data = await response.json();
      onRiskUpdated(data.risk);
      
      toast({
        title: newValue ? 'Riesgo aplicable' : 'Riesgo no aplicable',
        description: newValue 
          ? 'El riesgo ahora está activo para evaluación'
          : 'El riesgo ha sido marcado como no aplicable'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el riesgo',
        variant: 'destructive'
      });
    } finally {
      setTogglingRiskId(null);
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-[#E8ECEB] text-gray-800';
    }
  };

  const getStatusIcon = (status: RiskStatus) => {
    switch (status) {
      case 'mitigated': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assessed': return <Shield className="h-4 w-4 text-[#E09E50]" />;
      case 'accepted': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'not_applicable': return <Lock className="h-4 w-4 text-[#7a8a92]" />;
      default: return <AlertTriangle className="h-4 w-4 text-[#7a8a92]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Read-only notice */}
      {isReadOnly && (
        <div className="p-3 bg-[#FFE8D1] border border-[#E09E50]/20 rounded-lg text-sm text-[#E09E50]">
          <span className="font-medium">Modo Visualizador:</span> Solo puedes ver los riesgos. 
          Contacta a un administrador para realizar evaluaciones o modificaciones.
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar riesgos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="identified">Identificados</SelectItem>
              <SelectItem value="assessed">Evaluados</SelectItem>
              <SelectItem value="mitigated">Mitigados</SelectItem>
              <SelectItem value="accepted">Aceptados</SelectItem>
              <SelectItem value="not_applicable">No Aplica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
            <SelectTrigger className="w-[140px]">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Criticidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Mostrando {filteredRisks.length} de {risks.length} riesgos
        {risks.filter(r => r.applicable === true).length > 0 && (
          <span className="ml-1">
            ({risks.filter(r => r.applicable === true).length} aplicables, {' '}
            {risks.filter(r => r.applicable !== true).length} no aplican)
          </span>
        )}
      </p>

      {/* Risk List - Sort: applicable first, then non-applicable */}
      <div className="space-y-3">
        {[...filteredRisks]
          .sort((a, b) => (b.applicable === true ? 1 : 0) - (a.applicable === true ? 1 : 0))
          .map((risk) => {
          const isApplicable = !!risk.applicable;
          return (
            <Card 
              key={risk.id}
              className={`transition-colors border ${
                isApplicable 
                  ? `border-solid ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:border-primary'}`
                  : 'cursor-not-allowed border-dashed border-[#E8ECEB] bg-[#E8ECEB]/30'
              }`}
              onClick={() => {
                if (isApplicable) {
                  setSelectedRisk(risk);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground font-mono">
                        #{risk.catalog_risk?.risk_number}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={getCriticalityColor(risk.catalog_risk?.criticality || '')}
                      >
                        {risk.catalog_risk?.criticality === 'critical' ? 'Crítico' :
                         risk.catalog_risk?.criticality === 'high' ? 'Alto' :
                         risk.catalog_risk?.criticality === 'medium' ? 'Medio' : 'Bajo'}
                      </Badge>
                      <Badge variant="outline">
                        {risk.catalog_risk?.domain}
                      </Badge>
                    </div>
                    <h4 className="font-medium mt-2 truncate">
                      {risk.catalog_risk?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {risk.catalog_risk?.description}
                    </p>
                    
                    {/* Assessment preview */}
                    {(risk.probability || risk.impact) && isApplicable && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        {risk.probability && (
                          <span className="text-muted-foreground">
                            Probabilidad: <span className={RISK_LEVEL_CONFIG[risk.probability].color}>
                              {RISK_LEVEL_CONFIG[risk.probability].label}
                            </span>
                          </span>
                        )}
                        {risk.impact && (
                          <span className="text-muted-foreground">
                            Impacto: <span className={RISK_LEVEL_CONFIG[risk.impact].color}>
                              {RISK_LEVEL_CONFIG[risk.impact].label}
                            </span>
                          </span>
                        )}
                        {risk.residual_risk_score && (
                          <span className="text-muted-foreground">
                            Riesgo Residual: <span className="font-medium">{risk.residual_risk_score}/10</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* Applicability Toggle - stopPropagation prevents opening detail */}
                    <div 
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isApplicable && (
                        <Badge variant="outline" className="text-[#7a8a92] border-[#E8ECEB] text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          No aplica
                        </Badge>
                      )}
                      {isReadOnly ? (
                        // Read-only indicator instead of switch
                        <Badge variant="outline" className="text-xs">
                          {isApplicable ? (
                            <><Eye className="h-3 w-3 mr-1" /> Aplica</>
                          ) : (
                            <><EyeOff className="h-3 w-3 mr-1" /> No aplica</>
                          )}
                        </Badge>
                      ) : (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${isApplicable ? 'text-green-600 font-medium' : 'text-[#7a8a92]'}`}>
                                  {isApplicable ? 'Aplica' : 'No aplica'}
                                </span>
                                <Switch
                                  checked={!!risk.applicable}
                                  onCheckedChange={(checked) => {
                                    handleToggleApplicable(risk, checked === true);
                                  }}
                                  disabled={togglingRiskId === risk.id}
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="max-w-xs">
                                {isApplicable 
                                  ? 'Haz clic para marcar este riesgo como NO aplicable a tu sistema'
                                  : 'Haz clic para marcar este riesgo como aplicable y evaluarlo'
                                }
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <Badge className={RISK_STATUS_CONFIG[risk.status].color}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(risk.status)}
                        {RISK_STATUS_CONFIG[risk.status].label}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredRisks.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron riesgos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <RiskDetailCard
          risk={selectedRisk}
          aiSystemId={aiSystemId}
          open={!!selectedRisk}
          onOpenChange={(open) => !open && setSelectedRisk(null)}
          onRiskUpdated={(updated) => {
            onRiskUpdated(updated);
            setSelectedRisk(null);
          }}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}
