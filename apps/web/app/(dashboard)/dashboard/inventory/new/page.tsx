'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, AlertCircle, ChevronLeft, FileText, Shield, HelpCircle, Play, Square, FlaskConical, Package, X, GripVertical, Pencil } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UseCaseSuggestions } from '@/components/use-case-suggestions';
import { DocumentAnalyzer, type ExtractedDocData } from '@/components/document-analyzer';
import { LimitGate } from '@/components/permission-gate';
import { useLimit } from '@/hooks/use-limit';
import { usePermissions } from '@/hooks/use-permissions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const MAX_FILE_SIZE = 500_000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Custom field interface
interface CustomField {
  id: string;
  key: string;
  value: string;
}

// Define the sectors
const sectors = [
  'finance',
  'healthcare',
  'education',
  'government',
  'retail',
  'technology',
  'entertainment',
  'manufacturing',
  'transportation',
  'other',
] as const;

// Define AI Act roles according to Article 3
const aiActRoles = [
  { value: 'provider', label: 'Proveedor', description: 'Desarrolla o hace desarrollar sistemas de IA' },
  { value: 'deployer', label: 'Usuario (Deployer)', description: 'Utiliza sistemas de IA bajo su autoridad' },
  { value: 'distributor', label: 'Distribuidor', description: 'Hace disponibles sistemas de IA en el mercado' },
  { value: 'importer', label: 'Importador', description: 'Introduce sistemas de IA en la UE desde terceros países' },
] as const;

// Tooltip component for PoC
function PoCTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-blue-500 transition-colors" />
      {show && (
        <span className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 w-64 leading-relaxed">
          <strong>¿Qué es una PoC?</strong><br/>
          Prueba de Concepto (Proof of Concept): Un proyecto piloto o demostración para validar la viabilidad técnica o de negocio antes de un despliegue completo.
        </span>
      )}
    </span>
  );
}

// Form schema using Zod - ai_act_level se calculará en el paso 2 (wizard de clasificación)
const useCaseFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  description: z.string().optional(),
  sector: z.enum(sectors),
  ai_act_role: z.enum(['provider', 'deployer', 'distributor', 'importer']),
  is_poc: z.boolean(),
});

export const dynamic = 'force-dynamic';

