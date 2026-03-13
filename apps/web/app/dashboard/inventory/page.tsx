'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UseCaseCard from '@/components/use-case-card';
import EmptyState from '@/components/empty-state';
import FilterBar from '@/components/filter-bar';
import { supabase } from '@/lib/supabase';

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

interface UseCase {
  id: string;
  name: string;
  description: string | null;
  sector: string;
  status: string;
  ai_act_level: string;
  created_at: string;
}

export default function InventoryPage() {
  const router = useRouter();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Get current user and load use cases
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        loadUseCases(session.user.id);
      } else {
        router.push('/login');
      }
    };
    init();
  }, [router]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('use-cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'use_cases',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Realtime change:', payload);
          if (payload.eventType === 'INSERT') {
            setUseCases((prev) => [payload.new as UseCase, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setUseCases((prev) =>
              prev.map((uc) => (uc.id === payload.new.id ? (payload.new as UseCase) : uc))
            );
          } else if (payload.eventType === 'DELETE') {
            setUseCases((prev) => prev.filter((uc) => uc.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadUseCases = async (userId: string) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('use_cases')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (sectorFilter) query = query.eq('sector', sectorFilter);
      if (statusFilter) query = query.eq('status', statusFilter);
      if (riskLevelFilter) query = query.eq('ai_act_level', riskLevelFilter);

      const { data, error } = await query;

      if (error) throw error;
      setUseCases(data || []);
    } catch (error: any) {
      console.error('Error loading use cases:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los casos de uso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    if (user && !isLoading) {
      loadUseCases(user.id);
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
      // Soft delete - set deleted_at timestamp
      const { error } = await supabase
        .from('use_cases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setUseCases(useCases.filter(uc => uc.id !== id));
      toast({
        title: 'Eliminado',
        description: 'Caso de uso eliminado correctamente',
      });
    } catch (error: any) {
      console.error('Error deleting use case:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el caso de uso',
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
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 -ml-2 sm:ml-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Volver al Dashboard</span>
            <span className="sm:hidden">Volver</span>
          </Button>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Inventario de Casos de Uso</h1>
        </div>
        <Link href="/dashboard/inventory/new" className="w-full sm:w-auto">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14"/>
            </svg>
            <span className="hidden sm:inline">Nuevo caso de uso</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        </Link>
      </header>

      <FilterBar {...filterBarProps} />

      <main className="mt-4 sm:mt-8">
        {filteredUseCases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUseCases.map((useCase) => (
              <UseCaseCard
                key={useCase.id}
                id={useCase.id}
                name={useCase.name}
                description={useCase.description || ''}
                sector={useCase.sector}
                riskLevel={riskLevelMap[useCase.ai_act_level] || 'unclassified'}
                status={statusMap[useCase.status] || 'draft'}
                onEdit={(id) => router.push(`/dashboard/inventory/${id}`)}
                onDelete={handleDelete}
                onView={(id) => router.push(`/dashboard/inventory/${id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay casos de uso que coincidan con tus criterios."
            description="Intenta ajustar tus filtros o crear un nuevo caso de uso de IA."
            actionLabel="Crear caso de uso"
            onAction={() => router.push('/dashboard/inventory/new')}
          />
        )}
      </main>
    </div>
  );
}
