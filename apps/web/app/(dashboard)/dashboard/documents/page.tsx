'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  ArrowLeft, 
  ShieldAlert,
  Download,
  Loader2,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DocumentCard } from '@/components/document-card';
import { GenerateDocumentButton } from '@/components/generate-document-button';
import { UpgradeModal } from '@/components/upgrade-modal';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  type: string;
  title: string;
  status: 'completed' | 'pending' | 'error';
  created_at: string;
  pdf_url?: string;
  docx_url?: string;
}

interface DocumentType {
  type: string;
  title: string;
  description: string;
  requires_use_case: boolean;
  obligatory_for: string[];
}

const documentTypeLabels: Record<string, { title: string; description: string }> = {
  ai_policy: {
    title: 'Política de Uso de IA',
    description: 'Documento maestro de gobernanza de IA para toda la organización'
  },
  employee_notice: {
    title: 'Aviso a Empleados',
    description: 'Información obligatoria para empleados en sistemas de alto riesgo'
  },
  systems_register: {
    title: 'Registro de Sistemas',
    description: 'Inventario formal de todos los sistemas de IA de la organización'
  },
  fria: {
    title: 'FRIA - Evaluación de Impacto',
    description: 'Evaluación de Impacto en Derechos Fundamentales (Art. 27 AI Act)'
  },
  candidate_notice: {
    title: 'Aviso a Candidatos',
    description: 'Información para candidatos en procesos de selección con IA'
  },
};

export const dynamic = 'force-dynamic';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [userPlan, setUserPlan] = useState<string>('starter');
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
    loadDocumentTypes();
    checkUserPlan();
  }, []);

  const checkUserPlan = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/v1/billing/status', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Map legacy plan names to new ones
        const planMapping: Record<string, string> = {
          'free': 'starter',
          'pro': 'essential',
          'business': 'professional',
          'agency': 'professional',
        };
        const mappedPlan = planMapping[data.plan] || data.plan || 'starter';
        setUserPlan(mappedPlan);
      }
    } catch (error) {
      console.error('Error checking plan:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/v1/documents', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar documentos');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los documentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/v1/documents/types', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const types = Object.entries(data).map(([type, info]: [string, any]) => ({
          type,
          title: info.title,
          description: info.description,
          requires_use_case: info.requires_use_case,
          obligatory_for: info.obligatory_for,
        }));
        setDocumentTypes(types);
      }
    } catch (error) {
      console.error('Error loading document types:', error);
    }
  };

  const handleGenerate = async (type: string) => {
    const isProRequired = userPlan === 'starter';
    
    if (isProRequired) {
      setShowUpgradeModal(true);
      return;
    }

    setGenerating(type);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/v1/documents/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          use_case_id: null, // Seleccionar automáticamente en backend
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          setShowUpgradeModal(true);
          return;
        }
        throw new Error(error.detail || 'Error al generar documento');
      }

      const data = await response.json();
      
      toast({
        title: 'Documento generado',
        description: 'El documento se ha generado correctamente',
      });

      // Recargar lista
      await loadDocuments();
    } catch (error: any) {
      console.error('Error generating document:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo generar el documento',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const getExistingDocument = (type: string) => {
    return documents.find(d => d.type === type);
  };

  const requiresPro = (type: string) => {
    return userPlan === 'starter';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Documentos de Cumplimiento</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Inventario
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Generación de Documentos</h2>
          <p className="text-gray-600 mt-1">
            Genera automáticamente los documentos de cumplimiento requeridos por el AI Act
          </p>
          {userPlan === 'starter' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-amber-800 font-medium">Funcionalidad Essential</p>
                <p className="text-amber-700 text-sm">
                  La generación de documentos requiere un plan Essential o superior. 
                  <Button 
                    variant="link" 
                    className="text-amber-800 p-0 h-auto font-medium"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Actualizar ahora
                  </Button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Document Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documentTypes.map((docType) => {
            const existingDoc = getExistingDocument(docType.type);
            const isGenerating = generating === docType.type;
            const requiresProPlan = requiresPro(docType.type);
            const labels = documentTypeLabels[docType.type];

            return (
              <Card key={docType.type} className={`flex flex-col ${requiresProPlan ? 'opacity-75' : ''}`}>
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{labels?.title || docType.title}</CardTitle>
                        {requiresProPlan && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {labels?.description || docType.description}
                  </CardDescription>
                  {docType.requires_use_case && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Requiere caso de uso
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="flex-grow">
                  {existingDoc ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Estado:</span>
                        <Badge 
                          variant={existingDoc.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {existingDoc.status === 'completed' ? 'Completado' : 'Pendiente'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Generado:</span>
                        <span className="text-gray-700">
                          {new Date(existingDoc.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      {existingDoc.pdf_url && (
                        <Button 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => window.open(existingDoc.pdf_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center">
                      <p className="text-sm text-gray-500 text-center mb-4">
                        No generado aún
                      </p>
                      <Button 
                        onClick={() => handleGenerate(docType.type)}
                        disabled={isGenerating}
                        className="w-full"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : requiresProPlan ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Generar
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Generar documento
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Generated Documents Section */}
        {documents.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos Generados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard 
                  key={doc.id} 
                  document={doc}
                  onRegenerate={() => handleGenerate(doc.type)}
                  requiresPro={requiresPro(doc.type)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && !loading && documentTypes.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">
                Genera tu primer documento de cumplimiento
              </h3>
              <p className="text-blue-100 mb-6 max-w-md mx-auto">
                Crea automáticamente documentos profesionales conformes al AI Act Europeo. 
                Selecciona uno de los tipos de documento disponibles arriba.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        feature="documents"
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
    </div>
  );
}
