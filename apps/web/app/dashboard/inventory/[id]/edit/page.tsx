'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const sectors = [
  { value: 'healthcare', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'security', label: 'Seguridad Pública' },
  { value: 'employment', label: 'Empleo' },
  { value: 'transport', label: 'Transporte' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'justice', label: 'Justicia' },
  { value: 'other', label: 'Otro' },
];

interface UseCase {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  status: string;
  ai_act_level: string;
  created_at: string;
  updated_at: string;
}

export default function EditUseCasePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const useCaseId = params.id as string;

  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    loadUseCase();
  }, [useCaseId]);

  const loadUseCase = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('use_cases')
        .select('*')
        .eq('id', useCaseId)
        .single();

      if (error) throw error;

      setUseCase(data);
      setName(data.name);
      setDescription(data.description || '');
      setSector(data.sector);
    } catch (error: any) {
      console.error('Error loading use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el caso de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('use_cases')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          sector,
          updated_at: new Date().toISOString(),
        })
        .eq('id', useCaseId)
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      toast({
        title: 'Guardado',
        description: 'Los cambios se han guardado correctamente',
      });

      router.push(`/dashboard/inventory/${useCaseId}`);
    } catch (error: any) {
      console.error('Error saving use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!useCase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Caso de uso no encontrado</p>
            <Link href="/dashboard/inventory">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inventario
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/inventory/${useCaseId}`}>
          <Button variant="ghost" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Editar Caso de Uso</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Caso de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sistema de evaluación de candidatos"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el propósito y funcionamiento del sistema de IA..."
              className="min-h-[120px]"
            />
            <p className="text-sm text-gray-500">
              Proporciona una descripción clara para facilitar la clasificación según el AI Act.
            </p>
          </div>

          {/* Sector */}
          <div className="space-y-2">
            <Label htmlFor="sector">Sector</Label>
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger id="sector">
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
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Link href={`/dashboard/inventory/${useCaseId}`}>
            <Button variant="outline" disabled={isSaving}>
              Cancelar
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar cambios
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
