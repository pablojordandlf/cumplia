'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Shield, Info, CheckCircle2, Ban, XCircle, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRiskTemplates } from '@/hooks/use-risk-templates';
import { RiskTemplateWithItems } from '@/types/risk-management';

interface EditTemplateApplicabilityDialogProps {
  template: RiskTemplateWithItems;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AI_ACT_LEVELS = [
  { value: 'high_risk', label: 'Alto Riesgo', icon: Shield, color: 'text-orange-600' },
  { value: 'limited_risk', label: 'Riesgo Limitado', icon: Info, color: 'text-yellow-600' },
  { value: 'minimal_risk', label: 'Riesgo Mínimo', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'prohibited', label: 'Prohibido', icon: Ban, color: 'text-red-600' },
];

// Mock AI systems - in real implementation, fetch from API
const MOCK_AI_SYSTEMS = [
  { id: 'sys-1', name: 'Sistema de Reclutamiento AI', risk_level: 'high_risk' },
  { id: 'sys-2', name: 'Chatbot de Atención al Cliente', risk_level: 'limited_risk' },
  { id: 'sys-3', name: 'Recomendador de Contenidos', risk_level: 'minimal_risk' },
  { id: 'sys-4', name: 'Diagnóstico Médico AI', risk_level: 'high_risk' },
  { id: 'sys-5', name: 'Sistema de Evaluación Crediticia', risk_level: 'high_risk' },
  { id: 'sys-6', name: 'Filtro de Spam', risk_level: 'minimal_risk' },
];

export function EditTemplateApplicabilityDialog({ 
  template, 
  open, 
  onOpenChange 
}: EditTemplateApplicabilityDialogProps) {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [excludedSystems, setExcludedSystems] = useState<string[]>([]);
  const [includedSystems, setIncludedSystems] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'exceptions'>('levels');
  
  const { updateApplicability } = useRiskTemplates({ autoFetch: false });
  const { toast } = useToast();

  // Initialize from template data
  useEffect(() => {
    if (open && template) {
      setSelectedLevels(template.applies_to_levels || [template.ai_act_level]);
      setExcludedSystems(template.excluded_systems || []);
      setIncludedSystems(template.included_systems || []);
    }
  }, [open, template]);

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => {
      if (prev.includes(level)) {
        // Don't allow unchecking the last level
        if (prev.length === 1) return prev;
        return prev.filter(l => l !== level);
      }
      return [...prev, level];
    });
  };

  const toggleExcludedSystem = (systemId: string) => {
    setExcludedSystems(prev => {
      if (prev.includes(systemId)) {
        return prev.filter(id => id !== systemId);
      }
      // Remove from included if adding to excluded
      setIncludedSystems(inc => inc.filter(id => id !== systemId));
      return [...prev, systemId];
    });
  };

  const toggleIncludedSystem = (systemId: string) => {
    setIncludedSystems(prev => {
      if (prev.includes(systemId)) {
        return prev.filter(id => id !== systemId);
      }
      // Remove from excluded if adding to included
      setExcludedSystems(exc => exc.filter(id => id !== systemId));
      return [...prev, systemId];
    });
  };

  const handleSubmit = async () => {
    if (selectedLevels.length === 0) {
      toast({
        title: 'Nivel requerido',
        description: 'Debes seleccionar al menos un nivel de riesgo',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    
    const success = await updateApplicability(template.id, {
      applies_to_levels: selectedLevels,
      excluded_systems: excludedSystems,
      included_systems: includedSystems,
    });

    setSubmitting(false);

    if (success) {
      toast({
        title: 'Configuración guardada',
        description: 'La aplicabilidad de la plantilla ha sido actualizada.',
      });
      onOpenChange(false);
    }
  };

  // Filter systems that would normally be covered by this template
  const applicableSystems = MOCK_AI_SYSTEMS.filter(sys => 
    selectedLevels.includes(sys.risk_level)
  );

  // Systems that could be exceptions (not in selected levels)
  const exceptionSystems = MOCK_AI_SYSTEMS.filter(sys => 
    !selectedLevels.includes(sys.risk_level)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Configurar Aplicabilidad</DialogTitle>
          <DialogDescription>
            Define a qué sistemas de IA aplica la plantilla "{template.name}"
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2 mt-4">
          <Button
            variant={activeTab === 'levels' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('levels')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Niveles de Riesgo
          </Button>
          <Button
            variant={activeTab === 'exceptions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('exceptions')}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Excepciones
            {(excludedSystems.length + includedSystems.length > 0) && (
              <Badge variant="secondary" className="ml-2">
                {excludedSystems.length + includedSystems.length}
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'levels' ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Selecciona los niveles de riesgo AI Act a los que esta plantilla se aplicará por defecto:
              </p>
              
              <div className="space-y-3">
                {AI_ACT_LEVELS.map((level) => {
                  const Icon = level.icon;
                  const isSelected = selectedLevels.includes(level.value);
                  
                  return (
                    <div
                      key={level.value}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleLevel(level.value)}
                    >
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleLevel(level.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className={`p-2 rounded-lg bg-white`}>
                        <Icon className={`w-5 h-5 ${level.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{level.label}</p>
                        <p className="text-sm text-gray-500">
                          {level.value === 'high_risk' && 'Sistemas críticos con alto impacto'}
                          {level.value === 'limited_risk' && 'Sistemas con interacción humana'}
                          {level.value === 'minimal_risk' && 'Sistemas de bajo impacto'}
                          {level.value === 'prohibited' && 'Sistemas no permitidos'}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="default">Aplica</Badge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Resumen de aplicabilidad:</p>
                <p className="text-sm text-gray-600">
                  Esta plantilla se aplicará automáticamente a{' '}
                  <span className="font-medium">{applicableSystems.length}</span> sistema(s) de IA
                  con nivel(es):{' '}
                  {selectedLevels.map(l => 
                    AI_ACT_LEVELS.find(al => al.value === l)?.label
                  ).join(', ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Excluded Systems */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-medium">Sistemas Excluidos</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Sistemas que, aunque tengan un nivel de riesgo al que aplica la plantilla,
                  estarán excluidos de forma explícita:
                </p>
                
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {applicableSystems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Primero selecciona niveles de riesgo en la pestaña anterior
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {applicableSystems.map(system => (
                        <div
                          key={system.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={excludedSystems.includes(system.id)}
                            onCheckedChange={() => toggleExcludedSystem(system.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{system.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {AI_ACT_LEVELS.find(l => l.value === system.risk_level)?.label}
                            </Badge>
                          </div>
                          {excludedSystems.includes(system.id) && (
                            <Badge variant="destructive" className="text-xs">Excluido</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Included Systems (Exceptions) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium">Incluir como Excepción</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Sistemas que, aunque NO tengan un nivel de riesgo al que aplica la plantilla,
                  quieres incluir de forma explícita:
                </p>
                
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {exceptionSystems.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No hay sistemas de otros niveles disponibles
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {exceptionSystems.map(system => (
                        <div
                          key={system.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={includedSystems.includes(system.id)}
                            onCheckedChange={() => toggleIncludedSystem(system.id)}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{system.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {AI_ACT_LEVELS.find(l => l.value === system.risk_level)?.label}
                            </Badge>
                          </div>
                          {includedSystems.includes(system.id) && (
                            <Badge className="text-xs bg-green-100 text-green-800">Incluido</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || selectedLevels.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Configuración'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
