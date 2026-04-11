'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner'
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
import { FormSkeleton } from '@/components/ui/page-shell';
import { ChevronLeft, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  ai_act_role: z.enum(['provider', 'deployer', 'distributor', 'importer']),
});

export default function EditUseCasePage() {
  const router = useRouter();
  const params = useParams();
  const useCaseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const form = useForm<z.infer<typeof useCaseFormSchema>>({
    resolver: zodResolver(useCaseFormSchema),
    defaultValues: {
      name: '',
      description: '',
      sector: undefined,
      ai_act_role: undefined,
    },
  });

  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  async function loadUseCase() {
    try {
      const { data, error } = await supabase
        .from('use_cases')
        .select('name, description, sector, ai_act_role')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          name: data.name,
          description: data.description || '',
          sector: data.sector as any,
          ai_act_role: data.ai_act_role as any,
        });
      }
    } catch (error: any) {
      console.error('Error loading use case:', error);
      toast.error('Error', { description: error.message || 'No se pudo cargar el sistema de IA.' });
      router.push('/dashboard/inventory');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof useCaseFormSchema>) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('use_cases')
        .update({
          name: values.name,
          description: values.description,
          sector: values.sector,
          ai_act_role: values.ai_act_role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', useCaseId);

      if (error) throw error;

      toast.success('Sistema de IA Actualizado', { description: 'Los cambios han sido guardados correctamente.' });
      
      router.push(`/dashboard/inventory/${useCaseId}`);
    } catch (error: any) {
      console.error('Error updating use case:', error);
      toast.error('Error al Actualizar', { description: error.message || 'Hubo un problema al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <FormSkeleton fields={7} />
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/dashboard/inventory/${useCaseId}`}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Sistema de IA</h1>
            <p className="text-gray-600">Modifica los datos de tu sistema de IA</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información del Sistema
            </CardTitle>
            <CardDescription>
              Edita los datos básicos de tu sistema de IA.
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
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <FormField
                  control={form.control}
                  name="ai_act_role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol según AI Act</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <div className="flex justify-end gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => router.push(`/dashboard/inventory/${useCaseId}`)}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
