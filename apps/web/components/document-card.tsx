import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { PlanBadge } from './plan-badge'; // Assuming PlanBadge is in the same directory

interface DocumentCardProps {
  document: {
    id: string;
    type: string; // e.g., 'ai_policy', 'employee_notice'
    title: string;
    status: 'generated' | 'pending';
    generatedAt?: string;
  };
  onDownload: (docId: string, format: 'pdf' | 'docx') => void;
  onRegenerate: (docId: string) => void;
  requiresPro?: boolean; // To indicate if this document type requires Pro plan
}

export function DocumentCard({ document, onDownload, onRegenerate, requiresPro = false }: DocumentCardProps) {
  const isPending = document.status === 'pending';
  const isGenerated = document.status === 'generated';

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{document.title}</CardTitle>
        <div className="flex items-center gap-2">
          {requiresPro && <PlanBadge plan="pro" size="sm" />} {/* Show Pro badge if required */}
          <CardDescription>Type: {document.type}</CardDescription>
        </div>
        {isGenerated && document.generatedAt && (
          <CardDescription>
            Generated on: {new Date(document.generatedAt).toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {isPending && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Generating...
          </div>
        )}
        {isGenerated && (
          <div className="flex flex-col md:flex-row items-center justify-center h-full gap-4">
            <Button 
              variant="outline" 
              onClick={() => onDownload(document.id, 'pdf')} 
              className="flex items-center gap-2"
              disabled={isPending}
            >
              <Download className="h-4 w-4" /> PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onDownload(document.id, 'docx')} 
              className="flex items-center gap-2"
              disabled={isPending}
            >
              <Download className="h-4 w-4" /> DOCX
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-shrink-0">
        <Button 
          variant="outline" 
          onClick={() => onRegenerate(document.id)} 
          disabled={isPending} 
          className="w-full flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Regenerate
        </Button>
      </CardFooter>
    </Card>
  );
}
