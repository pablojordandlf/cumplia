import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface UpgradeModalProps {
  feature: 'documents' | 'use_cases' | 'managed_orgs';
  isOpen: boolean;
  onClose: () => void;
}

const featureDescriptions: Record<UpgradeModalProps['feature'], string> = {
  documents: 'access to advanced document generation features',
  use_cases: 'full access to all use cases',
  managed_orgs: 'managing multiple organizations',
};

export function UpgradeModal({ feature, isOpen, onClose }: UpgradeModalProps) {
  const description = featureDescriptions[feature] || 'this feature';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Upgrade Required
          </DialogTitle>
          <DialogDescription>
            You need to upgrade to unlock {description}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
          {/* In a real app, this would link to a pricing page or initiate upgrade flow */}
          <Button onClick={() => { console.log('Navigating to upgrade page...'); onClose(); }}>
            Upgrade to Pro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
