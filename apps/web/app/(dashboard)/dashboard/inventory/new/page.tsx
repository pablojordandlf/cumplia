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
import { Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Assuming supabase client is configured

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

// Define the sectors - This could be fetched from a DB or a config file in a real app
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

// Form schema using Zod
const useCaseFormSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  description: z.string().optional(),
  sector: z.enum(sectors, {
    required_error: 'Por favor, selecciona un sector.',
  }),
  ai_act_level: z.enum(aiActRiskLevels, {
    required_error: 'Por favor, selecciona un nivel de riesgo AI Act.',
  }),
  // ai_act_role is intentionally excluded as per instructions
});

export const dynamic = 'force-dynamic';

export default function NewUseCasePage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof useCaseFormSchema>>({
    resolver: zodResolver(useCaseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sector: undefined, // Set to undefined to trigger required_error if not selected
      ai_act_level: undefined, // Set to undefined to trigger required_error if not selected
    },
  });

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
          // Status defaults to 'created' or similar if not specified here, assuming DB has a default
          status: 'created', // Or whatever default status is appropriate
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
