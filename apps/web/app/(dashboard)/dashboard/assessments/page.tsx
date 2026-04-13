'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Circle,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PageShell, PageHeader, StatCardsSkeleton } from '@/components/ui/page-shell'
import { RiskBadge } from '@/components/risk-badge'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SystemAssessment {
  id: string
  name: string
  ai_act_level: string
  status: string
  total_obligations: number
  completed_obligations: number
  in_progress_obligations: number
  completion_percentage: number
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  in_review: 'En revisión',
  approved: 'Aprobado',
  active: 'Activo',
  archived: 'Archivado',
}

const PRIORITY_ORDER: Record<string, number> = {
  prohibited: 0,
  high_risk: 1,
  limited_risk: 2,
  minimal_risk: 3,
  unclassified: 4,
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildColumns(): ColumnDef<SystemAssessment>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sistema" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/dashboard/inventory/${row.original.id}`}
          className="font-medium text-[#0B1C3D] hover:text-blue-600 hover:underline flex items-center gap-1.5 group"
        >
          {row.original.name}
          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
        </Link>
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
      filterFn: (row, _id, value) => row.original.ai_act_level === value,
      sortingFn: (a, b) =>
        (PRIORITY_ORDER[a.original.ai_act_level] ?? 99) -
        (PRIORITY_ORDER[b.original.ai_act_level] ?? 99),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize text-xs">
          {STATUS_LABELS[row.original.status] ?? row.original.status}
        </Badge>
      ),
      filterFn: (row, _id, value) => row.original.status === value,
    },
    {
      accessorKey: 'total_obligations',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.total_obligations}</span>
      ),
    },
    {
      accessorKey: 'completed_obligations',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Completadas" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-status-success font-medium">
          {row.original.completed_obligations}
        </span>
      ),
    },
    {
      accessorKey: 'in_progress_obligations',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="En progreso" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-status-warning">
          {row.original.in_progress_obligations}
        </span>
      ),
    },
    {
      accessorKey: 'completion_percentage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progreso" />
      ),
      cell: ({ row }) => {
        const { total_obligations, completion_percentage } = row.original
        if (total_obligations === 0) {
          return <span className="text-xs text-muted-foreground">Sin obligaciones</span>
        }
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={completion_percentage} className="h-1.5 flex-1" />
            <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
              {completion_percentage}%
            </span>
          </div>
        )
      },
    },
    {
      id: 'evaluation_status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Evaluacion" />
      ),
      accessorFn: (row) => {
        if (row.total_obligations === 0) return 'pending'
        if (row.completion_percentage === 100) return 'completed'
        return 'in_progress'
      },
      cell: ({ row }) => {
        const { total_obligations, completion_percentage } = row.original
        if (total_obligations === 0) {
          return (
            <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs border">
              Sin iniciar
            </Badge>
          )
        }
        if (completion_percentage === 100) {
          return (
            <Badge className="bg-status-success-subtle text-status-success border-status-success-border text-xs border">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
            </Badge>
          )
        }
        return (
          <Badge className="bg-status-warning-subtle text-status-warning border-status-warning-border text-xs border">
            <Clock className="w-3 h-3 mr-1" /> En progreso
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        const { total_obligations, completion_percentage } = row.original
        if (value === 'completed')
          return completion_percentage === 100 && total_obligations > 0
        if (value === 'in_progress')
          return completion_percentage > 0 && completion_percentage < 100
        if (value === 'pending') return total_obligations === 0
        return true
      },
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <Link href={`/dashboard/inventory/${row.original.id}`}>
          <Button variant="ghost" size="sm" className="text-xs">
            Ver detalles
          </Button>
        </Link>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AssessmentsPage() {
  const [systems, setSystems] = useState<SystemAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) return

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .single()

      let q = supabase
        .from('use_cases')
        .select('id, name, ai_act_level, status')
        .is('deleted_at', null)

      if (membership?.organization_id) {
        q = q.or(
          `organization_id.eq.${membership.organization_id},user_id.eq.${session.user.id}`
        )
      } else {
        q = q.eq('user_id', session.user.id)
      }

      const { data: useCases } = await q.order('created_at', { ascending: false })
      if (!useCases?.length) {
        setSystems([])
        setLoading(false)
        return
      }

      const enriched: SystemAssessment[] = await Promise.all(
        useCases.map(async (uc) => {
          const { data: obligations } = await supabase
            .from('use_case_obligations')
            .select('status')
            .eq('use_case_id', uc.id)

          const total = obligations?.length ?? 0
          const completed =
            obligations?.filter((o) => o.status === 'completed').length ?? 0
          const in_progress =
            obligations?.filter((o) => o.status === 'in_progress').length ?? 0
          const pct = total > 0 ? Math.round((completed / total) * 100) : 0

          return {
            id: uc.id,
            name: uc.name,
            ai_act_level: uc.ai_act_level || 'unclassified',
            status: uc.status || 'draft',
            total_obligations: total,
            completed_obligations: completed,
            in_progress_obligations: in_progress,
            completion_percentage: pct,
          }
        })
      )

      setSystems(enriched)
    } finally {
      setLoading(false)
    }
  }

  const totalSystems = systems.length
  const fullyCompleted = systems.filter(
    (s) => s.completion_percentage === 100 && s.total_obligations > 0
  ).length
  const inProgress = systems.filter(
    (s) => s.completion_percentage > 0 && s.completion_percentage < 100
  ).length
  const notStarted = systems.filter((s) => s.total_obligations === 0).length

  const columns = buildColumns()

  return (
    <PageShell>
      <PageHeader
        title="Evaluaciones"
        description="Progreso de cumplimiento de obligaciones AI Act por sistema"
        actions={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        }
      />

      {/* Summary Cards */}
      {loading ? (
        <StatCardsSkeleton />
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-[#0B1C3D]" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Total sistemas
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{totalSystems}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">sistemas registrados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Completados
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{fullyCompleted}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">100% obligaciones cumplidas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#0B1C3D]" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              En progreso
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{inProgress}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">parcialmente completados</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Sin iniciar
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{notStarted}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">sin obligaciones asignadas</p>
        </div>
      </div>
      )}

      {/* DataTable */}
      <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
        <DataTable
          columns={columns}
          data={systems}
          loading={loading}
          skeletonRows={6}
          toolbar={{
            searchPlaceholder: 'Buscar sistema...',
            searchKey: 'name',
            filters: [
              {
                key: 'ai_act_level',
                label: 'Nivel AI Act',
                options: [
                  { label: 'Prohibido', value: 'prohibited' },
                  { label: 'Alto Riesgo', value: 'high_risk' },
                  { label: 'Riesgo Limitado', value: 'limited_risk' },
                  { label: 'Riesgo Minimo', value: 'minimal_risk' },
                  { label: 'No Clasificado', value: 'unclassified' },
                ],
              },
              {
                key: 'evaluation_status',
                label: 'Evaluacion',
                options: [
                  { label: 'Completado', value: 'completed' },
                  { label: 'En progreso', value: 'in_progress' },
                  { label: 'Sin iniciar', value: 'pending' },
                ],
              },
            ],
          }}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          emptyState={{
            icon: <AlertCircle className="w-12 h-12 text-gray-300" />,
            title: 'No hay sistemas de IA registrados',
            description:
              'Añade tu primer sistema para comenzar a evaluar las obligaciones.',
            action: (
              <Link href="/dashboard/inventory/new">
                <Button size="sm">Añadir sistema</Button>
              </Link>
            ),
          }}
        />
      </div>
    </PageShell>
  )
}
