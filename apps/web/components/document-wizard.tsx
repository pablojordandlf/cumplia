import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

// Placeholder types and components that would come from shadcn/ui or other libraries
// In a real app:
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Progress } from '@/components/ui/progress';
// import { AlertTriangle, Lock, FileText } from 'lucide-react';
// import { PlanBadge } from './plan-badge';
// import { UpgradeModal } from './upgrade-modal';

// Mock imports for standalone development
const MockButton = ({ children, ...props }: any) => <button {...props}>{children}</button>;
const MockCard = ({ children, className, ...props }: any) => <div className={`card ${className}`}>{children}</div>;
const MockCardContent = ({ children, ...props }: any) => <div className="card-content">{children}</div>;
const MockCardFooter = ({ children, ...props }: any) => <div className="card-footer">{children}</div>;
const MockCardHeader = ({ children, ...props }: any) => <div className="card-header">{children}</div>;
const MockCardTitle = ({ children, ...props }: any) => <h3 className="card-title">{children}</h3>;
const MockSelect = ({ children, ...props }: any) => <div className="select">{children}</div>;
const MockSelectContent = ({ children, ...props }: any) => <div className="select-content">{children}</div>;
const MockSelectItem = ({ children, ...props }: any) => <div className="select-item" {...props}>{children}</div>;
const MockSelectTrigger = ({ children, ...props }: any) => <div className="select-trigger" {...props}>{children}</div>;
const MockSelectValue = ({ children, ...props }: any) => <div className="select-value">{children}</div>;
const MockProgress = ({ value, ...props }: any) => (
  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '0.25rem', height: '0.5rem', overflow: 'hidden' }}>
    <div style={{ width: `${value}%`, backgroundColor: '#0f172a', height: '100%', transition: 'width 0.3s ease-in-out' }}></div>
  </div>
);
const MockLock = ({ ...props }) => <span role="img" aria-label="lock">🔒</span>;
const MockFileText = ({ ...props }) => <span role="img" aria-label="file-text">📄</span>;
const MockAlertTriangle = ({ ...props }) => <span role="img" aria-label="alert-triangle">⚠️</span>;
const MockPlanBadge = ({ plan, size }: any) => <span className={`plan-badge plan-${plan}-${size}`}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>;
const MockUpgradeModal = ({ isOpen, onClose, feature }: any) => (
  isOpen ? (
    <div className="mock-modal">
      <div className="mock-modal-content">
        <h4><MockAlertTriangle /> Upgrade Required</h4>
        <p>You need to upgrade to unlock {feature}.</p>
        <button onClick={onClose}>Close</button>
        <button onClick={() => { console.log('Navigate to upgrade'); onClose(); }}>Upgrade to Pro</button>
      </div>
    </div>
  ) : null
);
// --- ACTUAL COMPONENT ---

const documentTypes = [
  { key: 'ai_policy', label: 'AI Policy', requiresPro: false },
  { key: 'employee_notice', label: 'Employee Notice', requiresPro: false },
  { key: 'systems_register', label: 'Systems Register', requiresPro: true },
  { key: 'fria', label: 'FRIA', requiresPro: true },
  { key: 'candidate_notice', label: 'Candidate Notice', requiresPro: true },
];

interface DocumentWizardProps {
  userOrganizations: Array<{ id: string; name: string }>;
  currentUserOrgId: string;
  // In a real app, you might fetch these or pass them down
  // Example data structures
  useCases?: Array<{ id: string; name: string; }>;
}

