'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Shield,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { documentSchemas, DocumentSchema, FormField } from '@/lib/document-schemas';

interface UseCase {
  id: string;
  name: string;
  risk_level: string;
  ai_act_classification?: string;
  description?: string;
}

interface Organization {
  id: string;
  name: string;
  ai_act_role?: string;
  sector?: string;
  size?: string;
}

interface DocumentGenerationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: string;
  documentTitle: string;
  onSuccess: () => void;
}

export function DocumentGenerationWizard({
  isOpen,
  onClose,
  documentType,
  documentTitle,
  onSuccess,
}: DocumentGenerationWizardProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [customProhibitedUse, setCustomProhibitedUse] = useState('');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('');
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const schema = documentSchemas[documentType];

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      setStep(1);
      setFormData({});
      setSelectedUseCase('');
      setCustomProhibitedUse('');
    }
  }, [isOpen, documentType]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      // Load organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('org_id')
        .eq('user_id', session.user.id)
        .single();

      if (membership?.org_id) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name, ai_act_role, sector, size')
          .eq('id', membership.org_id)
          .single();
        
        if (orgData) {
          setOrganization({
            id: orgData.id,
            name: orgData.name,
            ai_act_role: orgData.ai_act_role,
            sector: orgData.sector,
            size: orgData.size,
          });
          // Initialize organization name in formData so user can edit it
          setFormData(prev => ({ ...prev, organization_name: orgData.name }));
        }
      }

      // Load use cases
      const response = await fetch(`/api/v1/use-cases?organizationId=${membership?.org_id}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUseCases(data.use_cases || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos iniciales',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (schema?.requiresUseCase && !selectedUseCase) {
          toast({
            title: 'Caso de uso requerido',
            description: 'Por favor, selecciona un caso de uso para continuar',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      case 2:
        // Validar nombre de organización
        if (!formData.organization_name?.trim()) {
          toast({
            title: 'Campo requerido',
            description: 'El nombre de la organización es obligatorio',
            variant: 'destructive',
          });
          return false;
        }
        // Validar campos obligatorios de la organización
        const orgFields = schema?.fields.filter(f => f.required && f.section === 'organization') || [];
        for (const field of orgFields) {
          if (!formData[field.id]) {
            toast({
              title: 'Campo requerido',
              description: `El campo "${field.label}" es obligatorio`,
              variant: 'destructive',
            });
            return false;
          }
        }
        return true;
      case 3:
        // Validar campos específicos del documento
        const docFields = schema?.fields.filter(f => f.required && f.section === 'document') || [];
        for (const field of docFields) {
          if (!formData[field.id]) {
            toast({
              title: 'Campo requerido',
              description: `El campo "${field.label}" es obligatorio`,
              variant: 'destructive',
            });
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      const payload = {
        type: documentType,
        use_case_id: selectedUseCase || null,
        form_data: formData,
        organization_data: {
          name: formData.organization_name || organization?.name,
          sector: organization?.sector,
          size: organization?.size,
        },
      };

      const response = await fetch('/api/v1/documents/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Error al generar documento';
        try {
          const error = await response.json();
          errorMessage = error.detail || error.message || error.error || JSON.stringify(error);
        } catch {
          // Si no es JSON válido, leer como texto
          const text = await response.text();
          errorMessage = text || `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: '¡Documento generado!',
        description: 'El documento se ha creado correctamente',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo generar el documento',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFormData = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            value={value || ''}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        );
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => updateFormData(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
          />
        );
      case 'select':
        return (
          <Select value={value || ''} onValueChange={(v) => updateFormData(field.id, v)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Selecciona...'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multiselect':
        // Special handling for prohibited uses field with custom additions
        const isProhibitedUsesField = field.id === 'include_prohibited_uses';
        const currentValues = value || [];
        const customUses = formData.custom_prohibited_uses || [];

        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.id}-${option.value}`}
                  checked={currentValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      updateFormData(field.id, [...currentValues, option.value]);
                    } else {
                      updateFormData(field.id, currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.id}-${option.value}`} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
            
            {/* Custom prohibited uses for ai_policy */}
            {isProhibitedUsesField && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">¿Quieres añadir usos prohibidos específicos de tu sector?</p>
                
                {/* List of custom uses */}
                {customUses.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {customUses.map((customUse: string, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                        <span className="text-sm">{customUse}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500"
                          onClick={() => {
                            const updated = customUses.filter((_: string, i: number) => i !== index);
                            updateFormData('custom_prohibited_uses', updated);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add custom use input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="ej: Uso de IA para evaluación psicológica sin consentimiento"
                    value={customProhibitedUse}
                    onChange={(e) => setCustomProhibitedUse(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customProhibitedUse.trim()) {
                          updateFormData('custom_prohibited_uses', [...customUses, customProhibitedUse.trim()]);
                          setCustomProhibitedUse('');
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (customProhibitedUse.trim()) {
                        updateFormData('custom_prohibited_uses', [...customUses, customProhibitedUse.trim()]);
                        setCustomProhibitedUse('');
                      }
                    }}
                    disabled={!customProhibitedUse.trim()}
                  >
                    Añadir
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Presiona Enter o haz clic en Añadir para incluir usos específicos de tu industria
                </p>
              </div>
            )}
          </div>
        );
      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => updateFormData(field.id, e.target.value)}
          />
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => updateFormData(field.id, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
          />
        );
      default:
        return null;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Selección de Caso de Uso</h3>
          <p className="text-sm text-gray-500">Elige el sistema de IA al que se aplicará este documento</p>
        </div>
      </div>

      {schema?.requiresUseCase ? (
        <>
          {useCases.length === 0 ? (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-medium">No hay casos de uso registrados</p>
                  <p className="text-amber-700 text-sm mt-1">
                    Para generar este documento, primero debes registrar un caso de uso en tu inventario.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {useCases.map((useCase) => (
                <Card
                  key={useCase.id}
                  className={`cursor-pointer transition-all ${
                    selectedUseCase === useCase.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUseCase(useCase.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{useCase.name}</h4>
                          <Badge 
                            variant={useCase.risk_level === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {useCase.risk_level === 'high' ? 'Alto Riesgo' : useCase.risk_level}
                          </Badge>
                        </div>
                        {useCase.description && (
                          <p className="text-sm text-gray-500 mt-1">{useCase.description}</p>
                        )}
                        {useCase.ai_act_classification && (
                          <p className="text-xs text-gray-400 mt-1">
                            Clasificación: {useCase.ai_act_classification}
                          </p>
                        )}
                      </div>
                      {selectedUseCase === useCase.id && (
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Documento general</p>
              <p className="text-green-700 text-sm mt-1">
                Este documento no requiere un caso de uso específico. Se aplicará a toda tu organización.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Información de la Organización</h3>
          <p className="text-sm text-gray-500">Datos de tu empresa para el documento</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization_name">
                Nombre de la organización
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="organization_name"
                value={formData.organization_name || organization?.name || ''}
                onChange={(e) => updateFormData('organization_name', e.target.value)}
                placeholder="Nombre de tu empresa u organización"
              />
              <p className="text-xs text-gray-500">
                Puedes personalizar el nombre tal como aparecerá en el documento
              </p>
            </div>

            {schema?.fields
              .filter(f => f.section === 'organization')
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-xs text-gray-500">{field.helpText}</p>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Contenido del Documento</h3>
          <p className="text-sm text-gray-500">Personaliza la información específica del documento</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-4">
            {schema?.fields
              .filter(f => f.section === 'document')
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                  {field.helpText && (
                    <p className="text-xs text-gray-500">{field.helpText}</p>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Revisión y Generación</h3>
          <p className="text-sm text-gray-500">Revisa los datos antes de generar el documento</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Tipo de documento</span>
              <span className="font-medium">{documentTitle}</span>
            </div>
            
            {selectedUseCase && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Caso de uso</span>
                <span className="font-medium">
                  {useCases.find(uc => uc.id === selectedUseCase)?.name}
                </span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Organización</span>
              <span className="font-medium">{formData.organization_name || organization?.name}</span>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Campos completados:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(formData)
                  .filter(([key, value]) => {
                    if (key === 'custom_prohibited_uses' || key === 'organization_name') return false;
                    return value && (Array.isArray(value) ? value.length > 0 : true);
                  })
                  .map(([key]) => {
                    const field = schema?.fields.find(f => f.id === key);
                    return field ? (
                      <Badge key={key} variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {field.label}
                      </Badge>
                    ) : null;
                  })}
              </div>
              
              {/* Show custom prohibited uses if any */}
              {formData.custom_prohibited_uses && formData.custom_prohibited_uses.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Usos prohibidos personalizados:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.custom_prohibited_uses.map((use: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Información importante</p>
            <p className="text-blue-700 text-sm mt-1">
              El documento generado es un borrador basado en la información proporcionada. 
              Te recomendamos revisarlo con tu asesoría legal antes de su uso oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generar {documentTitle}
          </DialogTitle>
          <DialogDescription>
            Completa los pasos para generar tu documento de cumplimiento
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Paso {step} de {totalSteps}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-6 py-4 max-h-[50vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
          ) : (
            <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </>
          )}
        </ScrollArea>

        <Separator />

        <div className="px-6 pb-6 pt-2 flex justify-between">
          <Button
            variant="outline"
            onClick={step === 1 ? onClose : handleBack}
            disabled={isGenerating}
          >
            {step === 1 ? 'Cancelar' : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </>
            )}
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Documento
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
