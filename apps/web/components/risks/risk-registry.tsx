// components/risks/risk-registry.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Trash2,
  RefreshCw,
  Plus,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  AISystemRisk, 
  RiskStatus, 
  RiskLevel,
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
}

export function RiskRegistry({ 
  risks, 
  aiSystemId, 
  aiActLevel,
  onRiskUpdated, 
  onRiskDeleted,
  onRefresh
}: RiskRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [criticalityFilter, setCriticalityFilter] = useState<string>('all');
  const [selectedRisk, setSelectedRisk] = useState<AISystemRisk | null>(null);
  const [riskToDelete, setRiskToDelete] = useState<AISystemRisk | null>(null);
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

  const handleClearAll = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar todos los riesgos de este sistema?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' })
      });

      if (!response.ok) throw new Error('Failed to clear risks');

      onRefresh();
      toast({
        title: 'Riesgos eliminados',
        description: 'Todos los riesgos han sido eliminados del sistema'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron eliminar los riesgos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRisk = async () => {
    if (!riskToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/ai-systems/${aiSystemId}/risks/${riskToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete risk');

      onRiskDeleted(riskToDelete.id);
      toast({
        title: 'Riesgo eliminado',
        description: 'El riesgo ha sido eliminado correctamente'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el riesgo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRiskToDelete(null);
    }
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

  const getStatusIcon = (status: RiskStatus) => {
    switch (status) {
      case 'mitigated': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assessed': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'accepted': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'not_applicable': return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getApplicableBadge = (applicable: boolean) => {
    if (applicable) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <ToggleRight className="h-3 w-3 mr-1" />
          Aplica
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200">
        <ToggleLeft className="h-3 w-3 mr-1" />
        No aplica
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
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
      </p>

      {/* Risk List */}
      <div className="space-y-3">
        {filteredRisks.map((risk) => (
          <Card 
            key={risk.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedRisk(risk)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground font-mono">
                      #{risk.catalog_risk?.risk_number}
                    </span>
                    {getApplicableBadge(risk.applicable !== false)}
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
                  {(risk.probability || risk.impact) && (
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
                  <Badge className={RISK_STATUS_CONFIG[risk.status].color}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(risk.status)}
                      {RISK_STATUS_CONFIG[risk.status].label}
                    </span>
                  </Badge>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRiskToDelete(risk);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRisks.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron riesgos con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Clear all button */}
      {risks.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button 
            variant="destructive" 
            onClick={handleClearAll}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Todos los Riesgos
          </Button>
        </div>
      )}

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
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!riskToDelete} onOpenChange={() => setRiskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este riesgo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el riesgo "{riskToDelete?.catalog_risk?.name}" 
              de este sistema. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRisk}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
