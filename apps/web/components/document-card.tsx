'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, FileText, Loader2 } from 'lucide-react';
import { PlanBadge } from './plan-badge';
import { createClient } from '@supabase/supabase-js';

interface Document {
  id: string;
  type: string;
  title: string;
  status: 'completed' | 'pending' | 'error';
  created_at: string;
  public_url?: string;
  metadata?: {
    generatedAt?: string;
  };
}

interface DocumentCardProps {
  document: Document;
  onRegenerate?: (docId: string) => void;
  requiresPro?: boolean;
}

const documentTypeLabels: Record<string, string> = {
  ai_policy: 'Política de IA',
  employee_notice: 'Notificación a Empleados',
  systems_register: 'Registro de Sistemas',
  fria: 'FRIA',
  candidate_notice: 'Notificación a Candidatos',
};

export function DocumentCard({ document, onRegenerate, requiresPro = false }: DocumentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string>('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPending = document.status === 'pending';
  const isCompleted = document.status === 'completed';
  const isError = document.status === 'error';

  const handleDownload = async () => {
    if (!document.public_url) {
      // Need to fetch signed URL from API
      setIsDownloading(true);
      setDownloadError('');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new Error('No hay sesión activa');
        }

        const response = await fetch(`/api/v1/documents/${document.id}/download?format=pdf`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener el enlace de descarga');
        }

        const data = await response.json();
        
        // Open download URL in new tab
        window.open(data.downloadUrl, '_blank');
      } catch (error) {
        console.error('Error downloading document:', error);
        setDownloadError('Error al descargar el documento');
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    // Direct download if public URL is available
    window.open(document.public_url, '_blank');
  };

  const getStatusBadge = () => {
    switch (document.status) {
      case 'completed':
        return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Completado</span>;
      case 'pending':
        return <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Pendiente</span>;
      case 'error':
        return <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Error</span>;
      default:
        return null;
    }
  };

  const formattedDate = document.created_at 
    ? new Date(document.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <CardTitle className="text-base">{document.title}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {requiresPro && <PlanBadge plan="pro" size="sm" />}
          <CardDescription className="text-xs">
            {documentTypeLabels[document.type] || document.type}
          </CardDescription>
        </div>
        
        {formattedDate && (
          <CardDescription className="text-xs">
            Generado: {formattedDate}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow">
        {isPending && (
          <div className="flex items-center justify-center h-full text-gray-500 gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generando documento...
          </div>
        )}
        
        {isError && (
          <div className="flex items-center justify-center h-full text-red-500 text-sm">
            Error al generar. Intenta regenerar el documento.
          </div>
        )}
        
        {isCompleted && (
          <div className="flex items-center justify-center h-full">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar PDF
            </Button>
          </div>
        )}

        {downloadError && (
          <p className="text-xs text-red-500 text-center mt-2">{downloadError}</p>
        )}
      </CardContent>
      
      {onRegenerate && (
        <CardFooter className="flex-shrink-0 pt-0">
          <Button 
            variant="ghost" 
            onClick={() => onRegenerate(document.id)} 
            disabled={isPending}
            className="w-full flex items-center gap-2 text-sm"
            size="sm"
          >
            <RefreshCw className="h-3 w-3" /> 
            Regenerar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
