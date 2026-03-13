'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import UseCaseCard from '@/components/use-case-card';
import EmptyState from '@/components/empty-state';
import FilterBar from '@/components/filter-bar';
import { useCasesApi, UseCase } from '@/lib/api/use-cases';
import { ApiError } from '@/lib/api/client';

// Map backend status to frontend status
type FrontendStatus = 'draft' | 'active' | 'archived';

const statusMap: Record<string, FrontendStatus> = {
  'draft': 'draft',
  'classified': 'active',
  'in_review': 'active',
  'compliant': 'active',
  'non_compliant': 'archived',
};

// Map backend ai_act_level to frontend riskLevel
type FrontendRiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

const riskLevelMap: Record<string, FrontendRiskLevel> = {
  'prohibited': 'prohibited',
  'high_risk': 'high',
  'limited_risk': 'limited',
  'minimal_risk': 'minimal',
  'unclassified': 'unclassified',
};

export default function InventoryPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Load use cases from API
  useEffect(() => {
    loadUseCases();
  }, []);

  const loadUseCases = async () => {
    try {
      setIsLoading(true);
      const filters: { sector?: string; status?: string; ai_act_level?: string } = {};
      if (sectorFilter) filters.sector = sectorFilter;
      if (statusFilter) filters.status = statusFilter;
      if (riskLevelFilter) filters.ai_act_level = riskLevelFilter;
      
      const data = await useCasesApi.list(filters);
      setUseCases(data);
    } catch (error) {
      console.error('Error loading use cases:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'No se pudieron cargar los casos de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (!isLoading) {
      loadUseCases();
    }
  }, [sectorFilter, statusFilter, riskLevelFilter]);

  // Client-side search filtering
  useEffect(() => {
    let results = useCases;

    if (searchQuery) {
      results = results.filter(
        (useCase) =>
          useCase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (useCase.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUseCases(results);
  }, [searchQuery, useCases]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setRiskLevelFilter(null);
    setSectorFilter(null);
    setStatusFilter(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await useCasesApi.delete(id);
      setUseCases(useCases.filter(uc => uc.id !== id));
      toast({
        title: 'Eliminado',
        description: 'Caso de uso eliminado correctamente',
      });
    } catch (error) {
      console.error('Error deleting use case:', error);
      toast({
        title: 'Error',
        description: error instanceof ApiError ? error.message : 'No se pudo eliminar el caso de uso',
        variant: 'destructive',
      });
    }
  };

  const filterBarProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    riskLevelFilter,
    onRiskLevelChange: setRiskLevelFilter,
    sectorFilter,
    onSectorChange: setSectorFilter,
    statusFilter,
    onStatusChange: setStatusFilter,
    onClearFilters: handleClearFilters,
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
                description={useCase.description || ''}
                sector={useCase.sector}
                riskLevel={riskLevelMap[useCase.ai_act_level] || 'unclassified'}
                status={statusMap[useCase.status] || 'draft'}
                onEdit={(id) => window.location.href = `/dashboard/inventory/${id}`}
                onDelete={handleDelete}
                onView={(id) => window.location.href = `/dashboard/inventory/${id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay casos de uso que coincidan con tus criterios."
            description="Intenta ajustar tus filtros o crear un nuevo caso de uso de IA."
            actionLabel="Crear caso de uso"
            onAction={() => window.location.href = '/dashboard/inventory/new'}
          />
        )}
      </main>
    </div>
  );
}
