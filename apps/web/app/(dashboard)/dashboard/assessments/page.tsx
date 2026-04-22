'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PageShell, PageHeader } from '@/components/ui/page-shell'
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
  total_obligations: number
  completed_obligations: number
  completion_percentage: number
}

// ---------------------------------------------------------------------------
// Config
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
        .select('id, name, ai_act_level')
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

      const useCaseIds = useCases.map((uc) => uc.id)

      // Fetch completed obligations for all systems in one query
      const { data: completedRows } = await supabase
        .from('use_case_obligations')
        .select('use_case_id')
        .in('use_case_id', useCaseIds)
        .eq('is_completed', true)

      const completedBySystem: Record<string, number> = {}
      completedRows?.forEach((row) => {
        completedBySystem[row.use_case_id] = (completedBySystem[row.use_case_id] ?? 0) + 1
      })

      const enriched: SystemAssessment[] = useCases.map((uc) => {
        const level = uc.ai_act_level || 'unclassified'
        const total = OBLIGATIONS_BY_LEVEL[level] ?? 0
        const completed = completedBySystem[uc.id] ?? 0
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0
        return {
          id: uc.id,
          name: uc.name,
          ai_act_level: level,
          total_obligations: total,
          completed_obligations: completed,
          completion_percentage: pct,
        }
      })

      setSystems(enriched)
    } finally {
      setLoading(false)
    }
  }

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
