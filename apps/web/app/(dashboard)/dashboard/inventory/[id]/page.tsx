'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Edit,
  History,
  FileText,
  Building2,
  Cpu,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const riskLevels: Record<string, { label: string; color: string; icon: any; description: string }> = {
  prohibited: {
    label: 'Prohibido',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertCircle,
    description: 'Este sistema de IA está prohibido por el Artículo 5 del AI Act y no puede desplegarse en la UE.',
  },
  high_risk: {
    label: 'Alto Riesgo',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle,
    description: 'Sistema de alto riesgo sujeto a obligaciones estrictas de cumplimiento.',
  },
  limited_risk: {
    label: 'Riesgo Limitado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Shield,
    description: 'Sujeto a obligaciones de transparencia (Art. 50).',
  },
  minimal_risk: {
    label: 'Riesgo Mínimo',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle2,
    description: 'Libre uso con recomendación de códigos de conducta voluntarios.',
  },
  unclassified: {
    label: 'Sin clasificar',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Shield,
    description: 'Aún no se ha completado la clasificación AI Act.',
  },
};

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  classified: 'Clasificado',
  in_review: 'En revisión',
  compliant: 'Cumplido',
  non_compliant: 'No cumplido',
};

const sectorLabels: Record<string, string> = {
  finance: 'Finanzas',
  healthcare: 'Salud',
  education: 'Educación',
  government: 'Gobierno',
  retail: 'Retail',
  technology: 'Tecnología',
  entertainment: 'Entretenimiento',
  manufacturing: 'Manufactura',
  transportation: 'Transporte',
  employment: 'Empleo',
  security: 'Seguridad',
  other: 'Otros',
};

const aiActRoles: Record<string, string> = {
  provider: 'Proveedor',
  deployer: 'Usuario (Deployer)',
  distributor: 'Distribuidor',
  importer: 'Importador',
};

interface UseCaseVersion {
  id: string;
  version_number: number;
  name: string;
  description: string;
  ai_act_level: string;
  classification_data: any;
  created_at: string;
  created_by_email?: string;
  version_notes?: string;
}

interface UseCase {
  id: string;
  name: string;
  description: string;
  sector: string;
  status: string;
  ai_act_level: string;
  ai_act_role: string;
  classification_data: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  updated_by?: string;
}