export default function NewUseCasePage() {
  const router = useRouter();
  const { limit, used, remaining, percentage, canUse, isLoading } = useLimit('useCases');
  const { can, isLoading: permLoading } = usePermissions();

  // Redirect viewers — they can read but not create systems
  useEffect(() => {
    if (!permLoading && !can('ai_systems:create')) {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos para crear sistemas de IA.',
        variant: 'destructive',
      });
      router.replace('/dashboard/inventory');
    }
  }, [permLoading, can, router]);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  
  const form = useForm<z.infer<typeof useCaseFormSchema>>({
    resolver: zodResolver(useCaseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sector: undefined,
      ai_act_role: undefined,
      is_poc: false,
    },
  });

  // Custom fields management functions
  function addCustomField() {
    if (!newFieldKey.trim() || !newFieldValue.trim()) {
      toast({ 
        title: 'Error', 
        description: 'El nombre y valor del campo son obligatorios', 
        variant: 'destructive' 
      });
      return;
    }

    const newField: CustomField = {
      id: crypto.randomUUID(),
      key: newFieldKey.trim(),
      value: newFieldValue.trim()
    };
    
    setCustomFields([...customFields, newField]);
    setNewFieldKey('');
    setNewFieldValue('');
    toast({ title: 'Campo añadido', description: 'El campo personalizado se ha añadido.' });
  }

  function updateCustomField(fieldId: string) {
    if (!editKey.trim() || !editValue.trim()) {
      toast({ 
        title: 'Error', 
        description: 'El nombre y valor del campo son obligatorios', 
        variant: 'destructive' 
      });
      return;
    }

    const updatedFields = customFields.map(field => 
      field.id === fieldId 
        ? { ...field, key: editKey.trim(), value: editValue.trim() }
        : field
    );
    
    setCustomFields(updatedFields);
    setEditingField(null);
    setEditKey('');
    setEditValue('');
    toast({ title: 'Campo actualizado', description: 'Los cambios se han guardado.' });
  }

  function deleteCustomField(fieldId: string) {
    const updatedFields = customFields.filter(field => field.id !== fieldId);
    setCustomFields(updatedFields);
    toast({ title: 'Campo eliminado', description: 'El campo personalizado se ha eliminado.' });
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

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded w-96"></div>
        </div>
      </div>
    );
  }

  // If cannot create more use cases, show upgrade prompt
  if (!canUse) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Sistema de IA</h1>
        </div>

        <Card className="max-w-2xl mx-auto border-red-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Has alcanzado el límite de sistemas de IA
            </h2>
            <p className="text-gray-600 mb-6">
              Tu plan actual permite gestionar hasta <strong>{limit}</strong> sistemas de IA.
              Para añadir más sistemas, actualiza tu plan.
            </p>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Uso actual</span>
                <span className="font-medium">{used} / {limit}</span>
              </div>
              <Progress value={100} className="h-2 bg-red-200" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/pricing">
                <Button size="lg">
                  Ver planes superiores
                </Button>
              </Link>
              <Link href="/dashboard/inventory">
                <Button variant="outline" size="lg">
                  Volver al inventario
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  function handleDocumentExtraction(data: ExtractedDocData) {
    if (data.name) form.setValue('name', data.name, { shouldValidate: true });
    if (data.description) form.setValue('description', data.description, { shouldValidate: true });
    if (data.sector && sectors.includes(data.sector as typeof sectors[number])) {
      form.setValue('sector', data.sector as typeof sectors[number], { shouldValidate: true });
    }
    if (data.ai_act_role && ['provider', 'deployer', 'distributor', 'importer'].includes(data.ai_act_role)) {
      form.setValue('ai_act_role', data.ai_act_role as 'provider' | 'deployer' | 'distributor' | 'importer', { shouldValidate: true });
    }
    if (data.is_poc !== null) {
      form.setValue('is_poc', data.is_poc, { shouldValidate: true });
    }

    const extraFields: CustomField[] = [];
    if (data.provider) extraFields.push({ id: crypto.randomUUID(), key: 'Proveedor', value: data.provider });
    if (data.ai_owner) extraFields.push({ id: crypto.randomUUID(), key: 'AI Owner', value: data.ai_owner });
    if (data.version) extraFields.push({ id: crypto.randomUUID(), key: 'Versión', value: data.version });
    if (extraFields.length) setCustomFields((prev) => [...prev, ...extraFields]);
  }

  async function onSubmit(values: z.infer<typeof useCaseFormSchema>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: 'Error de Autenticación',
          description: 'Debes iniciar sesión para crear un sistema de IA.',
          variant: 'destructive',
        });
        router.push('/auth/login');
        return;
      }

      // Resolve the user's organization so the system is visible to all org members
      const { data: memberData } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      // Crear el sistema de IA como borrador - ai_act_level será calculado en el paso 2
      const { data: newUseCase, error } = await supabase.from('use_cases').insert([
        {
          user_id: session.user.id,
          organization_id: memberData?.organization_id ?? null,
          name: values.name,
          description: values.description,
          sector: values.sector,
          ai_act_role: values.ai_act_role,
          status: 'draft',
          ai_act_level: 'unclassified',
          is_poc: values.is_poc || false,
          custom_fields: customFields.length > 0 ? customFields : [],
        },
      ]).select('id').single();

      if (error) throw error;

      toast({
        title: 'Sistema de IA Creado',
        description: 'Continúa con el cuestionario de clasificación para determinar el nivel de riesgo AI Act.',
        variant: 'default',
      });
      // Redirigir al wizard de clasificación con el ID del nuevo caso
      router.push(`/dashboard/inventory/${newUseCase?.id}/classify`);
    } catch (error: any) {
      console.error('Error creating use case:', error);
      toast({
        title: 'Error al Crear Sistema de IA',
        description: error.message || 'Hubo un problema al guardar tu sistema de IA. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      {/* Header con StepIndicator */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/inventory">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Sistema de IA</h1>
            <p className="text-gray-600">Registra un nuevo sistema de IA en dos pasos</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center">
            {/* Step 1 - Active */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-gray-900">Información Básica</p>
                <p className="text-sm text-gray-500">Nombre, sector, rol</p>
              </div>
            </div>
            
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-gray-200 mx-4">
              <div className="h-full bg-gray-300 w-1/2"></div>
            </div>
            
            {/* Step 2 - Pending */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-semibold">
                2
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-gray-500">Clasificación AI Act</p>
                <p className="text-sm text-gray-400">Cuestionario de riesgo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de inspiración - Casos de uso sugeridos - AHORA ANTES DEL PASO 1 */}
      <div className="max-w-3xl mx-auto mb-6">
        <UseCaseSuggestions
          onSelectCase={(useCase) => {
            form.setValue('name', useCase.name);
            form.setValue('description', useCase.description);
            form.setValue('sector', useCase.sector as any);
            toast({
              title: 'Caso precargado',
              description: `Se ha cargado la información de "${useCase.name}". Puedes modificarla antes de guardar.`,
            });
          }}
        />
      </div>

      {/* Document analyzer — IA-powered pre-fill */}
      <div className="max-w-3xl mx-auto mb-6">
        <DocumentAnalyzer onApply={handleDocumentExtraction} />
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paso 1: Información Básica
          </CardTitle>
          <CardDescription>
            Completa los datos iniciales de tu sistema de IA. El nivel de riesgo se calculará automáticamente en el paso siguiente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Sistema de IA</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Sistema de recomendación de productos" {...field} />
                    </FormControl>
                    <FormDescription>
                      Un nombre claro y descriptivo para tu sistema de IA.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe la funcionalidad principal, el propósito y el contexto de uso..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Detalles sobre qué hace el sistema, para quién y por qué.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sectors.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            <span className="capitalize">{sector}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El sector industrial o de actividad económica al que pertenece el sistema de IA.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado del sistema */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Estado del Sistema
                </h3>
                
                <FormField
                  control={form.control}
                  name="is_poc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        ¿Es una Prueba de Concepto (PoC)?
                        <PoCTooltip />
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              field.value ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <FlaskConical className="w-4 h-4" />
                            Sí, es PoC
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              !field.value ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Package className="w-4 h-4" />
                            No, es producción
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Una PoC es un proyecto piloto antes del despliegue completo.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              {/* Información Adicional - Campos personalizados */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Información Adicional
                </h3>
                <p className="text-sm text-gray-600">
                  Añade campos personalizados con información adicional sobre este sistema de IA.
                </p>

                {/* Add new field form */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3 text-sm">Añadir nuevo campo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-800 mb-1">Nombre del campo</label>
                      <input
                        type="text"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        placeholder="Ej: Responsable, URL, Proveedor..."
                        className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      />
                    </div>
                  </div>
                  <Button 
                    type="button"
                    onClick={addCustomField}
                    disabled={!newFieldKey.trim() || !newFieldValue.trim()}
                    className="mt-3"
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir campo
                  </Button>
                </div>

                {/* Custom fields list */}
                <div className="space-y-2">
                  {customFields.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg text-sm">
                      No hay campos adicionales. Añade información personalizada usando el formulario de arriba.
                    </div>
                  ) : (
                    customFields.map((field) => (
                      <div key={field.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        {editingField === field.id ? (
                          // Edit mode
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editKey}
                                onChange={(e) => setEditKey(e.target.value)}
                                placeholder="Nombre"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                placeholder="Valor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                type="button"
                                onClick={() => updateCustomField(field.id)}
                                size="sm"
                              >
                                Guardar
                              </Button>
                              <Button 
                                type="button"
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
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="font-medium text-gray-900 text-sm">{field.key}</span>
                                <span className="text-gray-600 text-sm ml-2">{field.value}</span>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                onClick={() => startEditing(field)}
                                variant="ghost"
                                size="sm"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                type="button"
                                onClick={() => deleteCustomField(field.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="ai_act_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol según AI Act</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aiActRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{role.label}</span>
                              <span className="text-xs text-gray-500">{role.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tu rol en la cadena de valor del sistema de IA según el Art. 3 del Reglamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Usage indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Uso de sistemas de IA</span>
                  <Badge variant="secondary" className="text-xs">
                    {used} / {limit === -1 ? '∞' : limit} usados
                  </Badge>
                </div>
                <Progress value={percentage} className="h-2" />
                <p className="text-xs text-blue-700 mt-2">
                  Te quedan {remaining === Infinity ? 'ilimitados' : remaining} sistemas disponibles en tu plan.
                </p>
              </div>

              {/* Info box about next step */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-blue-900 text-sm">Siguiente paso: Clasificación AI Act</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Después de guardar, completarás un cuestionario para determinar automáticamente el nivel de riesgo según el Reglamento Europeo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.push('/dashboard/inventory')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting} size="lg">
                  {form.formState.isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      Continuar al Paso 2
                      <svg className="ml-2 w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
