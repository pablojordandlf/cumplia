'use client';

import React, { useState } from 'react';
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
import Link from 'next/link';

// Define the structure for sector options
interface SectorOption {
  value: string | null;
  label: string;
}

// Mock data for sectors (re-defined for this page's context, should ideally be imported)
const mockSectors: SectorOption[] = [
  { value: null, label: 'Selecciona un sector' },
  { value: 'health', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'public_safety', label: 'Seguridad Pública' },
  { value: 'employment', label: 'Empleo' },
  { value: 'transport', label: 'Transporte' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'justice', label: 'Justicia' },
  { value: 'other', label: 'Otros' },
];

export default function NewUseCasePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !description || !sector) {
      alert('Por favor, completa todos los campos.'); // Basic validation
      return;
    }

    // In a real application, you would POST this data.
    // For now, we'll simulate creation and redirect to the classification wizard.
    console.log('Creating new use case:', { name, description, sector });

    // Redirect to the classification wizard page.
    // In a real app, you might pass the created ID or data.
    router.push('/dashboard/inventory/new/classify');
  };

  const handleCancel = () => {
    router.push('/dashboard/inventory'); // Navigate back to the inventory list
  };

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
              <Select value={sector ?? ''} onValueChange={(value: string) => setSector(value === '' ? null : value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un sector" />
                </SelectTrigger>
                <SelectContent>
                  {mockSectors.map((s) => (
                    <SelectItem key={s.value || 'null'} value={s.value || ''}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Guardar y Continuar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