export default function UseCaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;
  
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [versions, setVersions] = useState<UseCaseVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadUseCase();
    loadVersions();
  }, [useCaseId]);

  async function loadUseCase() {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;
      setUseCase(data);
    } catch (error) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
      router.push('/dashboard/inventory');
    } finally {
      setLoading(false);
    }
  }

  async function loadVersions() {
    try {
      const { data, error } = await supabase
        .from('use_case_versions')
        .select('*')
        .eq('use_case_id', useCaseId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  }

  async function createNewVersion() {
    if (!useCase) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Get next version number
      const nextVersion = versions.length > 0 
        ? Math.max(...versions.map(v => v.version_number)) + 1 
        : 1;
      
      const { error } = await supabase
        .from('use_case_versions')
        .insert({
          use_case_id: useCaseId,
          version_number: nextVersion,
          name: useCase.name,
          description: useCase.description,
          sector: useCase.sector,
          ai_act_level: useCase.ai_act_level,
          ai_act_role: useCase.ai_act_role,
          classification_data: useCase.classification_data,
          created_by: session?.user?.id,
          version_notes: `Versión ${nextVersion} creada manualmente`,
        });

      if (error) throw error;

      toast({
        title: 'Versión creada',
        description: `Se ha creado la versión ${nextVersion} del caso de uso.`,
      });
      
      loadVersions();
    } catch (error: any) {
      console.error('Error creating version:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear la versión',
        variant: 'destructive',
      });
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded w-96"></div>
        </div>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No se encontró el caso de uso</p>
            <Link href="/dashboard/inventory">
              <Button className="mt-4">Volver al inventario</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskInfo = riskLevels[useCase.ai_act_level] || riskLevels.unclassified;
  const RiskIcon = riskInfo.icon;

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{useCase.name}</h1>
              <p className="text-gray-600 text-sm">
                Creado el {format(new Date(useCase.created_at), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Editar Clasificación
              </Button>
            </Link>
          </div>
        </div>

        {/* Mini Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Risk Level Card */}
          <Card className={`border-2 ${riskInfo.color.replace('bg-', 'border-').split(' ')[0]}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${riskInfo.color.split(' ')[0]}`}>
                  <RiskIcon className={`w-6 h-6 ${riskInfo.color.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Nivel de Riesgo AI Act</p>
                  <p className={`font-semibold ${riskInfo.color.split(' ')[1]}`}>
                    {riskInfo.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-semibold text-gray-900">
                    {statusLabels[useCase.status] || useCase.status}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rol según AI Act</p>
                  <p className="font-semibold text-gray-900">
                    {aiActRoles[useCase.ai_act_role] || useCase.ai_act_role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <FileText className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="classification">
              <Cpu className="w-4 h-4 mr-2" />
              Clasificación
            </TabsTrigger>
            <TabsTrigger value="versions">
              <History className="w-4 h-4 mr-2" />
              Historial ({versions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Descripción</label>
                  <p className="mt-1 text-gray-900">{useCase.description || 'Sin descripción'}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sector</label>
                    <p className="mt-1 text-gray-900">{sectorLabels[useCase.sector] || useCase.sector}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Última actualización</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(useCase.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classification">
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Clasificación AI Act</CardTitle>
                <CardDescription>
                  Respuestas del cuestionario de clasificación
                </CardDescription>
              </CardHeader>
              <CardContent>
                {useCase.classification_data ? (
                  <ClassificationDetails data={useCase.classification_data} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aún no se ha completado la clasificación.</p>
                    <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
                      <Button className="mt-4">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Completar clasificación
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Historial de Versiones</CardTitle>
                  <CardDescription>
                    Registro de cambios del caso de uso
                  </CardDescription>
                </div>
                <Button onClick={createNewVersion} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva versión
                </Button>
              </CardHeader>
              <CardContent>
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay versiones previas registradas.</p>
                    <p className="text-sm mt-1">
                      Las versiones se crean automáticamente al modificar la clasificación.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {versions.map((version) => (
                      <Card key={version.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">v{version.version_number}</Badge>
                                <span className="font-medium">{version.name}</span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {version.version_notes}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(version.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </span>
                                {version.created_by_email && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {version.created_by_email}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge className={riskLevels[version.ai_act_level]?.color || riskLevels.unclassified.color}>
                              {riskLevels[version.ai_act_level]?.label || 'Sin clasificar'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Component to display classification details
function ClassificationDetails({ data }: { data: any }) {
  const sections = [
    {
      title: 'Tipo de Sistema',
      items: [
        { label: 'Tipo', value: data.systemType === 'gpai' ? 'GPAI' : data.systemType === 'standard' ? 'Estándar' : data.systemType === 'embedded' ? 'Embebido' : data.systemType === 'biometric' ? 'Biométrico' : data.systemType === 'safety' ? 'Seguridad' : data.systemType },
      ],
    },
    {
      title: 'Artículo 5 - Prácticas Prohibidas',
      color: 'red',
      items: [
        { label: 'Técnicas subliminales/manipuladoras', value: data.isSubliminal === 'yes' ? 'Sí ⚠️' : 'No' },
        { label: 'Explota vulnerabilidades', value: data.exploitsVulnerabilities === 'yes' ? 'Sí ⚠️' : 'No' },
        { label: 'Puntuación social', value: data.isSocialScoring === 'yes' ? 'Sí ⚠️' : 'No' },
        { label: 'Biometría remota tiempo real', value: data.isRealTimeBiometric === 'yes' ? 'Sí ⚠️' : 'No' },
      ],
    },
    {
      title: 'Artículo 6 - Alto Riesgo (Anexo III)',
      color: 'orange',
      items: [
        { label: 'Identificación biométrica', value: data.isBiometricIdentification === 'yes' ? 'Sí' : 'No' },
        { label: 'Infraestructura crítica', value: data.isCriticalInfrastructure === 'yes' ? 'Sí' : 'No' },
        { label: 'Educación/formación', value: data.isEducationVocational === 'yes' ? 'Sí' : 'No' },
        { label: 'Empleo', value: data.isEmployment === 'yes' ? 'Sí' : 'No' },
        { label: 'Acceso a servicios', value: data.isAccessToServices === 'yes' ? 'Sí' : 'No' },
        { label: 'Aplicación de la ley', value: data.isLawEnforcement === 'yes' ? 'Sí' : 'No' },
        { label: 'Migración/asilo', value: data.isMigrationAsylum === 'yes' ? 'Sí' : 'No' },
        { label: 'Justicia/procesos democráticos', value: data.isJusticeDemocratic === 'yes' ? 'Sí' : 'No' },
        { label: 'Componente de seguridad (Anexo II)', value: data.isSafetyComponent === 'yes' ? 'Sí' : 'No' },
      ],
    },
    {
      title: 'GPAI - Modelos de Propósito General',
      color: 'purple',
      items: [
        { label: 'Es GPAI', value: data.isGeneralPurposeAI === 'yes' ? 'Sí' : 'No' },
        ...(data.isGeneralPurposeAI === 'yes' ? [
          { label: 'Tiene riesgo sistémico', value: data.hasSystemicRisk === 'yes' ? 'Sí' : 'No' },
        ] : []),
      ],
    },
    {
      title: 'Artículo 50 - Interacción (Riesgo Limitado)',
      color: 'yellow',
      items: [
        { label: 'Interactúa con humanos', value: data.interactsWithHumans === 'yes' ? 'Sí' : 'No' },
        { label: 'Reconocimiento de emociones', value: data.isEmotionRecognition === 'yes' ? 'Sí' : 'No' },
        { label: 'Categorización biométrica', value: data.isBiometricCategorization === 'yes' ? 'Sí' : 'No' },
        { label: 'Genera deepfakes', value: data.generatesDeepfakes === 'yes' ? 'Sí' : 'No' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h4 className={`font-semibold mb-3 ${
            section.color === 'red' ? 'text-red-900' :
            section.color === 'orange' ? 'text-orange-900' :
            section.color === 'purple' ? 'text-purple-900' :
            section.color === 'yellow' ? 'text-yellow-900' :
            'text-gray-900'
          }`}>
            {section.title}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {section.items.map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className={`text-sm font-medium ${
                  item.value.includes('Sí ⚠️') ? 'text-red-600' :
                  item.value === 'Sí' ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
