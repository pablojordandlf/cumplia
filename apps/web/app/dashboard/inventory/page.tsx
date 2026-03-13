'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import UseCaseCard from '@/components/use-case-card'; // Assuming correct path
import EmptyState from '@/components/empty-state'; // Assuming correct path
import FilterBar from '@/components/filter-bar'; // Assuming correct path
import { cn } from '@/lib/utils'; // Assuming cn utility is available

// Define the available risk levels and status values
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';
type UseCaseStatus = 'draft' | 'active' | 'archived';

// Structure for a single Use Case
interface UseCase {
  id: string;
  name: string;
  description: string;
  sector: string;
  riskLevel: RiskLevel;
  status: UseCaseStatus;
}

// Mock data for Use Cases
const mockUseCases: UseCase[] = [
  {
    id: '1',
    name: 'Sistema de Reconocimiento Facial',
    description: 'Utiliza IA para identificar individuos en imágenes y videos de vigilancia, cumpliendo con regulaciones de privacidad.',
    sector: 'Seguridad Pública',
    riskLevel: 'high',
    status: 'active',
  },
  {
    id: '2',
    name: 'Recomendador de Contenido Personalizado',
    description: 'Ofrece sugerencias de productos y contenido basadas en el comportamiento del usuario, respetando el consentimiento explícito.',
    sector: 'Comercio Electrónico',
    riskLevel: 'limited',
    status: 'active',
  },
  {
    id: '3',
    name: 'Asistente Virtual para Atención al Cliente',
    description: 'Proporciona soporte automatizado mejorando la eficiencia, con opción de escalamiento humano.',
    sector: 'Servicios al Cliente',
    riskLevel: 'minimal',
    status: 'draft',
  },
   {
    id: '4',
    name: 'Sistema de Predicción de Fraude Financiero',
    description: 'Analiza transacciones para detectar actividades fraudulentas en tiempo real, con alta precisión y mitigación de sesgos.',
    sector: 'Finanzas',
    riskLevel: 'high',
    status: 'active',
  },
  {
    id: '5',
    name: 'Plataforma de Diagnóstico Médico Asistido por IA',
    description: 'Ayuda a los profesionales de la salud en el diagnóstico de enfermedades a partir de imágenes médicas, cumpliendo normativas estrictas.',
    sector: 'Salud',
    riskLevel: 'prohibited',
    status: 'archived', // Example of an archived use case
  },
  {
    id: '6',
    name: 'Herramienta de Traducción Automática',
    description: 'Facilita la comunicación multilingüe mediante traducción de texto y voz.',
    sector: 'Educación',
    riskLevel: 'minimal',
    status: 'active',
  },
];

// Mock data for sectors (for FilterBar)
const mockSectors: { value: string | null; label: string }[] = [
  { value: null, label: 'Todos los sectores' },
  { value: 'Seguridad Pública', label: 'Seguridad Pública' },
  { value: 'Comercio Electrónico', label: 'Comercio Electrónico' },
  { value: 'Servicios al Cliente', label: 'Servicios al Cliente' },
  { value: 'Finanzas', label: 'Finanzas' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Educación', label: 'Educación' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Justicia', label: 'Justicia' },
  { value: 'other', label: 'Otros' },
];

// Mock data for statuses (for FilterBar)
const mockStatuses: { value: UseCaseStatus | null; label: string }[] = [
  { value: null, label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
];


export default function InventoryPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevel | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<UseCaseStatus | null>(null);

  useEffect(() => {
    // In a real app, this would fetch data from an API
    setUseCases(mockUseCases);
  }, []);

  useEffect(() => {
    let results = useCases;

    // Apply search query filter
    if (searchQuery) {
      results = results.filter(
        (useCase) =>
          useCase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          useCase.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply risk level filter
    if (riskLevelFilter) {
      results = results.filter((useCase) => useCase.riskLevel === riskLevelFilter);
    }

    // Apply sector filter
    if (sectorFilter) {
      results = results.filter((useCase) => useCase.sector === sectorFilter);
    }

    // Apply status filter
    if (statusFilter) {
      results = results.filter((useCase) => useCase.status === statusFilter);
    }

    setFilteredUseCases(results);
  }, [searchQuery, riskLevelFilter, sectorFilter, statusFilter, useCases]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setRiskLevelFilter(null);
    setSectorFilter(null);
    setStatusFilter(null);
  };

  const handleEdit = (id: string) => {
    console.log(`Editing use case: ${id}`);
    // Navigate to edit page or open modal
  };

  const handleDelete = (id: string) => {
    console.log(`Deleting use case: ${id}`);
    // Implement delete logic, then update state
    setUseCases(useCases.filter(uc => uc.id !== id));
  };
    
  const handleView = (id: string) => {
    console.log(`Viewing use case: ${id}`);
    // Navigate to detail/view page
  };

  // Inject mock sector and status data for FilterBar component
  const filterBarProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    riskLevelFilter,
    onRiskLevelChange: setRiskLevelFilter as any, // Type assertion needed if FilterBar expects a specific union type
    sectorFilter,
    onSectorChange: setSectorFilter as any,
    statusFilter,
    onStatusChange: setStatusFilter as any,
    onClearFilters: handleClearFilters,
  };
    
  // Manually map mock sectors/statuses to the FilterBar's expected format if they differ
  // In this case, the mock data matches the FilterBar's internal definitions, so direct mapping is okay.
  // If FilterBar's internal lists were different, we would pass them as props.

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventario de Casos de Uso</h1>
        <Link href="/dashboard/inventory/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14"/>
            </svg>
            Nuevo caso de uso
          </Button>
        </Link>
      </header>

      <FilterBar {...filterBarProps} />

      <main className="mt-8">
        {filteredUseCases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUseCases.map((useCase) => (
              <UseCaseCard
                key={useCase.id}
                id={useCase.id}
                name={useCase.name}
                description={useCase.description}
                sector={useCase.sector}
                riskLevel={useCase.riskLevel}
                status={useCase.status}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay casos de uso que coincidan con tus criterios."
            description="Intenta ajustar tus filtros o crear un nuevo caso de uso de IA."
            actionLabel="Crear caso de uso"
            onAction={() => { /* Navigate to new use case page */ }}
          />
        )}
      </main>
    </div>
  );
}
