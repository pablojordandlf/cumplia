'use client';

import Link from 'next/link';
import { useState } from 'react';
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
import { Plus, AlertCircle, ChevronLeft, FileText, Shield, HelpCircle, Play, Square, FlaskConical, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { UseCaseSuggestions } from '@/components/use-case-suggestions';
import { LimitGate } from '@/components/permission-gate';
import { useLimit } from '@/hooks/use-permissions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const MAX_FILE_SIZE = 500_000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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
  is_active: z.boolean(),
  is_poc: z.boolean(),
});

export const dynamic = 'force-dynamic';

export default function NewUseCasePage() {
  const router = useRouter();
  const { limit, used, remaining, percentage, canUse, isLoading } = useLimit('useCases');
  
  const form = useForm<z.infer<typeof useCaseFormSchema>>({
    resolver: zodResolver(useCaseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sector: undefined,
      ai_act_role: undefined,
      is_active: true,
      is_poc: false,
    },
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso de Uso</h1>
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

  async function onSubmit(values: z.infer<typeof useCaseFormSchema>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: 'Error de Autenticación',
          description: 'Debes iniciar sesión para crear un caso de uso.',
          variant: 'destructive',
        });
        router.push('/auth/login'); // Adjust if your login path is different
        return;
      }

      // Crear el caso de uso como borrador - ai_act_level será calculado en el paso 2
      const { data: newUseCase, error } = await supabase.from('use_cases').insert([
        {
          user_id: session.user.id,
          name: values.name,
          description: values.description,
          sector: values.sector,
          ai_act_role: values.ai_act_role,
          status: 'draft',
          ai_act_level: 'unclassified',
          is_active: values.is_active,
          is_poc: values.is_poc,
        },
      ]).select('id').single();

      if (error) throw error;

      toast({
        title: 'Caso de Uso Creado',
        description: 'Continúa con el cuestionario de clasificación para determinar el nivel de riesgo AI Act.',
        variant: 'default',
      });
      // Redirigir al wizard de clasificación con el ID del nuevo caso
      router.push(`/dashboard/inventory/${newUseCase?.id}/classify`);
    } catch (error: any) {
      console.error('Error creating use case:', error);
      toast({
        title: 'Error al Crear Caso de Uso',
        description: error.message || 'Hubo un problema al guardar tu caso de uso. Inténtalo de nuevo.',
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
            <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso de Uso</h1>
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
                    <FormLabel>Nombre del Caso de Uso</FormLabel>
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
                      El sector industrial o de actividad económica al que pertenece el caso de uso.
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
                  name="is_active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado del Producto</FormLabel>
                      <FormControl>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => field.onChange(true)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              field.value ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Play className="w-4 h-4" />
                            Activo
                          </button>
                          <button
                            type="button"
                            onClick={() => field.onChange(false)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              !field.value ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <Square className="w-4 h-4" />
                            Obsoleto
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Indica si el sistema está actualmente en uso o marcado como obsoleto.
                      </FormDescription>
                    </FormItem>
                  )}
                />

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

              {/* Sección de inspiración - Casos de uso sugeridos */}
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
