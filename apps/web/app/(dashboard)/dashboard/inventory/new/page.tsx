'use client';

import Link from 'next/link';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LimitGate } from '@/components/permission-gate';
import { useLimit } from '@/hooks/use-permissions';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const MAX_FILE_SIZE = 500_000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Define the AI Act risk levels
const aiActRiskLevels = [
  'prohibited',
  'high_risk',
  'limited_risk',
  'minimal_risk',
  'unclassified',
] as const; // Using 'as const' for type safety

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

// Form schema using Zod
const useCaseFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  description: z.string().optional(),
  sector: z.enum(sectors),
  ai_act_level: z.enum(aiActRiskLevels),
  ai_act_role: z.enum(['provider', 'deployer', 'distributor', 'importer']),
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
      ai_act_level: undefined,
      ai_act_role: undefined,
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

      const { error } = await supabase.from('use_cases').insert([
        {
          user_id: session.user.id,
          name: values.name,
          description: values.description,
          sector: values.sector,
          ai_act_level: values.ai_act_level,
          ai_act_role: values.ai_act_role,
          status: 'created',
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Caso de Uso Creado',
        description: 'Tu nuevo caso de uso ha sido registrado exitosamente.',
        variant: 'success',
      });
      router.push('/dashboard/inventory'); // Redirect to inventory page on success
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
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/inventory">
          <Button variant="ghost" size="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo Caso de Uso</h1>
        <p className="text-gray-600 mt-1">Registra un nuevo sistema de IA</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Detalles del Caso de Uso</CardTitle>
          <CardDescription>
            Completa la información requerida para registrar tu sistema de IA.
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

              <FormField
                control={form.control}
                name="ai_act_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Riesgo AI Act</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el nivel de riesgo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {aiActRiskLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            <span className="capitalize">{level.replace('_', ' ')}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Clasificación del sistema de IA según el Reglamento Europeo AI Act.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
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

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => router.push('/dashboard/inventory')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8.001l-1.593 1.594c-.472-.472-.845-.992-1.135-1.594l1.207-1.207z"
                      ></path>
                    </svg>
                  )}
                  Guardar Caso de Uso
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
