'use client';

import { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSSO } from '@/hooks/use-sso';
import { SSOButton } from './sso-button';
import { SSODomainCheckResult } from '@/types/sso';
import { Loader2 } from 'lucide-react';

interface SSODomainCheckerProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSSOFound?: (result: SSODomainCheckResult) => void;
  className?: string;
}

export function SSODomainChecker({ 
  email, 
  onEmailChange, 
  onSSOFound,
  className 
}: SSODomainCheckerProps) {
  const { checkDomain, initiateSSO, isLoading } = useSSO();
  const [ssoResult, setSsoResult] = useState<SSODomainCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckDomain = useCallback(async (value: string) => {
    if (!value || !value.includes('@')) {
      setSsoResult(null);
      return;
    }

    const domain = value.split('@')[1];
    if (!domain || domain.length < 3) {
      setSsoResult(null);
      return;
    }

    setIsChecking(true);
    const result = await checkDomain(value);
    setIsChecking(false);
    
    if (result) {
      setSsoResult(result);
      if (result.hasSSO && onSSOFound) {
        onSSOFound(result);
      }
    } else {
      setSsoResult(null);
    }
  }, [checkDomain, onSSOFound]);

  // Debounced domain check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (email.includes('@')) {
        handleCheckDomain(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, handleCheckDomain]);

  const handleSSOClick = async () => {
    if (!email) return;
    await initiateSSO(email);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="sso-email">Email</Label>
      <div className="relative">
        <Input
          id="sso-email"
          type="email"
          placeholder="tu@empresa.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          disabled={isLoading}
        />
        {isChecking && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {ssoResult?.hasSSO && ssoResult.provider && (
        <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <SSOButton
            providerName={ssoResult.provider.name}
            onClick={handleSSOClick}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
