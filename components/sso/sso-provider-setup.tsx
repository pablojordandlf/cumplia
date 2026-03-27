'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSSOProviders } from '@/hooks/use-sso-providers';
import { SSOProviderFormData, MemberRole } from '@/types/sso';
import { validateDomainFormat, parseDomains } from '@/lib/sso/domain';
import { validateSAMLMetadata } from '@/lib/sso/saml';
import { AlertCircle, Check, Loader2 } from 'lucide-react';

interface SSOProviderSetupProps {
  organizationId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SSOProviderSetup({ organizationId, onSuccess, onCancel }: SSOProviderSetupProps) {
  const { createProvider, parseMetadata, isLoading, error: hookError } = useSSOProviders();
  const [step, setStep] = useState(1);
  
  // Form state
  const [name, setName] = useState('');
  const [metadataXml, setMetadataXml] = useState('');
  const [metadataUrl, setMetadataUrl] = useState('');
  const [domains, setDomains] = useState('');
  const [autoProvision, setAutoProvision] = useState(true);
  const [defaultRole, setDefaultRole] = useState<MemberRole>('viewer');
  
  // Validation state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [parsedMetadata, setParsedMetadata] = useState<{
    entityId: string;
    ssoUrl: string;
    certificate: string;
  } | null>(null);

  const validateStep1 = () => {
    if (!name.trim()) {
      setValidationError('El nombre del proveedor es obligatorio');
      return false;
    }
    
    if (!metadataXml.trim() && !metadataUrl.trim()) {
      setValidationError('Debes proporcionar el metadata XML o la URL del metadata');
      return false;
    }

    if (metadataXml.trim()) {
      const validation = validateSAMLMetadata(metadataXml);
      if (!validation.valid) {
        setValidationError(validation.error || 'Metadata XML inválido');
        return false;
      }

      const parsed = parseMetadata(metadataXml);
      if (!parsed) {
        setValidationError('No se pudo parsear el metadata SAML');
        return false;
      }
      
      setParsedMetadata(parsed);
    }

    setValidationError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!domains.trim()) {
      setValidationError('Debes especificar al menos un dominio');
      return false;
    }

    const domainList = parseDomains(domains);
    for (const domain of domainList) {
      const validation = validateDomainFormat(domain);
      if (!validation.valid) {
        setValidationError(`Dominio inválido "${domain}": ${validation.error}`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    const domainList = parseDomains(domains);
    
    const formData: SSOProviderFormData = {
      name: name.trim(),
      provider_type: 'saml',
      metadata_xml: metadataXml.trim() || undefined,
      metadata_url: metadataUrl.trim() || undefined,
      domains: domainList,
      auto_provision: autoProvision,
      default_role: defaultRole,
    };

    const provider = await createProvider(organizationId, formData);
    
    if (provider) {
      onSuccess?.();
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Configurar Proveedor SSO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            1
          </div>
          <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
            step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
        </div>

        {(validationError || hookError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError || hookError}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Nombre del Proveedor *</Label>
              <Input
                id="provider-name"
                placeholder="ej. Microsoft Azure AD"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata-xml">Metadata SAML XML</Label>
              <Textarea
                id="metadata-xml"
                placeholder="Pega aquí el XML de metadata de tu proveedor de identidad..."
                value={metadataXml}
                onChange={(e) => setMetadataXml(e.target.value)}
                rows={8}
                className="font-mono text-xs"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">O</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata-url">URL del Metadata</Label>
              <Input
                id="metadata-url"
                type="url"
                placeholder="https://idp.example.com/metadata"
                value={metadataUrl}
                onChange={(e) => setMetadataUrl(e.target.value)}
              />
            </div>

            {parsedMetadata && (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Metadata parseado correctamente
                  <ul className="mt-1 text-sm text-green-700">
                    <li>Entity ID: {parsedMetadata.entityId}</li>
                    <li>SSO URL: {parsedMetadata.ssoUrl}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domains">Dominios de Email *</Label>
              <Input
                id="domains"
                placeholder="empresa.com, filial.com"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separa múltiples dominios con comas. Los usuarios con estos dominios usarán SSO.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-provision">Aprovisionamiento Automático</Label>
                <p className="text-xs text-muted-foreground">
                  Crear automáticamente cuentas para nuevos usuarios SSO
                </p>
              </div>
              <Switch
                id="auto-provision"
                checked={autoProvision}
                onCheckedChange={setAutoProvision}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-role">Rol por Defecto</Label>
              <Select value={defaultRole} onValueChange={(v) => setDefaultRole(v as MemberRole)}>
                <SelectTrigger id="default-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Rol asignado automáticamente a nuevos usuarios SSO (solo Owner puede asignar Owner)
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step === 2 ? (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Atrás
            </Button>
          ) : (
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          
          {step === 1 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Proveedor
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
