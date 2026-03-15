'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Loader2,
  Lock,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DocumentGenerationWizard } from './document-generation-wizard';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  type: string;
  title: string;
  status: 'completed' | 'pending' | 'error';
  created_at: string;
  updated_at: string;
  pdf_url?: string;
  docx_url?: string;
  version?: number;
}

interface DocumentCardProps {
  document: Document;
  onRegenerate: () => void;
  requiresPro: boolean;
}

const documentTypeLabels: Record<string, { title: string; icon: string }> = {
  ai_policy: { title: 'Política de Uso de IA', icon: '📋' },
  employee_notice: { title: 'Notificación a Empleados', icon: '👥' },
  systems_register: { title: 'Registro de Sistemas', icon: '📊' },
  fria: { title: 'FRIA - Evaluación de Impacto', icon: '⚖️' },
  candidate_notice: { title: 'Notificación a Candidatos', icon: '📝' },
};

export function DocumentCard({ document, onRegenerate, requiresPro }: DocumentCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (format: 'pdf' | 'docx') => {
    const url = format === 'pdf' ? document.pdf_url : document.docx_url;
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Documento no disponible',
        description: `El formato ${format.toUpperCase()} no está disponible para este documento`,
        variant: 'destructive',
      });
    }
  };

  const handleRegenerateClick = () => {
    if (requiresPro) {
      onRegenerate();
      return;
    }
    setShowWizard(true);
  };

  const labels = documentTypeLabels[document.type] || { 
    title: document.title || 'Documento', 
    icon: '📄' 
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-xl">
                {labels.icon}
              </div>
              <div>
                <CardTitle className="text-base font-semibold line-clamp-1">
                  {labels.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge()}
                  {document.version && document.version > 1 && (
                    <Badge variant="outline" className="text-xs">
                      v{document.version}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {requiresPro && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Dates */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Creado:</span>
              </div>
              <span className="text-gray-700">
                {new Date(document.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {document.updated_at !== document.created_at && (
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizado:</span>
                </div>
                <span className="text-gray-700">
                  {new Date(document.updated_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              {document.pdf_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              )}
              {document.docx_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDownload('docx')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  DOCX
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-600 hover:text-gray-900"
              onClick={handleRegenerateClick}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Regenerando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerar versión
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Generation Wizard */}
      <DocumentGenerationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        documentType={document.type}
        documentTitle={labels.title}
        onSuccess={onRegenerate}
      />
    </>
  );
}
