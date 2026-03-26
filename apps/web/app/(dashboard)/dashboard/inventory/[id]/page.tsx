'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RiskBadge } from '@/components/risk-badge';
import { TransparencyObligations } from '@/components/transparency-obligations';
import { AIActChecklistTab } from '@/components/ai-act-checklist-tab';
import { SystemHistoryTab } from '@/components/system-history-tab';
import { CustomFieldsEditor } from '@/components/custom-fields-editor';
import { useCustomFieldTemplates } from '@/hooks/use-custom-field-templates';
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  AlertCircle,
  Clock,
  Package,
  FileText,
  Building2,
  Play,
  Square,
  FlaskConical,
  HelpCircle,
  ShieldAlert,
  Brain,
  Eye,
  ClipboardCheck,
  History
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RiskManagementTab } from '@/components/risks/risk-management-tab';
import { AI_ACT_RISK_CONFIG } from '@/types/risk-management';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { hasPermission, MemberRole, canEditSystems, canCreateSystems } from '@/lib/permissions';

interface CustomField {
  id: string;
  key: string;
  value: string;
}

interface UseCase {
  id: string;
  name: string;
  description: string;
  sector: string;
  ai_act_level: string;
  ai_act_role: string;
  status: string;
  is_poc: boolean;
  created_at: string;
  updated_at: string;
  classification_data: any;
  created_by: string;
  custom_fields: CustomField[];
  current_version_id?: string | null;
}

interface Version {
  id: string;
  version_number: number;
  classification_data: any;
  ai_act_level: string;
  created_at: string;
  created_by: string;
  notes: string;
}

interface TemplateField {
  id: string;
  key: string;
}

interface CustomFieldTemplate {
  id: string;
  name: string;
  description: string | null;
  applies_to: string;
  field_definitions: TemplateField[];
}

const riskLevels: Record<string, { label: string; color: string; icon: any; description: string }> = {
  prohibited: { label: 'Prohibido', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle, description: 'Este sistema está prohibido por el Artículo 5 del AI Act.' },
  high_risk: { label: 'Alto Riesgo', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle, description: 'Sistema de alto riesgo sujeto a obligaciones estrictas.' },
  limited_risk: { label: 'Riesgo Limitado', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Shield, description: 'Sujeto a obligaciones de transparencia (Art. 50).' },
  minimal_risk: { label: 'Riesgo Mínimo', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, description: 'Libre uso con códigos de conducta voluntarios.' },
  unclassified: { label: 'Sin Clasificar', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, description: 'Aún no se ha realizado la clasificación.' },
};

const aiActRoles: Record<string, string> = {
  provider: 'Proveedor',
  deployer: 'Usuario (Deployer)',
  distributor: 'Distribuidor',
  importer: 'Importador',
};

