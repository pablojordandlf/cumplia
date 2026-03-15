import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Sparkles } from 'lucide-react';

interface UpgradeModalProps {
  feature: 'documents' | 'use_cases' | 'managed_orgs';
  isOpen: boolean;
  onClose: () => void;
}

const featureDescriptions: Record<UpgradeModalProps['feature'], { title: string; description: string; cta: string }> = {
  documents: {
    title: 'Funcionalidad Pro',
    description: 'La generación de documentos requiere un plan Essential o superior. Genera documentos de cumplimiento automáticamente.',
    cta: 'Ver planes',
  },
  use_cases: {
    title: 'Límite alcanzado',
    description: 'Has alcanzado el límite de casos de uso en tu plan actual. Actualiza para gestionar más sistemas de IA.',
    cta: 'Ver planes',
  },
  managed_orgs: {
    title: 'Función Avanzada',
    description: 'La gestión de múltiples organizaciones requiere un plan Professional.',
    cta: 'Ver planes',
  },
};

export function UpgradeModal({ feature, isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();
  const info = featureDescriptions[feature];

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {info.title}
          </DialogTitle>
          <DialogDescription>
            {info.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </DialogClose>
          <Button onClick={handleUpgrade} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            {info.cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
