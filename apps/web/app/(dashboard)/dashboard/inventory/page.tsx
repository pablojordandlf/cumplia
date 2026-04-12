'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef, Row } from '@tanstack/react-table'
import {
  Plus,
  Eye,
  Trash2,
  Sparkles,
  Bot,
  FileCheck,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PageShell, PageHeader } from '@/components/ui/page-shell'
import { RiskBadge } from '@/components/risk-badge'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { hasPermission, MemberRole } from '@/lib/permissions'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OBLIGATIONS_BY_LEVEL: Record<string, number> = {
  prohibited: 2,
  high_risk: 8,
  limited_risk: 4,
  minimal_risk: 2,
  gpai_sr: 7,
  gpai_model: 3,
  gpai_system: 3,
  unclassified: 1,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseCase {
  id: string
  name: string
  sector: string
  status: string
  ai_act_level: string
  created_at: string
  tags?: string[]
}

interface ObligationsCount {
  completed: number
  total: number
}

interface RowData extends UseCase {
  obligationsCount?: ObligationsCount
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(
  obligationsCounts: Record<string, ObligationsCount>,
  canDelete: boolean,
  activeTag: string | null,
  setActiveTag: (tag: string | null) => void,
  onDelete: (id: string) => void
): ColumnDef<RowData>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nombre" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/inventory/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'sector',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sector" className="hidden md:flex" />
      ),
      cell: ({ row }) => (
        <span className="capitalize hidden md:block">{row.original.sector}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'ai_act_level',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Nivel AI Act" />
      ),
      cell: ({ row }) => (
        <RiskBadge level={row.original.ai_act_level || 'unclassified'} />
      ),
      filterFn: (row, _columnId, filterValue) =>
        row.original.ai_act_level === filterValue,
    },
    {
      id: 'tags',
      header: 'Etiquetas',
      accessorFn: (row) => (row.tags ?? []).join(', '),
      cell: ({ row }) => {
        const tags = row.original.tags ?? []
        if (tags.length === 0) {
          return <span className="text-gray-400 text-sm">—</span>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? 'default' : 'secondary'}
                className="cursor-pointer text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveTag(activeTag === tag ? null : tag)
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: 'obligations',
      header: 'Obligaciones',
      cell: ({ row }) => {
        const count = obligationsCounts[row.original.id]
        if (!count || count.total === 0) {
          return (
            <Link
              href={`/dashboard/inventory/${row.original.id}`}
              className="text-gray-400 text-sm hover:text-blue-600"
            >
              Ver detalles
            </Link>
          )
        }
        const { completed, total } = count
        const percentage = Math.round((completed / total) * 100)
        const isComplete = completed === total
        return (
          <Link
            href={`/dashboard/inventory/${row.original.id}`}
            className="flex items-center gap-3 group min-w-[140px]"
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`text-sm font-semibold ${
                  isComplete ? 'text-green-600' : 'text-blue-600'
                }`}
              >
                {completed}
              </span>
              <span className="text-gray-400 text-sm">/</span>
              <span className="text-gray-500 text-sm">{total}</span>
            </div>
            <Progress
              value={percentage}
              indicatorVariant={
                isComplete ? 'success' : percentage >= 50 ? 'gradient' : 'blue'
              }
              className="w-20 flex-1"
            />
            {isComplete && (
              <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
            )}
          </Link>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/inventory/${row.original.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          {canDelete && (
            <Button
              variant="outline"
              size="icon"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      enableSorting: false,
    },
  ]
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export const dynamic = 'force-dynamic'

export default function InventoryPage() {
  const [useCases, setUseCases] = useState<RowData[]>([])
  const [obligationsCounts, setObligationsCounts] = useState<
    Record<string, ObligationsCount>
  >({})
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<MemberRole | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchUserRole()
    fetchUseCases()
  }, [])

  const fetchUserRole = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: membership } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      if (membership) {
        setUserRole(membership.role as MemberRole)
      }
    } catch {
      // Role defaults to null — least privilege
    }
  }

  const fetchUseCases = async () => {
    try {
      setLoading(true)
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        toast.error('Autenticación requerida', { description: 'Por favor, inicia sesión para ver tu inventario.' })
        router.push('/login')
        return
      }

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      const organizationId = membership?.organization_id

      let query = supabase
        .from('use_cases')
        .select('*')
        .is('deleted_at', null)

      if (organizationId) {
        query = query.or(
          `organization_id.eq.${organizationId},user_id.eq.${session.user.id}`
        )
      } else {
        query = query.eq('user_id', session.user.id)
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      })

      if (error) throw error

      const cases: RowData[] = data || []
      setUseCases(cases)
      await loadObligationsCounts(cases)
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No se pudieron cargar los sistemas de IA.'
      toast.error('Error', { description: message })
    } finally {
      setLoading(false)
    }
  }

  const loadObligationsCounts = async (cases: RowData[]) => {
    try {
      const useCaseIds = cases.map((c) => c.id)
      if (useCaseIds.length === 0) return

      const { data: completedObligations } = await supabase
        .from('use_case_obligations')
        .select('use_case_id')
        .in('use_case_id', useCaseIds)
        .eq('is_completed', true)

      const completedCounts: Record<string, number> = {}
      completedObligations?.forEach((item: { use_case_id: string }) => {
        completedCounts[item.use_case_id] =
          (completedCounts[item.use_case_id] || 0) + 1
      })

      const counts: Record<string, ObligationsCount> = {}
      cases.forEach((useCase) => {
        const level = useCase.ai_act_level || 'unclassified'
        const total = OBLIGATIONS_BY_LEVEL[level] || 0
        const completed = completedCounts[useCase.id] || 0
        counts[useCase.id] = { completed, total }
      })

      setObligationsCounts(counts)
    } catch {
      // Non-critical — table shows "Ver detalles" fallback
    }
  }

  const handleDelete = useCallback(
    async (id: string) => {
      if (!userRole || !hasPermission(userRole, 'ai_systems:delete')) {
        toast.error('Sin permisos', { description: 'No tienes permisos para eliminar sistemas de IA.' })
        return
      }

      if (!confirm('¿Estás seguro de que deseas eliminar este sistema de IA?')) return

      try {
        const { error } = await supabase
          .from('use_cases')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id)

        if (error) throw error

        toast.success('Eliminado', { description: 'El sistema de IA ha sido eliminado correctamente.' })

        fetchUseCases()
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'No se pudo eliminar el sistema de IA.'
        toast.error('Error', { description: message })
      }
    },
    [userRole]
  )

  const canCreate = userRole ? hasPermission(userRole, 'ai_systems:create') : false
  const canDelete = userRole ? hasPermission(userRole, 'ai_systems:delete') : false
  const isViewer = userRole === 'viewer'

  // Tag pre-filter (applied before DataTable's own search)
  const tagFilteredData = activeTag
    ? useCases.filter((uc) => (uc.tags ?? []).includes(activeTag))
    : useCases

  const columns = buildColumns(
    obligationsCounts,
    canDelete,
    activeTag,
    setActiveTag,
    handleDelete
  )

  return (
    <PageShell className="max-w-7xl">
      <PageHeader
        title="Inventario de Sistemas de IA"
        description={
          isViewer
            ? 'Visualiza los sistemas de IA de tu organización'
            : 'Lista y gestiona tus sistemas de IA'
        }
        actions={
          <div className="flex gap-2">
            <Link href="/dashboard/admin">
              <Button variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Templates
              </Button>
            </Link>
            {canCreate && (
              <Link href="/dashboard/inventory/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir Sistema
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Active tag pill */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-500">Filtrando por etiqueta:</span>
          <Badge variant="default" className="text-xs">
            {activeTag}
          </Badge>
          <button
            className="text-xs text-gray-400 hover:text-gray-600 underline"
            onClick={() => setActiveTag(null)}
          >
            Quitar filtro
          </button>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <DataTable
          columns={columns}
          data={tagFilteredData}
          loading={loading}
          skeletonRows={8}
          toolbar={{
            searchPlaceholder: 'Buscar por nombre, sector o nivel...',
            searchKey: 'name',
            filters: [
              {
                key: 'ai_act_level',
                label: 'Nivel AI Act',
                options: [
                  { label: 'Prohibido', value: 'prohibited' },
                  { label: 'Alto Riesgo', value: 'high_risk' },
                  { label: 'Riesgo Limitado', value: 'limited_risk' },
                  { label: 'Riesgo Mínimo', value: 'minimal_risk' },
                  { label: 'No Clasificado', value: 'unclassified' },
                ],
              },
              {
                key: 'status',
                label: 'Estado',
                options: [
                  { label: 'Activo', value: 'active' },
                  { label: 'Borrador', value: 'draft' },
                  { label: 'Archivado', value: 'archived' },
                ],
              },
            ],
          }}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          emptyState={{
            icon: <Bot className="w-12 h-12 text-blue-300" />,
            title: activeTag
              ? `Sin sistemas con la etiqueta "${activeTag}"`
              : 'No hay sistemas de IA registrados',
            description: activeTag
              ? 'Prueba con otra etiqueta o quita el filtro.'
              : 'Comienza añadiendo tu primer sistema de IA para evaluar su cumplimiento con el AI Act.',
            action: canCreate && !activeTag ? (
              <Link href="/dashboard/inventory/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir primer sistema
                </Button>
              </Link>
            ) : undefined,
          }}
        />
      </div>
    </PageShell>
  )
}