function PoCTooltip() {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center ml-2" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
      {show && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl z-50 w-80 leading-relaxed">
          <strong>¿Qué es una PoC?</strong><br/>
          Prueba de Concepto (Proof of Concept): Un proyecto piloto o demostración para validar la viabilidad técnica o de negocio antes de un despliegue completo.<br/><br/>
          <strong>¿Qué NO es PoC?</strong><br/>
          Sistemas en producción, productos comerciales, o sistemas que procesan datos reales de usuarios finales.
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-8 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default function UseCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const useCaseId = params.id as string;
  
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [userRole, setUserRole] = useState<MemberRole | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [isPoCEditing, setIsPoCEditing] = useState(false);
  
  const { templates } = useCustomFieldTemplates();
  
  useEffect(() => {
    loadData();
    fetchUserRole();
  }, [useCaseId]);

  async function fetchUserRole() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      if (membership) {
        setUserRole(membership.role as MemberRole);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  }

  async function loadData() {
    try {
      const { data: useCaseData, error: useCaseError } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (useCaseError) throw useCaseError;
      setUseCase(useCaseData);
      
      const existingFields = useCaseData.custom_fields || [];
      setCustomFields(existingFields);

      const { data: versionsData, error: versionsError } = await supabase
        .from('use_case_versions')
        .select('*')
        .eq('use_case_id', useCaseId)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;
      setVersions(versionsData || []);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo cargar el sistema de IA', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function updateIsPoc(newValue: boolean) {
    if (!userRole || !hasPermission(userRole, 'ai_systems:update')) {
      toast({ title: 'Sin permisos', description: 'No tienes permisos para editar este sistema.', variant: 'destructive' });
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/use-cases/${useCaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_poc: newValue }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }

      const { useCase: updatedUseCase } = await response.json();
      setUseCase(updatedUseCase);
      setIsPoCEditing(false);
      toast({ title: 'Actualizado', description: `Estado cambiado a ${newValue ? 'PoC' : 'Producción'}` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveCustomFields(fields: CustomField[]) {
    if (!userRole || !hasPermission(userRole, 'ai_systems:update')) {
      throw new Error('No tienes permisos para editar este sistema.');
    }

    const response = await fetch(`/api/use-cases/${useCaseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_fields: fields }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update');
    }

    const { useCase: updatedUseCase } = await response.json();
    setUseCase(updatedUseCase);
    setCustomFields(fields);
  }

  async function deleteUseCase() {
    if (!userRole || !hasPermission(userRole, 'ai_systems:delete')) {
      toast({ title: 'Sin permisos', description: 'No tienes permisos para eliminar este sistema.', variant: 'destructive' });
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este sistema de IA? Esta acción no se puede deshacer.')) return;
    
    try {
      const { error } = await supabase
        .from('use_cases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', useCaseId);

      if (error) throw error;
      toast({ title: 'Eliminado', description: 'El sistema de IA ha sido eliminado.' });
      router.push('/dashboard/inventory');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Caso de uso no encontrado</h1>
            <p className="text-gray-600 mb-4">El sistema de IA que buscas no existe o ha sido eliminado.</p>
            <Link href="/dashboard/inventory">
              <Button>Volver al Inventario</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskInfo = riskLevels[useCase.ai_act_level] || riskLevels.unclassified;
  const RiskIcon = riskInfo.icon;
  const canEdit = userRole ? canEditSystems(userRole) : false;
  const canDelete = userRole ? hasPermission(userRole, 'ai_systems:delete') : false;
  const isViewer = userRole === 'viewer';

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/inventory">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{useCase.name}</h1>
              <p className="text-gray-600 text-sm">{useCase.sector} • Creado el {format(new Date(useCase.created_at), 'dd/MM/yyyy', { locale: es })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
              <Button variant="outline" size="sm" className="sm:size-default">
                <Shield className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">{useCase.ai_act_level === 'unclassified' ? 'Clasificar' : 'Reclasificar'}</span>
              </Button>
            </Link>
            {canEdit && (
              <Link href={`/dashboard/inventory/${useCaseId}/edit`}>
                <Button variant="outline" size="sm" className="sm:size-default">
                  <Pencil className="w-4 h-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </Link>
            )}
            {canDelete && (
              <Button variant="destructive" size="sm" className="sm:size-default" onClick={deleteUseCase}>
                <Trash2 className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Viewer Notice */}
        {isViewer && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Modo Visualizador:</strong> Solo puedes ver información de este sistema de IA. 
              Contacta al administrador si necesitas permisos para editar o clasificar.
            </p>
          </div>
        )}

        {/* Tabs Navigation */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="checklist">Checklist IA Act</TabsTrigger>
            <TabsTrigger value="obligations">Obligaciones</TabsTrigger>
            <TabsTrigger value="risks">Riesgos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* Tab: Información General */}
          <TabsContent value="general" className="space-y-6">
            {/* Risk Level Banner */}
            <Card className={`border-l-4 ${riskInfo.color.replace('bg-', 'border-l-').split(' ')[0]}`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${riskInfo.color}`}>
                    <RiskIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Nivel de Riesgo AI Act</h3>
                      <Badge className={riskInfo.color}>{riskInfo.label}</Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{riskInfo.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {useCase.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Descripción</label>
                    <p className="text-gray-600 mt-1">{useCase.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Sector</label>
                    <p className="text-gray-600 mt-1 capitalize">{useCase.sector}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Rol según AI Act</label>
                    <p className="text-gray-600 mt-1">{aiActRoles[useCase.ai_act_role] || useCase.ai_act_role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Estado</label>
                    <div className="flex items-center gap-2 mt-1 group">
                      {canEdit && !isPoCEditing ? (
                        <button
                          onClick={() => setIsPoCEditing(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          disabled={updating}
                        >
                          {useCase.is_poc ? (
                            <>
                              <FlaskConical className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">Prueba de Concepto (PoC)</span>
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-600">En Producción</span>
                            </>
                          )}
                          <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ) : canEdit && isPoCEditing ? (
                        <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={useCase.is_poc}
                              onChange={(e) => updateIsPoc(e.target.checked)}
                              disabled={updating}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">
                              {useCase.is_poc ? 'Prueba de Concepto (PoC)' : 'En Producción'}
                            </span>
                          </label>
                          <PoCTooltip />
                          <button
                            onClick={() => setIsPoCEditing(false)}
                            className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                          >
                            Cerrar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {useCase.is_poc ? (
                            <>
                              <FlaskConical className="w-4 h-4 text-blue-600" />
                              <span className="text-gray-600">Prueba de Concepto (PoC)</span>
                              <PoCTooltip />
                            </>
                          ) : (
                            <>
                              <Package className="w-4 h-4 text-gray-600" />
                              <span className="text-gray-600">En Producción</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Última actualización</label>
                    <p className="text-gray-600 mt-1">
                      {format(new Date(useCase.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Custom Fields Editor */}
                {useCase && (
                  <CustomFieldsEditor
                    useCase={{
                      id: useCase.id,
                      ai_act_level: useCase.ai_act_level,
                      custom_fields: useCase.custom_fields || [],
                    }}
                    applicableTemplates={templates.filter(t => 
                      t.applies_to === 'global' || 
                      (useCase.ai_act_level && t.applies_to.includes(useCase.ai_act_level.toLowerCase()))
                    )}
                    onSave={handleSaveCustomFields}
                    readOnly={!canEdit}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Checklist IA Act */}
          <TabsContent value="checklist">
            <AIActChecklistTab classificationData={useCase.classification_data} />
          </TabsContent>

          {/* Tab: Obligaciones */}
          <TabsContent value="obligations">
            <TransparencyObligations 
              useCase={useCase}
            />
          </TabsContent>

          {/* Tab: Gestión de Riesgos */}
          <TabsContent value="risks">
            <RiskManagementTab 
              aiSystemId={useCase.id} 
              aiActLevel={useCase.ai_act_level}
              isReadOnly={isViewer}
            />
          </TabsContent>

          {/* Tab: Historial */}
          <TabsContent value="history">
            <SystemHistoryTab 
              useCaseId={useCase.id}
              currentVersionId={useCase.current_version_id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
