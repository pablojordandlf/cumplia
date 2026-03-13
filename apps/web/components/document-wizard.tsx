'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Lock, FileText, Loader2, CheckCircle, XCircle, Download } from 'lucide-react';
import { PlanBadge } from './plan-badge';
import { UpgradeModal } from './upgrade-modal';
import { cn } from '@/lib/utils';
import { createClient } from '@supabase/supabase-js';

const documentTypes = [
  { key: 'ai_policy', label: 'Política de IA', requiresPro: false },
  { key: 'employee_notice', label: 'Notificación a Empleados', requiresPro: false },
  { key: 'systems_register', label: 'Registro de Sistemas', requiresPro: true },
  { key: 'fria', label: 'FRIA (Evaluación de Impacto)', requiresPro: true },
  { key: 'candidate_notice', label: 'Notificación a Candidatos', requiresPro: true },
];

interface DocumentWizardProps {
  userOrganizations: Array<{ id: string; name: string }>;
  currentUserOrgId: string;
  userPlan?: 'free' | 'pro' | 'agency';
  useCases?: Array<{ 
    id: string; 
    name: string;
    riskLevel?: string;
    classification?: string;
  }>;
}

interface GeneratedDocument {
  id: string;
  type: string;
  title: string;
  downloadUrl: string;
  generatedAt: string;
  status: string;
}

