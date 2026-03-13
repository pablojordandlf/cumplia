'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

// Sectors matching backend catalog
const sectors = [
  { value: '', label: 'Selecciona un sector' },
  { value: 'healthcare', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'security', label: 'Seguridad Pública' },
  { value: 'employment', label: 'Empleo' },
  { value: 'transport', label: 'Transporte' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'justice', label: 'Justicia' },
  { value: 'other', label: 'Otro' },
];

export default function NewUseCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState<string>('');

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    };
    getUser();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!name || !description || !sector) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor, completa todos los campos.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para crear un caso de uso.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create use case directly in Supabase
      const { data: useCase, error } = await supabase
        .from('use_cases')
        .insert([
          {
            name,
            description,
            sector,
            user_id: user.id,
            status: 'draft',
            ai_act_level: 'unclassified',
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: 'Caso de uso creado',
        description: 'Redirigiendo al asistente de clasificación...',
      });
      
      // Redirect to classification wizard
      router.push(`/dashboard/inventory/${useCase.id}/classify`);
    } catch (error: any) {
      console.error('Error creating use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el caso de uso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/inventory');
  };

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nuevo Caso de Uso</h1>
          <p className="text-gray-600">Introduce los detalles para comenzar el proceso de clasificación.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm">
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Sistema de Detección de Fraude"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el caso de uso de IA..."
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                required
                className="mt-1 min-h-[150px]"
              />
            </div>

            <div>
              <Label htmlFor="sector">Sector</Label>
              <Select value={sector} onValueChange={(value: string) => setSector(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un sector" />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar y Continuar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
