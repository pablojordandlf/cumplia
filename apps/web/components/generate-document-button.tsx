import React from 'react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from './upgrade-modal'; // Assuming UpgradeModal is in the same directory
import { FileText, Lock } from 'lucide-react';

interface GenerateDocumentButtonProps {
  type: 'ai_policy' | 'employee_notice' | 'systems_register' | 'fria' | 'candidate_notice';
  disabled?: boolean;
  requiresPro?: boolean;
  onClick: () => void;
  // Add a prop to control modal visibility, managed by parent component
  isModalOpen?: boolean; 
  onModalClose?: () => void;
}

export function GenerateDocumentButton({ 
  type, 
  disabled, 
  requiresPro = false, 
  onClick, 
  isModalOpen = false, 
  onModalClose 
}: GenerateDocumentButtonProps) {

  const handleClick = () => {
    if (requiresPro && !isModalOpen) { // Only open modal if not already visible
      // The parent component will handle opening the modal based on the 'requiresPro' flag
      // and calling onModalOpen if needed. This button just triggers the overall action.
      onClick(); 
    } else {
      onClick();
    }
  };

  const buttonContent = (
    <>
      {requiresPro && <Lock className="h-4 w-4 mr-1" />} {/* Show lock icon if Pro is required */}
      {type === 'ai_policy' && 'Generate AI Policy'}
      {type === 'employee_notice' && 'Generate Employee Notice'}
      {type === 'systems_register' && 'Generate Systems Register'}
      {type === 'fria' && 'Generate FRIA'}
      {type === 'candidate_notice' && 'Generate Candidate Notice'}
    </>
  );

  return (
    <>
      <Button 
        onClick={handleClick} 
        disabled={disabled || (requiresPro && isModalOpen)} // Disable if Pro required and modal is open 
        className={requiresPro ? 'flex items-center gap-1' : 'flex items-center gap-1'}
      >
        <FileText className="h-4 w-4" />
        {buttonContent}
      </Button>

      {/* UpgradeModal component, its visibility is controlled by the prop */}
      {requiresPro && onModalClose && (
        <UpgradeModal 
          feature={type === 'ai_policy' || type === 'fria' || type === 'systems_register' ? 'documents' : 'use_cases'} // Example mapping
          isOpen={isModalOpen} 
          onClose={onModalClose} 
        />
      )}
    </>
  );
}