export function DocumentWizard({ 
  userOrganizations, 
  currentUserOrgId, 
  userPlan = 'free',
  useCases = []
}: DocumentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState(currentUserOrgId);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [generatedDocument, setGeneratedDocument] = useState<GeneratedDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentDocumentTypeConfig = documentTypes.find(doc => doc.key === selectedDocumentType);
  const requiresPro = currentDocumentTypeConfig?.requiresPro ?? false;
  const hasProPlan = userPlan === 'pro' || userPlan === 'agency';

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!selectedDocumentType) return;
      
      // Check Pro requirement
      if (requiresPro && !hasProPlan) {
        setIsUpgradeModalOpen(true);
        return;
      }
      
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await generateDocument();
    }
  };

  const generateDocument = async () => {
    setGenerationStatus('generating');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: selectedDocumentType,
          title: currentDocumentTypeConfig?.label,
          organizationId: selectedOrgId,
          useCaseIds: selectedUseCases.length > 0 ? selectedUseCases : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'PRO_REQUIRED') {
          setIsUpgradeModalOpen(true);
          setGenerationStatus('idle');
          return;
        }
        throw new Error(data.message || 'Error al generar el documento');
      }

      setGeneratedDocument(data.document);
      setGenerationStatus('success');
      setCurrentStep(4);
    } catch (error) {
      console.error('Error generating document:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
      setGenerationStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    setErrorMessage('');
  };

  const handleCloseUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    if (requiresPro && !hasProPlan) {
      setSelectedDocumentType('');
    }
  };

  const handleDocumentTypeSelect = (value: string) => {
    setSelectedDocumentType(value);
    const docConfig = documentTypes.find(doc => doc.key === value);
    
    if (docConfig?.requiresPro && !hasProPlan) {
      setIsUpgradeModalOpen(true);
    }
  };

  const handleUseCaseToggle = (useCaseId: string) => {
    setSelectedUseCases(prev => 
      prev.includes(useCaseId) 
        ? prev.filter(id => id !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedDocumentType('');
    setSelectedUseCases([]);
    setGenerationStatus('idle');
    setGeneratedDocument(null);
    setErrorMessage('');
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Paso 1: Selecciona el tipo de documento</h4>
      <p className="text-sm text-gray-500">
        Elige el documento de cumplimiento que deseas generar para tu organización.
      </p>
      
      <Select value={selectedDocumentType} onValueChange={handleDocumentTypeSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un tipo de documento..." />
        </SelectTrigger>
        <SelectContent>
          {documentTypes.map((doc) => (
            <SelectItem 
              key={doc.key} 
              value={doc.key}
              disabled={doc.requiresPro && !hasProPlan}
            >
              <div className="flex items-center gap-2">
                {doc.label}
                {doc.requiresPro && (
                  <Lock className="h-3 w-3 text-amber-500" />
                )}
                {doc.requiresPro && (
                  <PlanBadge plan="pro" size="sm" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {requiresPro && !hasProPlan && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          <Lock className="h-4 w-4" />
          <span>Este documento requiere un plan Pro. Haz clic en Siguiente para actualizar.</span>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Paso 2: Confirmar detalles</h4>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <p><span className="font-medium">Documento:</span> {currentDocumentTypeConfig?.label}</p>
        <p><span className="font-medium">Organización:</span> {userOrganizations.find(org => org.id === selectedOrgId)?.name}</p>
        <p><span className="font-medium">Plan:</span> <PlanBadge plan={userPlan} size="sm" /></p>
      </div>

      {useCases.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-sm">Casos de uso a incluir (opcional):</p>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {useCases.map((useCase) => (
              <label 
                key={useCase.id} 
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedUseCases.includes(useCase.id)}
                  onChange={() => handleUseCaseToggle(useCase.id)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{useCase.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        El documento se generará con los datos de tu organización y los casos de uso seleccionados.
      </p>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center py-4">
      {generationStatus === 'generating' && (
        <>
          <div className="flex justify-center">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
          <h4 className="text-lg font-semibold">Generando documento...</h4>
          <p className="text-gray-500">Esto puede tomar unos segundos.</p>
          <div className="w-full max-w-xs mx-auto">
            <Progress value={60} className="h-2" />
          </div>
        </>
      )}

      {generationStatus === 'error' && (
        <>
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <h4 className="text-lg font-semibold text-red-600">Error al generar</h4>
          <p className="text-gray-500">{errorMessage || 'Ha ocurrido un error. Inténtalo de nuevo.'}</p>
          <Button onClick={() => setGenerationStatus('idle')} variant="outline">
            Reintentar
          </Button>
        </>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 text-center py-4">
      {generationStatus === 'success' && generatedDocument && (
        <>
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h4 className="text-lg font-semibold text-green-600">¡Documento generado!</h4>
          
          <div className="bg-green-50 p-4 rounded-lg text-left space-y-2">
            <p><span className="font-medium">Título:</span> {generatedDocument.title}</p>
            <p><span className="font-medium">Fecha:</span> {new Date(generatedDocument.generatedAt).toLocaleDateString('es-ES')}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gap-2">
              <a 
                href={generatedDocument.downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                Descargar PDF
              </a>
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Generar otro documento
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Tipo de documento';
      case 2: return 'Confirmar detalles';
      case 3: return 'Generando...';
      case 4: return '¡Completado!';
      default: return 'Generador de Documentos';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{getStepTitle()}</CardTitle>
          <span className="text-sm text-gray-500">Paso {currentStep} de 4</span>
        </div>
        <CardContent className="pt-2">
          <Progress value={(currentStep / 4) * 100} className="h-1" />
        </CardContent>
      </CardHeader>
      
      <CardContent className="min-h-[200px]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        {currentStep > 1 && currentStep < 4 && (
          <Button 
            variant="outline" 
            onClick={handlePreviousStep}
            disabled={isLoading}
          >
            Anterior
          </Button>
        )}
        
        {currentStep === 1 && <div />}
        
        {currentStep < 3 && (
          <Button 
            onClick={handleNextStep} 
            disabled={
              (currentStep === 1 && !selectedDocumentType) || 
              isLoading
            }
          >
            {currentStep === 1 && requiresPro && !hasProPlan ? 'Actualizar plan' : 'Siguiente'}
          </Button>
        )}

        {currentStep === 3 && generationStatus === 'idle' && (
          <Button 
            onClick={generateDocument}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Generar documento
          </Button>
        )}

        {currentStep === 4 && <div />}
      </CardFooter>
      
      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <UpgradeModal 
          isOpen={isUpgradeModalOpen} 
          onClose={handleCloseUpgradeModal}
          feature="documents"
        />
      )}
    </Card>
  );
}
