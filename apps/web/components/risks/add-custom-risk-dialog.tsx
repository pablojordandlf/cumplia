'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskCatalog } from '@/types/risk-management';

interface AddCustomRiskDialogProps {
  aiSystemId: string;
  existingRiskIds: string[]; // catalog_risk_ids already added
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRisksAdded: () => void;
}

export function AddCustomRiskDialog({
  aiSystemId,
  existingRiskIds,
  open,
  onOpenChange,
  onRisksAdded
}: AddCustomRiskDialogProps) {
  const [catalogRisks, setCatalogRisks] = useState<RiskCatalog[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<RiskCatalog[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCatalogRisks();
    }
  }, [open]);

  useEffect(() => {
    // Filter out already existing risks and apply search
    const available = catalogRisks.filter(r => !existingRiskIds.includes(r.id));
    
    if (searchTerm) {
      const filtered = available.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.risk_number.toString().includes(searchTerm)
      );
      setFilteredRisks(filtered);
    } else {
      setFilteredRisks(available);
    }
  }, [catalogRisks, existingRiskIds, searchTerm]);

  const fetchCatalogRisks = async () => {
    setFetching(true);
    try {
      const response = await fetch('/api/v1/risks/catalog');
      if (!response.ok) throw new Error('Failed to fetch catalog');
      const data = await response.json();
      setCatalogRisks(data.risks || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el catálogo de riesgos',
        variant: 'destructive'
      });
    } finally {
      setFetching(false);
    }
  };

  const handleToggleRisk = (riskId: string) => {
    setSelectedIds(prev =>
      prev.includes(riskId)
        ? prev.filter(id => id !== riskId)
        : [...prev, riskId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredRisks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRisks.map(r => r.id));
    }
  };

  const handleAddRisks = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Selección vacía',
        description: 'Selecciona al menos un riesgo para añadir',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalog_risk_ids: selectedIds })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add risks');
      }

      toast({
        title: 'Riesgos añadidos',
        description: `Se han añadido ${selectedIds.length} riesgos al sistema`
      });

      setSelectedIds([]);
      setSearchTerm('');
      onOpenChange(false);
      onRisksAdded();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudieron añadir los riesgos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Añadir Riesgos Adicionales</DialogTitle>
          <DialogDescription>
            Selecciona riesgos del catálogo MIT para añadir a este sistema.
            Por defecto se crearán como "No aplican" y podrás activarlos después.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, descripción, dominio o número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Select all */}
          {filteredRisks.length > 0 && (
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                {filteredRisks.length} riesgos disponibles
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.length === filteredRisks.length ? 'Desmarcar todos' : 'Seleccionar todos'}
              </Button>
            </div>
          )}

          {/* Risk list */}
          <ScrollArea className="h-[400px] border rounded-md p-4">
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : filteredRisks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No se encontraron riesgos con ese criterio' : 'No hay más riesgos disponibles en el catálogo'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRisks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedIds.includes(risk.id)
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => handleToggleRisk(risk.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(risk.id)}
                      onCheckedChange={() => handleToggleRisk(risk.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground font-mono">
                          #{risk.risk_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={getCriticalityColor(risk.criticality)}
                        >
                          {risk.criticality === 'critical' ? 'Crítico' :
                           risk.criticality === 'high' ? 'Alto' :
                           risk.criticality === 'medium' ? 'Medio' : 'Bajo'}
                        </Badge>
                        <Badge variant="outline">{risk.domain}</Badge>
                      </div>
                      <p className="font-medium mt-1">{risk.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {risk.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Selected count */}
          {selectedIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedIds.length} riesgo{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddRisks}
            disabled={loading || selectedIds.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Añadiendo...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Añadir {selectedIds.length > 0 && `(${selectedIds.length})`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
