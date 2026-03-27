'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Building2, Users, Globe, ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 empleados' },
  { value: '11-50', label: '11-50 empleados' },
  { value: '51-200', label: '51-200 empleados' },
  { value: '201-1000', label: '201-1000 empleados' },
  { value: '1000+', label: '1000+ empleados' },
];

const INDUSTRIES = [
  { value: 'technology', label: 'Tecnología' },
  { value: 'finance', label: 'Finanzas y Seguros' },
  { value: 'healthcare', label: 'Salud y Farmacéutica' },
  { value: 'education', label: 'Educación' },
  { value: 'manufacturing', label: 'Manufactura' },
  { value: 'retail', label: 'Retail y Comercio' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'legal', label: 'Servicios Legales' },
  { value: 'public_sector', label: 'Sector Público' },
  { value: 'other', label: 'Otro' },
];

const COUNTRIES = [
  { value: 'ES', label: 'España' },
  { value: 'MX', label: 'México' },
  { value: 'AR', label: 'Argentina' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CL', label: 'Chile' },
  { value: 'PE', label: 'Perú' },
  { value: 'FR', label: 'Francia' },
  { value: 'DE', label: 'Alemania' },
  { value: 'IT', label: 'Italia' },
  { value: 'PT', label: 'Portugal' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'UK', label: 'Reino Unido' },
  { value: 'OTHER', label: 'Otro' },
];

const PLAN_INFO = {
  free: {
    name: 'Starter',
    price: '0€',
    aiSystems: 1,
    users: 1,
    viewers: 'Ilimitados',
    features: ['Hasta 1 sistema de IA', '1 usuario (sin viewers)', 'Cumplimiento básico'],
  },
  starter: {
    name: 'Starter',
    price: '0€/mes',
    aiSystems: 1,
    users: 1,
    viewers: 'Ilimitados',
    features: ['Hasta 1 sistema de IA', '1 usuario (sin viewers)', 'Cumplimiento básico'],
  },
  professional: {
    name: 'Professional',
    price: '99€/mes',
    aiSystems: 15,
    users: 3,
    viewers: 'Ilimitados',
    features: ['Hasta 15 sistemas de IA', '3 usuarios (sin viewers)', 'Soporte prioritario', 'Plantillas avanzadas'],
  },
  business: {
    name: 'Business',
    price: '299€/mes',
    aiSystems: 'Ilimitados',
    users: 10,
    viewers: 'Ilimitados',
    features: ['Sistemas de IA ilimitados', '10 usuarios (sin viewers)', 'Soporte dedicado', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Personalizado',
    aiSystems: 'Ilimitados',
    users: 'Ilimitados',
    viewers: 'Ilimitados',
    features: ['Todo lo de Business', 'Usuarios ilimitados', 'SSO/SAML', 'On-premise opcional'],
  },
};

export default function OrganizationOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Form data
  const [orgName, setOrgName] = useState('');
  const [orgSize, setOrgSize] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgCountry, setOrgCountry] = useState('ES');
  const [selectedPlan, setSelectedPlan] = useState('professional');

  const totalSteps = 3;

  useEffect(() => {
    checkExistingOrg();
  }, []);

  async function checkExistingOrg() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Check if user already has an organization
      const { data: membership, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (membership) {
        // User already has an org, redirect to dashboard
        router.push('/dashboard');
        return;
      }
    } catch (error) {
      console.error('Error checking organization:', error);
    } finally {
      setIsChecking(false);
    }
  }

  const validateStep = () => {
    if (step === 1) {
      if (!orgName.trim()) {
        toast.error('El nombre de la organización es obligatorio');
        return false;
      }
      if (orgName.length < 2) {
        toast.error('El nombre debe tener al menos 2 caracteres');
        return false;
      }
    }
    if (step === 2) {
      if (!orgCountry) {
        toast.error('El país es obligatorio');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/organizations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName.trim(),
          size: orgSize || null,
          industry: orgIndustry || null,
          country: orgCountry,
          plan: selectedPlan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear la organización');
      }

      const data = await response.json();
      
      toast.success('¡Organización creada exitosamente!');
      
      // Redirect to dashboard with onboarding query param
      router.push('/dashboard?onboarding=complete');
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast.error(error.message || 'Error al crear la organización');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Verificando tu cuenta...</p>
        </div>
      </div>
    );
  }

  const planInfo = PLAN_INFO[selectedPlan as keyof typeof PLAN_INFO] || PLAN_INFO.professional;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configura tu organización
          </h1>
          <p className="text-gray-600">
            Completa los datos de tu empresa para comenzar a usar CumplIA
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Paso {step} de {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% completado</span>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step 1: Organization Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Información de la empresa
              </CardTitle>
              <CardDescription>
                Indica el nombre legal de tu organización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgName">
                  Nombre de la organización <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="orgName"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Ej: Acme Corporation S.L."
                  className="h-11"
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  Este nombre aparecerá en tus documentos de cumplimiento
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgSize">Tamaño de la empresa</Label>
                <Select value={orgSize} onValueChange={setOrgSize}>
                  <SelectTrigger id="orgSize" className="h-11">
                    <SelectValue placeholder="Selecciona el tamaño (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgIndustry">Sector/Industria</Label>
                <Select value={orgIndustry} onValueChange={setOrgIndustry}>
                  <SelectTrigger id="orgIndustry" className="h-11">
                    <SelectValue placeholder="Selecciona el sector (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location & Compliance */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Ubicación y cumplimiento
              </CardTitle>
              <CardDescription>
                Selecciona el país para aplicar la normativa correcta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="orgCountry">
                  País <span className="text-red-500">*</span>
                </Label>
                <Select value={orgCountry} onValueChange={setOrgCountry}>
                  <SelectTrigger id="orgCountry" className="h-11">
                    <SelectValue placeholder="Selecciona el país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Importante para el cumplimiento del AI Act UE y normativa local
                </p>
              </div>

              {/* Compliance Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Normativa aplicable
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Reglamento UE de Inteligencia Artificial (AI Act)</li>
                  <li>• GDPR - Protección de datos</li>
                  <li>• Normativa sectorial específica</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Plan Selection & Review */}
        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Selecciona tu plan
                </CardTitle>
                <CardDescription>
                  Puedes cambiar de plan en cualquier momento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(PLAN_INFO).filter(([key]) => key !== 'free').map(([key, plan]) => (
                    <div
                      key={key}
                      onClick={() => setSelectedPlan(key)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPlan === key
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        {selectedPlan === key && (
                          <CheckCircle2 className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-900 mb-2">{plan.price}</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{plan.aiSystems} sistemas de IA</p>
                        <p>{plan.users} usuarios + {plan.viewers} viewers</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Organización:</dt>
                    <dd className="font-medium">{orgName}</dd>
                  </div>
                  {orgSize && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Tamaño:</dt>
                      <dd>{COMPANY_SIZES.find(s => s.value === orgSize)?.label}</dd>
                    </div>
                  )}
                  {orgIndustry && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Sector:</dt>
                      <dd>{INDUSTRIES.find(i => i.value === orgIndustry)?.label}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">País:</dt>
                    <dd>{COUNTRIES.find(c => c.value === orgCountry)?.label}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <dt className="text-gray-600">Plan seleccionado:</dt>
                    <dd className="font-semibold text-blue-600">{planInfo.name}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Siguiente
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Crear organización
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
