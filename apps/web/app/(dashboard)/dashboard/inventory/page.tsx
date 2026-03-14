'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Eye, Search } from 'lucide-react';
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
import { RiskBadge } from '@/components/risk-badge'; // Assuming RiskBadge is available
import { supabase } from '@/lib/supabase'; // Assuming supabase client is configured
import { useToast } from '@/hooks/use-toast'; // Assuming useToast hook is available

// Define UseCase interface locally for clarity
interface UseCase {
  id: string;
  name: string;
  sector: string;
  status: string; // e.g., 'in_progress', 'completed', 'classified'
  ai_act_level: string; // e.g., 'prohibited', 'high_risk', 'limited_risk', 'minimal_risk', 'unclassified'
  created_at: string;
}

// Helper function to map API risk levels to RiskBadge levels
// This is a guess based on common patterns and the dashboard page's mapping
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

function mapApiRiskLevelForBadge(apiLevel: string): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    'prohibited': 'prohibited',
    'high_risk': 'high',
    'limited_risk': 'limited',
    'minimal_risk': 'minimal',
    'unclassified': 'unclassified',
  };
  return mapping[apiLevel] || 'unclassified';
}

// Define table columns
const columns = [
  { label: 'Nombre', accessor: 'name' },
  { label: 'Sector', accessor: 'sector' },
  { label: 'Estado', accessor: 'status' },
  { label: 'Nivel AI Act', accessor: 'ai_act_level' },
  { label: 'Acciones', accessor: 'actions' },
];

export const dynamic = 'force-dynamic';

export default function InventoryPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [filteredUseCases, setFilteredUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchUseCases();
  }, []);

  useEffect(() => {
    // Filter use cases based on search term
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
        // Redirect to login or show an error if not authenticated
        toast({
          title: 'Autenticación requerida',
          description: 'Por favor, inicia sesión para ver tu inventario.',
          variant: 'destructive',
        });
        router.push('/auth/login'); // Assuming a login route exists
        setLoading(false);
        return;
      }

      // Fetch use cases from Supabase
      const { data, error } = await supabase
        .from('use_cases')
        .select('id, name, sector, status, ai_act_level, created_at')
        .eq('user_id', session.user.id)
        .is('deleted_at', null) // Exclude soft-deleted items
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUseCases(data || []);
      setFilteredUseCases(data || []); // Initialize filtered list as well

    } catch (error: any) {
      console.error('Error fetching use cases:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los casos de uso.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (useCase: UseCase, accessor: string) => {
    switch (accessor) {
      case 'name':
        return (
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/inventory/${useCase.id}/classify`}>
              <a className="font-medium text-blue-600 hover:underline">{useCase.name}</a>
            </Link>
          </div>
        );
      case 'sector':
        return <span className="capitalize">{useCase.sector}</span>;
      case 'status':
        return <Badge variant="outline" className="capitalize">{useCase.status}</Badge>;
      case 'ai_act_level':
        return <RiskBadge level={mapApiRiskLevelForBadge(useCase.ai_act_level)} />;
      case 'actions':
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/inventory/${useCase.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/dashboard/inventory/${useCase.id}/classify`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        );
      default:
        return '';
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario de Casos de Uso</h1>
          <p className="text-gray-600 mt-1">Lista y gestiona tus sistemas de IA</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Caso de Uso
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar por nombre, sector, nivel de riesgo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Casos de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando...</div>
          ) : useCases.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aún no tienes casos de uso registrados.</p>
              <Link href="/dashboard/inventory/new">
                <Button variant="link" className="mt-2">
                  Crea tu primer caso de uso
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.label}</TableHead>
                ))}
              </TableHeader>
              <TableBody>
                {filteredUseCases.map((useCase) => (
                  <TableRow key={useCase.id}>
                    {columns.map((column, index) => (
                      <TableCell key={index}>
                        {renderCell(useCase, column.accessor)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
