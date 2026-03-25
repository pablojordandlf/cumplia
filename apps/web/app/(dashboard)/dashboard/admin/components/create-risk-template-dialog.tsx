'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Shield, Info, CheckCircle2, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRiskTemplates } from '@/hooks/use-risk-templates';
import { RiskCatalog } from '@/types/risk-management';

interface CreateRiskTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AI_ACT_LEVELS = [
  { value: 'high_risk', label: 'Alto Riesgo', icon: Shield },
  { value: 'limited_risk', label: 'Riesgo Limitado', icon: Info },
  { value: 'minimal_risk', label: 'Riesgo Mínimo', icon: CheckCircle2 },
  { value: 'prohibited', label: 'Prohibido', icon: Ban },
];

export function CreateRiskTemplateDialog({ open, onOpenChange }: CreateRiskTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [appliesToLevels, setAppliesToLevels] = useState<string[]>([]);
  const [catalogRisks, setCatalogRisks] = useState<RiskCatalog[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { createTemplate } = useRiskTemplates({ autoFetch: false });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCatalogRisks();
    }
  }, [open]);

  const fetchCatalogRisks = async () => {
    setLoadingCatalog(true);
    try {
      const response = await fetch('/api/v1/risks/catalog');
      if (!response.ok) throw new Error('Failed to fetch catalog');
      const data = await response.json();
      setCatalogRisks(data.risks || []);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el catálogo de riesgos',
        variant: 'destructive',
      });
    } finally {
      setLoadingCatalog(false);
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

  const toggleAppliesToLevel = (level: string) => {
    setAppliesToLevels(prev => {
      if (prev.includes(level)) {
        // Don't allow unchecking the last level
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== level);
      }
      return [...prev, level];
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
    if (!name.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'Por favor introduce un nombre para la plantilla',
        variant: 'destructive',
      });
      return;
    }

    if (appliesToLevels.length === 0) {
      toast({
        title: 'Aplicabilidad requerida',
        description: 'Por favor selecciona al menos un nivel de riesgo',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRisks.size === 0) {
      toast({
        title: 'Riesgos requeridos',
        description: 'Por favor selecciona al menos un riesgo',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    // Use first selected level as the ai_act_level for the template
    const primaryLevel = appliesToLevels[0];

    const result = await createTemplate({
      name: name.trim(),
      description: description.trim() || undefined,
      ai_act_level: primaryLevel,
      risk_ids: Array.from(selectedRisks),
      applies_to_levels: appliesToLevels,
      excluded_systems: [],
      included_systems: [],
    });

    setSubmitting(false);

    if (result) {
      // Reset form
      setName('');
      setDescription('');
      setAppliesToLevels([]);
      setSelectedRisks(new Set());
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      // Reset form
      setName('');
      setDescription('');
      setAppliesToLevels([]);
      setSelectedRisks(new Set());
      setSearchQuery('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Crear Plantilla de Riesgos</DialogTitle>
          <DialogDescription>
            Crea una plantilla personalizada seleccionando riesgos del catálogo MIT.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plantilla Salud Digital"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el propósito de esta plantilla..."
                rows={2}
              />
            </div>
          </div>

          {/* Applicability Section - Now Required and Only Field for Risk Levels */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>
                Aplicabilidad <span className="text-red-500">*</span>
              </Label>
              {appliesToLevels.length > 0 && (
                <Badge variant="secondary">{appliesToLevels.length} nivel(es)</Badge>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Selecciona todos los niveles de riesgo a los que esta plantilla se aplicará:
            </p>

            <div className="space-y-2">
              {AI_ACT_LEVELS.map((level) => {
                const isSelected = appliesToLevels.includes(level.value);
                return (
                  <div
                    key={level.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleAppliesToLevel(level.value)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleAppliesToLevel(level.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <level.icon className="w-4 h-4" />
                    <span className="text-sm">{level.label}</span>
                    {isSelected && (
                      <Badge variant="default" className="ml-auto text-xs">Aplica</Badge>
                    )}
                  </div>
                );
              })}
            </div>
            {appliesToLevels.length === 0 && (
              <p className="text-sm text-red-500">Debes seleccionar al menos un nivel de riesgo</p>
            )}
          </div>

          {/* Risk Selection */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label>Seleccionar Riesgos <span className="text-red-500">*</span></Label>
              <Badge variant="secondary">{selectedRisks.size} seleccionados</Badge>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, código o dominio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingCatalog ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <ScrollArea className="h-[300px] border rounded-md">
                <div className="p-4 space-y-2">
                  {filteredRisks.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      No se encontraron riesgos
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
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || selectedRisks.size === 0 || appliesToLevels.length === 0 || !name.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              `Crear Plantilla (${selectedRisks.size} riesgos)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
