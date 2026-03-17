'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Search, ArrowLeft, Trash2, Settings2, FileCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/risk-badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const OBLIGATIONS_BY_LEVEL: Record<string, number> = {
  prohibited: 2,
  high_risk: 8,
  limited_risk: 4,
  minimal_risk: 2,
  gpai_sr: 7,
  gpai_model: 3,
  gpai_system: 3,
  unclassified: 1,
};

interface UseCase {
  id: string;
  name: string;
  sector: string;
  status: string;
  ai_act_level: string;
  created_at: string;
}

interface ObligationsCount {
  completed: number;
  total: number;
}

const columns = [
  { label: 'Nombre', accessor: 'name' },
  { label: 'Sector', accessor: 'sector' },
  { label: 'Estado', accessor: 'status' },
  { label: 'Nivel AI Act', accessor: 'ai_act_level' },
  { label: 'Obligaciones', accessor: 'obligations' },
  { label: 'Acciones', accessor: 'actions' },
];

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [obligationsCounts, setObligationsCounts] = useState<Record<string, ObligationsCount>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUseCases();
  }, []);

  useEffect(() => {
    const results = useCases.filter(useCase =>
      useCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
      useCase.ai_act_level.replace('_', ' ').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUseCases(results);
  }, [searchTerm, useCases]);

  const fetchUseCases = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast({
          title: 'Autenticación requerida',
          description: 'Por favor, inicia sesión para ver tu inventario.',
          variant: 'destructive',
        });
        router.push('/auth/login');
        setLoading(false);
        return;
      }

      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single();

      const organizationId = membership?.organization_id;

      const { data, error } = await supabase
        .from('use_cases')
        .select('id, name, sector, status, ai_act_level, created_at')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const cases = data || [];
      setUseCases(cases);
      setFilteredUseCases(cases);

      await loadObligationsCounts(cases);

    } catch (error: any) {
      console.error('Error fetching use cases:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los sistemas de IA.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadObligationsCounts = async (cases: UseCase[]) => {
    try {
      const counts: Record<string, ObligationsCount> = {};
      const useCaseIds = cases.map(c => c.id);
      if (useCaseIds.length === 0) return;

      const { data: completedObligations } = await supabase
        .from('use_case_obligations')
        .select('use_case_id')
        .in('use_case_id', useCaseIds)
        .eq('is_completed', true);

      const completedCounts: Record<string, number> = {};
      completedObligations?.forEach((item: any) => {
        completedCounts[item.use_case_id] = (completedCounts[item.use_case_id] || 0) + 1;
      });

      cases.forEach(useCase => {
        const level = useCase.ai_act_level || 'unclassified';
        const total = OBLIGATIONS_BY_LEVEL[level] || 0;
        const completed = completedCounts[useCase.id] || 0;
        counts[useCase.id] = { completed, total };
      });

      setObligationsCounts(counts);
    } catch (error) {
      console.error('Error loading obligations counts:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este sistema de IA?')) return;
    
    try {
      const { error } = await supabase
        .from('use_cases')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: 'Eliminado',
        description: 'El sistema de IA ha sido eliminado correctamente.',
      });
      
      fetchUseCases();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el sistema de IA.',
        variant: 'destructive',
      });
    }
  };

  const renderObligationsCell = (useCase: UseCase) => {
    const count = obligationsCounts[useCase.id];
    if (!count || count.total === 0) {
      return (
        <Link href={`/dashboard/inventory/${useCase.id}`} className="text-gray-400 text-sm hover:text-blue-600">
          Ver detalles
        </Link>
      );
    }

    const { completed, total } = count;
    const percentage = Math.round((completed / total) * 100);
    const isComplete = completed === total;

    return (
      <Link href={`/dashboard/inventory/${useCase.id}`} className="flex items-center gap-2 group">
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-semibold ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
            {completed}
          </span>
          <span className="text-gray-400 text-sm">/</span>
          <span className="text-gray-500 text-sm">{total}</span>
        </div>
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }} />
        </div>
        {isComplete && <FileCheck className="w-4 h-4 text-green-500" />}
      </Link>
    );
  };

  const renderCell = (useCase: UseCase, accessor: string) => {
    switch (accessor) {
      case 'name':
        return (
          <Link href={`/dashboard/inventory/${useCase.id}`} className="font-medium text-blue-600 hover:underline">
            {useCase.name}
          </Link>
        );
      case 'sector':
        return <span className="capitalize">{useCase.sector}</span>;
      case 'status':
        return <Badge variant="outline" className="capitalize">{useCase.status}</Badge>;
      case 'ai_act_level':
        return <RiskBadge level={useCase.ai_act_level || 'unclassified'} />;
      case 'obligations':
        return renderObligationsCell(useCase);
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/inventory/${useCase.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(useCase.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return '';
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 px-0 sm:px-4">
                <ArrowLeft className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Volver al Dashboard</span>
              </Button>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventario de Sistemas de IA</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Lista y gestiona tus sistemas de IA</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin">
            <Button variant="outline" size="sm" className="sm:size-default">
              <Settings2 className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Administrar</span>
            </Button>
          </Link>
          <Link href="/dashboard/inventory/new">
            <Button size="sm" className="sm:size-default">
              <Plus className="mr-0 sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Añadir Sistema de IA</span>
              <span className="sm:hidden">Añadir</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-lg font-semibold">Lista de Sistemas de IA</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, sector o nivel..."
                className="w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUseCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No se encontraron sistemas de IA que coincidan con la búsqueda.' : 'No hay sistemas de IA registrados.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead
                        key={col.accessor}
                        className={`whitespace-nowrap ${col.accessor === 'sector' ? 'hidden md:table-cell' : ''}`}
                      >
                        {col.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUseCases.map((useCase) => (
                    <TableRow key={useCase.id}>
                      {columns.map((col) => (
                        <TableCell
                          key={`${useCase.id}-${col.accessor}`}
                          className={`whitespace-nowrap ${col.accessor === 'sector' ? 'hidden md:table-cell' : ''}`}
                        >
                          {renderCell(useCase, col.accessor)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
