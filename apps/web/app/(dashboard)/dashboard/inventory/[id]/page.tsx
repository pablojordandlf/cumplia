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
  RotateCcw,
  Play,
  Square,
  FlaskConical,
  HelpCircle,
  Plus,
  X,
  GripVertical,
  LayoutTemplate,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RiskManagementTab } from '@/components/risks/risk-management-tab';
import { AI_ACT_RISK_CONFIG } from '@/types/risk-management';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  is_active: boolean;
  is_poc: boolean;
  created_at: string;
  updated_at: string;
  classification_data: any;
  created_by: string;
  custom_fields: CustomField[];
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
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  
  // Templates state
  const [applicableTemplates, setApplicableTemplates] = useState<CustomFieldTemplate[]>([]);
  const [templateFields, setTemplateFields] = useState<CustomField[]>([]);

  useEffect(() => {
    loadData();
  }, [useCaseId]);

  async function loadData() {
    try {
      const { data: useCaseData, error: useCaseError } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (useCaseError) throw useCaseError;
      setUseCase(useCaseData);
      
      // Load custom fields
      const existingFields = useCaseData.custom_fields || [];
      setCustomFields(existingFields);

      // Load and apply templates
      await loadAndApplyTemplates(useCaseData.ai_act_level, existingFields);

      const { data: versionsData, error: versionsError } = await supabase
        .from('use_case_versions')
        .select('*')
        .eq('use_case_id', useCaseId)
        .order('version_number', { ascending: false });

      if (versionsError) throw versionsError;
      
      // If no versions exist but use case is classified, create initial version
      if ((!versionsData || versionsData.length === 0) && useCaseData?.classification_data) {
        await createInitialVersion(useCaseData);
        const { data: newVersionsData } = await supabase
          .from('use_case_versions')
          .select('*')
          .eq('use_case_id', useCaseId)
          .order('version_number', { ascending: false });
        setVersions(newVersionsData || []);
      } else {
        setVersions(versionsData || []);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo cargar el caso de uso', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function loadAndApplyTemplates(aiActLevel: string, existingFields: CustomField[]) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('Loading templates for ai_act_level:', aiActLevel);

      // Get global templates (applies_to = 'global')
      const { data: globalTemplates, error: globalError } = await supabase
        .from('custom_field_templates')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .eq('applies_to', 'global');

      if (globalError) {
        console.error('Error loading global templates:', globalError);
        throw globalError;
      }

      console.log('Global templates found:', globalTemplates?.length || 0);

      // Get risk-specific templates (only if aiActLevel is provided and not 'global')
      let riskTemplates: CustomFieldTemplate[] = [];
      if (aiActLevel && aiActLevel !== 'global' && aiActLevel !== 'unclassified') {
        const { data: riskData, error: riskError } = await supabase
          .from('custom_field_templates')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .eq('applies_to', aiActLevel);

        if (riskError) {
          console.error('Error loading risk-specific templates:', riskError);
        } else {
          riskTemplates = riskData || [];
          console.log('Risk-specific templates found for', aiActLevel, ':', riskTemplates.length);
        }
      }

      // Combine templates - global first, then specific
      const allTemplates = [...(globalTemplates || []), ...riskTemplates];
      
      // Remove duplicates (in case a template is both global and matches risk level)
      const uniqueTemplates = Array.from(new Map(allTemplates.map(t => [t.id, t])).values());
      
      console.log('Total unique applicable templates:', uniqueTemplates.length);
      setApplicableTemplates(uniqueTemplates);

      // Extract template fields that don't already exist in custom_fields
      const existingKeys = new Set(existingFields.map(f => f.key.toLowerCase()));
      const fieldsFromTemplates: CustomField[] = [];

      uniqueTemplates.forEach((template: CustomFieldTemplate) => {
        template.field_definitions.forEach((fieldDef: TemplateField) => {
          // Only add if this key doesn't already exist
          if (!existingKeys.has(fieldDef.key.toLowerCase())) {
            fieldsFromTemplates.push({
              id: `template-${template.id}-${fieldDef.id}`,
              key: fieldDef.key,
              value: '', // Empty by default
              isFromTemplate: true,
              templateName: template.name
            } as CustomField & { isFromTemplate: boolean; templateName: string });
          }
        });
      });

      console.log('Template fields to display:', fieldsFromTemplates.length);
      setTemplateFields(fieldsFromTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  async function createInitialVersion(useCaseData: UseCase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { error } = await supabase
        .from('use_case_versions')
        .insert({
          use_case_id: useCaseId,
          version_number: 1,
          classification_data: useCaseData.classification_data,
          ai_act_level: useCaseData.ai_act_level,
          created_by: session?.user?.id || useCaseData.created_by,
          notes: 'Versión inicial - Clasificación original',
        });

      if (error) {
        console.error('Error creating initial version:', error);
      }
    } catch (err) {
      console.error('Error creating initial version:', err);
    }
  }

  async function updateStatus(updates: Partial<UseCase>) {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('use_cases')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', useCaseId);

      if (error) throw error;
      
      setUseCase(prev => prev ? { ...prev, ...updates } : null);
      toast({ title: 'Actualizado', description: 'Los cambios se han guardado correctamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function deleteUseCase() {
    if (!confirm('¿Estás seguro de que deseas eliminar este caso de uso? Esta acción no se puede deshacer.')) return;
    
    try {
      const { error } = await supabase
        .from('use_cases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', useCaseId);

      if (error) throw error;
      toast({ title: 'Eliminado', description: 'El caso de uso ha sido eliminado.' });
      router.push('/dashboard/inventory');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  }

  // Custom Fields Management Functions
  async function addCustomField() {
    if (!newFieldKey.trim() || !newFieldValue.trim()) {
      toast({ title: 'Error', description: 'El nombre y valor del campo son obligatorios', variant: 'destructive' });
      return;
    }

    setUpdating(true);
    try {
      const newField: CustomField = {
        id: crypto.randomUUID(),
        key: newFieldKey.trim(),
        value: newFieldValue.trim()
      };
      
      const updatedFields = [...customFields, newField];
      
      const { error } = await supabase
        .from('use_cases')
        .update({ 
          custom_fields: updatedFields,
          updated_at: new Date().toISOString() 
        })
        .eq('id', useCaseId);

      if (error) throw error;
      
      setCustomFields(updatedFields);
      setNewFieldKey('');
      setNewFieldValue('');
      toast({ title: 'Campo añadido', description: 'El campo personalizado se ha guardado correctamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function updateCustomField(fieldId: string) {
    if (!editKey.trim() || !editValue.trim()) {
      toast({ title: 'Error', description: 'El nombre y valor del campo son obligatorios', variant: 'destructive' });
      return;
    }

    setUpdating(true);
    try {
      const updatedFields = customFields.map(field => 
        field.id === fieldId 
          ? { ...field, key: editKey.trim(), value: editValue.trim() }
          : field
      );
      
      const { error } = await supabase
        .from('use_cases')
        .update({ 
          custom_fields: updatedFields,
          updated_at: new Date().toISOString() 
        })
        .eq('id', useCaseId);

      if (error) throw error;
      
      setCustomFields(updatedFields);
      setEditingField(null);
      setEditKey('');
      setEditValue('');
      toast({ title: 'Campo actualizado', description: 'Los cambios se han guardado correctamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function deleteCustomField(fieldId: string) {
    if (!confirm('¿Estás seguro de que deseas eliminar este campo?')) return;

    setUpdating(true);
    try {
      const updatedFields = customFields.filter(field => field.id !== fieldId);
      
      const { error } = await supabase
        .from('use_cases')
        .update({ 
          custom_fields: updatedFields,
          updated_at: new Date().toISOString() 
        })
        .eq('id', useCaseId);

      if (error) throw error;
      
      setCustomFields(updatedFields);
      toast({ title: 'Campo eliminado', description: 'El campo personalizado se ha eliminado correctamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  function startEditing(field: CustomField) {
    setEditingField(field.id);
    setEditKey(field.key);
    setEditValue(field.value);
  }

  function cancelEditing() {
    setEditingField(null);
    setEditKey('');
    setEditValue('');
  }

  // Add a field from a template (pre-filled key, user provides value)
  async function addTemplateField(key: string, value: string) {
    setUpdating(true);
    try {
      const newField: CustomField = {
        id: crypto.randomUUID(),
        key: key,
        value: value
      };
      
      const updatedFields = [...customFields, newField];
      
      const { error } = await supabase
        .from('use_cases')
        .update({ 
          custom_fields: updatedFields,
          updated_at: new Date().toISOString() 
        })
        .eq('id', useCaseId);

      if (error) throw error;
      
      setCustomFields(updatedFields);
      // Remove from template fields since it's now saved
      setTemplateFields(prev => prev.filter(f => f.key !== key));
      
      toast({ title: 'Campo guardado', description: `El campo "${key}" se ha añadido correctamente.` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  }

  async function createVersion() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const newVersionNumber = versions.length > 0 ? Math.max(...versions.map(v => v.version_number)) + 1 : 1;
      
      const { error } = await supabase
        .from('use_case_versions')
        .insert({
          use_case_id: useCaseId,
          version_number: newVersionNumber,
          classification_data: useCase?.classification_data,
          ai_act_level: useCase?.ai_act_level,
          created_by: session?.user?.id,
          notes: 'Versión creada manualmente',
        });

      if (error) throw error;
      toast({ title: 'Versión Creada', description: `Se ha creado la versión ${newVersionNumber}` });
      loadData();
    } catch (error: any) {
      console.error('Error creating version:', error);
      toast({ title: 'Error', description: error.message || 'No se pudo crear la versión', variant: 'destructive' });
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
            <p className="text-gray-600 mb-4">El caso de uso que buscas no existe o ha sido eliminado.</p>
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
                <span className="sm:hidden">{useCase.ai_act_level === 'unclassified' ? 'Clasif.' : 'Reclasif.'}</span>
              </Button>
            </Link>
            <Link href={`/dashboard/inventory/${useCaseId}/edit`}>
              <Button variant="outline" size="sm" className="sm:size-default">
                <Pencil className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Editar</span>
              </Button>
            </Link>
            <Button variant="destructive" size="sm" className="sm:size-default" onClick={deleteUseCase}>
              <Trash2 className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Eliminar</span>
            </Button>
          </div>
        </div>

        {/* Mini Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Nivel de Riesgo AI Act</p>
                  <div className="mt-1">
                    <RiskBadge level={useCase.ai_act_level as any} />
                  </div>
                </div>
                <div className={`p-3 rounded-full ${riskInfo.color.split(' ')[0]}`}>
                  <RiskIcon className={`w-6 h-6 ${riskInfo.color.split(' ')[1]}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rol según AI Act</p>
                  <p className="font-semibold text-gray-900 mt-1">{aiActRoles[useCase.ai_act_role] || useCase.ai_act_role}</p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${useCase.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <p className="font-semibold text-gray-900 capitalize">{useCase.is_active ? 'Activo' : 'Obsoleto'}</p>
                    {useCase.is_poc && (
                      <Badge variant="secondary" className="text-xs">
                        <FlaskConical className="w-3 h-3 mr-1" />
                        PoC
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="summary" className="text-xs sm:text-sm">Resumen</TabsTrigger>
            <TabsTrigger value="classification" className="text-xs sm:text-sm">Clasificación</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" />
                Riesgos
                {useCase && (() => {
                  const config = AI_ACT_RISK_CONFIG[useCase.ai_act_level];
                  if (config?.availability === 'required') return <span className="text-red-500">*</span>;
                  if (config?.availability === 'recommended') return <span className="text-yellow-500">•</span>;
                  return null;
                })()}
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm">Estado</TabsTrigger>
            <TabsTrigger value="additional" className="text-xs sm:text-sm">Info. Adicional</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción</h4>
                    <p className="text-gray-600">{useCase.description || 'Sin descripción'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Sector</h4>
                      <p className="text-gray-600 capitalize">{useCase.sector}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Última actualización</h4>
                      <p className="text-gray-600">{format(new Date(useCase.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado del Sistema - Solo visualización en Resumen */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Estado del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Estado del Producto</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {useCase.is_active
                        ? 'Este caso de uso está actualmente activo y en uso.'
                        : 'Este caso de uso ha sido marcado como obsoleto.'}
                    </p>
                    <div className="flex gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        useCase.is_active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <Play className="w-4 h-4" />
                        {useCase.is_active ? 'Activo' : 'Inactivo'}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">¿Es una Prueba de Concepto (PoC)?</h4>
                      <PoCTooltip />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {useCase.is_poc
                        ? 'Este caso de uso es una Prueba de Concepto (proyecto piloto).'
                        : 'Este caso de uso es un sistema en producción.'}
                    </p>
                    <div className="flex gap-3">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        useCase.is_poc ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        <FlaskConical className="w-4 h-4" />
                        {useCase.is_poc ? 'Sí, es PoC' : 'No, es producción'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Campos Personalizados - Mostrar en Resumen */}
              {(customFields.length > 0 || templateFields.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Información Adicional
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Campos guardados */}
                      {customFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">{field.key}</h5>
                            <p className="text-gray-600">{field.value}</p>
                          </div>
                        </div>
                      ))}

                      {/* Campos de plantilla pendientes (vacíos) */}
                      {templateFields.map((field) => (
                        <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-slate-700 text-sm">{field.key}</h5>
                            <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-600">
                              plantilla
                            </Badge>
                          </div>
                          <span className="text-sm text-slate-400 italic">Sin completar</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Obligaciones de Transparencia según nivel de riesgo */}
              <TransparencyObligations useCase={useCase} />

            </div>
          </TabsContent>

          <TabsContent value="classification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Clasificación AI Act
                </CardTitle>
              </CardHeader>
              <CardContent>
                {useCase.classification_data ? (
                  <div className="space-y-6">
                    {/* Tipo de Sistema */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Tipo de Sistema</h4>
                      <p className="text-blue-800">
                        {useCase.classification_data.systemType === 'gpai_model' && 'Modelo de IA de Propósito General (GPAI Model)'}
                        {useCase.classification_data.systemType === 'gpai_sr' && 'Modelo GPAI con Riesgo Sistémico (GPAI-SR)'}
                        {useCase.classification_data.systemType === 'gpai_system' && 'Sistema de IA de Propósito General (GPAI System)'}
                        {useCase.classification_data.systemType === 'specific_purpose' && 'Sistema de IA de Finalidad Específica'}
                      </p>
                    </div>

                    {/* Resumen del Checklist - Artículo 5 (Prohibiciones) */}
                    {useCase.classification_data.systemType === 'specific_purpose' && (
                      <>
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-red-50 px-4 py-3 border-b">
                            <h4 className="font-semibold text-red-900 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Artículo 5 - Sistemas Prohibidos
                            </h4>
                          </div>
                          <div className="divide-y">
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Utiliza técnicas subliminales o manipulativas?</span>
                              <Badge variant={useCase.classification_data.isSubliminal === 'yes' ? 'destructive' : 'secondary'}>
                                {useCase.classification_data.isSubliminal === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Realiza puntuación social (social scoring)?</span>
                              <Badge variant={useCase.classification_data.isSocialScoring === 'yes' ? 'destructive' : 'secondary'}>
                                {useCase.classification_data.isSocialScoring === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Usa biometría en tiempo real en espacios públicos?</span>
                              <Badge variant={useCase.classification_data.isRealTimeBiometric === 'yes' ? 'destructive' : 'secondary'}>
                                {useCase.classification_data.isRealTimeBiometric === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Explota vulnerabilidades de grupos vulnerables?</span>
                              <Badge variant={useCase.classification_data.exploitsVulnerabilities === 'yes' ? 'destructive' : 'secondary'}>
                                {useCase.classification_data.exploitsVulnerabilities === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Resumen del Checklist - Artículo 6 (Alto Riesgo) */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-orange-50 px-4 py-3 border-b">
                            <h4 className="font-semibold text-orange-900 flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4" />
                              Artículo 6 - Sistemas de Alto Riesgo
                            </h4>
                          </div>
                          <div className="divide-y">
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Es sistema de identificación biométrica remota?</span>
                              <Badge variant={useCase.classification_data.isBiometricIdentification === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isBiometricIdentification === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isBiometricIdentification === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Gestiona infraestructura crítica (transporte, agua, gas, electricidad)?</span>
                              <Badge variant={useCase.classification_data.isCriticalInfrastructure === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isCriticalInfrastructure === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isCriticalInfrastructure === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Afecta a educación o formación profesional?</span>
                              <Badge variant={useCase.classification_data.isEducationVocational === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isEducationVocational === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isEducationVocational === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Afecta a empleo, gestión de trabajadores o acceso a trabajo?</span>
                              <Badge variant={useCase.classification_data.isEmployment === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isEmployment === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isEmployment === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Gestiona acceso a servicios esenciales (crédito, seguros, servicios públicos)?</span>
                              <Badge variant={useCase.classification_data.isAccessToServices === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isAccessToServices === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isAccessToServices === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Usado por autoridades policiales o fuerzas del orden?</span>
                              <Badge variant={useCase.classification_data.isLawEnforcement === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isLawEnforcement === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isLawEnforcement === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Gestiona migración, asilo o control de fronteras?</span>
                              <Badge variant={useCase.classification_data.isMigrationAsylum === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isMigrationAsylum === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isMigrationAsylum === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Administra justicia o procesos democráticos?</span>
                              <Badge variant={useCase.classification_data.isJusticeDemocratic === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isJusticeDemocratic === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isJusticeDemocratic === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Es componente de seguridad de producto regulado?</span>
                              <Badge variant={useCase.classification_data.isSafetyComponent === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isSafetyComponent === 'yes' ? 'bg-orange-500' : ''}>
                                {useCase.classification_data.isSafetyComponent === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Resumen del Checklist - Artículo 50 (Riesgo Limitado) */}
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-yellow-50 px-4 py-3 border-b">
                            <h4 className="font-semibold text-yellow-900 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Artículo 50 - Obligaciones de Transparencia
                            </h4>
                          </div>
                          <div className="divide-y">
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Interactúa con humanos (chatbots, asistentes virtuales)?</span>
                              <Badge variant={useCase.classification_data.interactsWithHumans === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.interactsWithHumans === 'yes' ? 'bg-yellow-500 text-yellow-950' : ''}>
                                {useCase.classification_data.interactsWithHumans === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Reconoce emociones o características sociales?</span>
                              <Badge variant={useCase.classification_data.isEmotionRecognition === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isEmotionRecognition === 'yes' ? 'bg-yellow-500 text-yellow-950' : ''}>
                                {useCase.classification_data.isEmotionRecognition === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Categoriza personas por características biométricas?</span>
                              <Badge variant={useCase.classification_data.isBiometricCategorization === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.isBiometricCategorization === 'yes' ? 'bg-yellow-500 text-yellow-950' : ''}>
                                {useCase.classification_data.isBiometricCategorization === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                            <div className="px-4 py-3 flex justify-between items-center">
                              <span className="text-gray-700">¿Genera deepfakes o contenido sintético?</span>
                              <Badge variant={useCase.classification_data.generatesDeepfakes === 'yes' ? 'default' : 'secondary'} className={useCase.classification_data.generatesDeepfakes === 'yes' ? 'bg-yellow-500 text-yellow-950' : ''}>
                                {useCase.classification_data.generatesDeepfakes === 'yes' ? 'Sí' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Información específica para GPAI */}
                    {useCase.classification_data.systemType?.startsWith('gpai') && (
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Sistema de IA de Propósito General
                        </h4>
                        <p className="text-purple-800 text-sm">
                          Los sistemas GPAI están sujetos a obligaciones específicas según el AI Act.
                          {useCase.classification_data.systemType === 'gpai_sr' && (
                            <span className="font-semibold"> Este modelo tiene riesgo sistémico y requiere evaluación adicional.</span>
                          )}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
                        <Button variant="outline">
                          <Pencil className="w-4 h-4 mr-2" />
                          Modificar Clasificación
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Este caso de uso aún no ha sido clasificado.</p>
                    <Link href={`/dashboard/inventory/${useCaseId}/classify`}>
                      <Button className="mt-4">Iniciar Clasificación</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  Gestión de Riesgos
                </CardTitle>
                <CardDescription>
                  {useCase && AI_ACT_RISK_CONFIG[useCase.ai_act_level] ? (
                    <>
                      Nivel AI Act: <strong>{AI_ACT_RISK_CONFIG[useCase.ai_act_level].label}</strong>
                      {' — '}
                      {AI_ACT_RISK_CONFIG[useCase.ai_act_level].availability === 'required' 
                        ? 'Gestión de riesgos obligatoria según Artículo 9'
                        : AI_ACT_RISK_CONFIG[useCase.ai_act_level].availability === 'recommended'
                        ? 'Gestión de riesgos recomendada'
                        : 'Gestión de riesgos opcional'
                      }
                    </>
                  ) : (
                    'Gestión de riesgos según nivel de clasificación AI Act'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {useCase && (
                  <RiskManagementTab 
                    aiSystemId={useCase.id} 
                    aiActLevel={useCase.ai_act_level} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Estado del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Estado del Producto</h4>
                  <p className="text-sm text-gray-600 mb-4">Marca si este caso de uso está activo u obsoleto.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus({ is_active: true })}
                      disabled={updating || useCase.is_active}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        useCase.is_active ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      Activo
                    </button>
                    <button
                      onClick={() => updateStatus({ is_active: false })}
                      disabled={updating || !useCase.is_active}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        !useCase.is_active ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Square className="w-4 h-4" />
                      Obsoleto
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">¿Es una Prueba de Concepto (PoC)?</h4>
                    <PoCTooltip />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Indica si es un proyecto piloto.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => updateStatus({ is_poc: true })}
                      disabled={updating || useCase.is_poc}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        useCase.is_poc ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <FlaskConical className="w-4 h-4" />
                      Sí, es PoC
                    </button>
                    <button
                      onClick={() => updateStatus({ is_poc: false })}
                      disabled={updating || !useCase.is_poc}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        !useCase.is_poc ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      No, es producción
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Información Adicional
                </CardTitle>
                <CardDescription>
                  Campos personalizados con información adicional sobre este caso de uso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Templates Info */}
                {applicableTemplates.length > 0 && (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-slate-600" />
                      Plantillas aplicadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {applicableTemplates.map((template) => (
                        <Badge key={template.id} variant="secondary" className="bg-slate-200 text-slate-700">
                          <LayoutTemplate className="w-3 h-3 mr-1" />
                          {template.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Los campos de estas plantillas aparecen marcados con
                      <span className="inline-flex items-center mx-1 px-1.5 py-0.5 bg-slate-200 text-slate-700 text-xs rounded">plantilla</span>
                      y se añaden automáticamente a este caso de uso.
                    </p>
                    <Link href="/dashboard/inventory/templates">
                      <Button variant="link" size="sm" className="text-slate-600 p-0 mt-1">
                        Gestionar plantillas →
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Add new field form */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Añadir nuevo campo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Nombre del campo</label>
                      <input
                        type="text"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        placeholder="Ej: Responsable, URL, Proveedor..."
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={updating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Valor</label>
                      <input
                        type="text"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="Introduce el valor..."
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={updating}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={addCustomField}
                    disabled={updating || !newFieldKey.trim() || !newFieldValue.trim()}
                    className="mt-3"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir campo
                  </Button>
                </div>

                {/* Template Fields (empty fields from templates) */}
                {templateFields.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-slate-600" />
                      Campos de plantillas
                    </h4>
                    {templateFields.map((field) => (
                      <div key={field.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium text-gray-900">{field.key}</h5>
                                <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-700">
                                  plantilla
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-500 italic">Campo vacío - rellena el valor para añadirlo</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Introduce valor..."
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const value = (e.target as HTMLInputElement).value;
                                  if (value.trim()) {
                                    addTemplateField(field.key, value.trim());
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                            <Button
                              onClick={(e) => {
                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                const value = input.value;
                                if (value.trim()) {
                                  addTemplateField(field.key, value.trim());
                                  input.value = '';
                                }
                              }}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom fields list (saved fields) */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Campos guardados
                  </h4>
                  {customFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>No hay campos guardados aún.</p>
                      <p className="text-sm mt-1">
                        {templateFields.length > 0 
                          ? 'Rellena los campos de plantilla arriba o añade campos personalizados nuevos.'
                          : 'Añade información personalizada usando el formulario de arriba.'}
                      </p>
                    </div>
                  ) : (
                    customFields.map((field) => (
                      <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {editingField === field.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                  type="text"
                                  value={editKey}
                                  onChange={(e) => setEditKey(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={updating}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  disabled={updating}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => updateCustomField(field.id)}
                                disabled={updating}
                                size="sm"
                              >
                                Guardar
                              </Button>
                              <Button 
                                onClick={cancelEditing}
                                variant="outline"
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-5 h-5 text-gray-400" />
                              <div>
                                <h5 className="font-medium text-gray-900">{field.key}</h5>
                                <p className="text-gray-600">{field.value}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => startEditing(field)}
                                variant="ghost"
                                size="sm"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteCustomField(field.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    Historial de Versiones
                  </CardTitle>
                  <CardDescription>
                    Registro de cambios en la clasificación.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={createVersion}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nueva Versión
                </Button>
              </CardHeader>
              <CardContent>
                {versions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No hay versiones guardadas.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {versions.map((version) => (
                      <div key={version.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="font-bold text-blue-600">v{version.version_number}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Versión {version.version_number}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(version.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </p>
                            {version.notes && (
                              <p className="text-sm text-gray-500 mt-1">{version.notes}</p>
                            )}
                          </div>
                        </div>
                        <RiskBadge level={version.ai_act_level as any} />
                      </div>
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
