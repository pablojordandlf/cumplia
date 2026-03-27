'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RiskCatalog } from '@/types/risk-management';

interface AddCustomRiskDialogProps {
  aiSystemId: string;
  existingRiskIds: string[];
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
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCatalogRisks();
    }
  }, [open]);

  const fetchCatalogRisks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/risks/catalog');
      if (!response.ok) throw new Error('Failed to fetch catalog');
      const data = await response.json();
      // Filter out risks that are already added
      const availableRisks = (data.risks || []).filter(
        (risk: RiskCatalog) => !existingRiskIds.includes(risk.id)
      );
      setCatalogRisks(availableRisks);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el catálogo de riesgos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRisk = (riskId: string) => {
    setSelectedRisks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(riskId)) {
        newSet.delete(riskId);
      } else {
        newSet.add(riskId);
      }
      return newSet;
    });
  };

  const filteredRisks = catalogRisks.filter(risk => {
    const query = searchQuery.toLowerCase();
    return (
      risk.name.toLowerCase().includes(query) ||
      String(risk.risk_number).toLowerCase().includes(query) ||
      risk.domain?.toLowerCase().includes(query)
    );
  });

  const handleSubmit = async () => {
    if (selectedRisks.size === 0) {
      toast({
        title: 'Selecciona riesgos',
        description: 'Por favor selecciona al menos un riesgo para añadir',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/v1/ai-systems/${aiSystemId}/risks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_ids: Array.from(selectedRisks)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add risks');
      }

      toast({
        title: 'Riesgos añadidos',
        description: `Se han añadido ${selectedRisks.size} riesgo(s) al sistema`
      });

      setSelectedRisks(new Set());
      setSearchQuery('');
      onOpenChange(false);
      onRisksAdded();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron añadir los riesgos',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedRisks(new Set());
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Añadir Riesgos del Catálogo</DialogTitle>
          <DialogDescription>
            Selecciona riesgos adicionales del catálogo MIT para añadir a este sistema
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o dominio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {selectedRisks.size} seleccionados
            </span>
            <span className="text-sm text-gray-500">
              {catalogRisks.length} riesgos disponibles
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] border rounded-md">
              <div className="p-4 space-y-2">
                {filteredRisks.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    {catalogRisks.length === 0 
                      ? 'No hay riesgos disponibles para añadir'
                      : 'No se encontraron riesgos con ese criterio'
                    }
                  </p>
                ) : (
                  filteredRisks.map((risk) => (
                    <div
                      key={risk.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleRisk(risk.id)}
                    >
                      <Checkbox
                        checked={selectedRisks.has(risk.id)}
                        onCheckedChange={() => toggleRisk(risk.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {risk.risk_number}
                          </span>
                          {risk.criticality && (
                            <Badge 
                              variant={risk.criticality === 'high' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {risk.criticality === 'high' ? 'Alto' : risk.criticality === 'medium' ? 'Medio' : 'Bajo'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{risk.name}</p>
                        {risk.domain && (
                          <p className="text-xs text-gray-400 mt-1">{risk.domain}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || selectedRisks.size === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Añadiendo...
              </>
            ) : (
              `Añadir ${selectedRisks.size} riesgo(s)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