export function DocumentWizard({ userOrganizations, currentUserOrgId, useCases }: DocumentWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOrgId, setSelectedOrgId] = useState(currentUserOrgId);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [generatedDocumentUrl, setGeneratedDocumentUrl] = useState<string | null>(null);

  const currentDocumentTypeConfig = documentTypes.find(doc => doc.key === selectedDocumentType);
  const requiresPro = currentDocumentTypeConfig?.requiresPro ?? false;

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedDocumentType) return; // Must select a document type
      const docConfig = documentTypes.find(doc => doc.key === selectedDocumentType);
      if (docConfig?.requiresPro) {
        // Check if user has Pro plan (mocked for now)
        const hasProPlan = true; // Replace with actual plan check
        if (!hasProPlan) {
          setIsUpgradeModalOpen(true);
          return; // Don't proceed if Pro is required and user doesn't have it
        }
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3); // Assume data confirmation happens implicitly or is simple
    } else if (currentStep === 3) {
      // Simulate API call to generate document
      setGenerationStatus('generating');
      setTimeout(() => {
        // Simulate success
        setGenerationStatus('success');
        setGeneratedDocumentUrl('http://example.com/document.pdf'); // Replace with actual URL
      }, 2000);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleCloseUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    // If modal is closed after trying to select a Pro doc, stay on step 1
    // Or decide on desired UX: navigate to billing, etc.
  };

  const handleDocumentTypeSelect = (value: string) => {
    setSelectedDocumentType(value);
    // If user selects a Pro document, and they don't have Pro, open modal
    const docConfig = documentTypes.find(doc => doc.key === value);
    if (docConfig?.requiresPro) {
       const hasProPlan = false; // Mock check
       if (!hasProPlan) {
         setIsUpgradeModalOpen(true);
       }
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Step 1: Select Document Type</h4>
      <Select value={selectedDocumentType} onValueChange={handleDocumentTypeSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a document type..." />
        </SelectTrigger>
        <SelectContent>
          {documentTypes.map((doc) => (
            <SelectItem key={doc.key} value={doc.key} disabled={doc.requiresPro && !true /* Mock check: disable if Pro needed and not owned */}>
              {doc.label} {doc.requiresPro ? <MockLock className="inline-block ml-1" /> : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {requiresPro && !isUpgradeModalOpen && <p className="text-sm text-gray-500">This requires the Pro plan.</p>}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold">Step 2: Confirm Details</h4>
      <p>Selected Document: {documentTypes.find(doc => doc.key === selectedDocumentType)?.label}</p>
      <p>Organization: {userOrganizations.find(org => org.id === selectedOrgId)?.name}</p>
      {/* Add more pre-filled data based on selectedDocumentType and useCases */}
      <p>Data confirmation will happen here. (Mocked for now)</p>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4 text-center">
      <h4 className="text-lg font-semibold">Step 3: Generating Document</h4>
      {generationStatus === 'generating' && (
        <>
          <p>Your document is being generated. This may take a moment.</p>
          <MockProgress value={50} /> {/* Example progress */}
        </>
      )}
      {generationStatus === 'success' && generatedDocumentUrl && (
        <>
          <p className="text-green-600 font-semibold">Document Generated Successfully!</p>
          <Button asChild>
            <a href={generatedDocumentUrl} target="_blank" rel="noopener noreferrer">
              <MockFileText /> Download Document
            </a>
          </Button>
        </>
      )}
      {generationStatus === 'error' && (
        <p className="text-red-600 font-semibold">Error generating document. Please try again.</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 text-center">
      <h4 className="text-lg font-semibold">Step 4: Generation Complete</h4>
      {generatedDocumentUrl ? (
        <>
          <p className="text-green-600 font-semibold">Document Generated Successfully!</p>
          <Button asChild>
            <a href={generatedDocumentUrl} target="_blank" rel="noopener noreferrer">
              <MockFileText /> Download Document
            </a>
          </Button>
        </>
      ) : (
        <p>An unexpected error occurred.</p>
      )}
    </div>
  );


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Document Generation Wizard</CardTitle>
        <CardContent>
          <p className="text-sm text-gray-500">
            Follow the steps to generate your compliance documents.
          </p>
        </CardContent>
      </CardHeader>
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 1 && currentStep < 4 && (
          <Button variant="outline" onClick={handlePreviousStep}>
            Previous
          </Button>
        )}
        {currentStep < 3 && (
          <Button onClick={handleNextStep} disabled={(currentStep === 1 && !selectedDocumentType) || (currentStep === 2 && !selectedOrgId)}>
            Next
          </Button>
        )}
        {currentStep === 3 && generationStatus !== 'generating' && (
           <Button onClick={() => {
               // Optionally reset or go back to step 1
               setCurrentStep(1);
               setSelectedDocumentType('');
               setGenerationStatus('idle');
           }}>
               Generate Another
           </Button>
        )}
      </CardFooter>
      
      {/* Upgrade Modal */}
      <MockUpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={handleCloseUpgradeModal} 
        feature={currentDocumentTypeConfig?.key as any || 'documents'} // Pass the correct feature
      />
    </Card>
  );
}
