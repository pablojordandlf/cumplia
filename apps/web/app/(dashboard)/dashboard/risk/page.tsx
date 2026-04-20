'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import {
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  TrendingUp,
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

interface SystemRiskData {
  id: string
  name: string
  ai_act_level: string
  risk_analysis_completed: boolean
  total_risks: number
  assessed_risks: number
  mitigated_risks: number
  critical_open: number
  completion_percentage: number
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

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

function buildColumns(): ColumnDef<SystemRiskData>[] {
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
      accessorKey: 'total_risks',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Riesgos" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.total_risks}</span>
      ),
    },
    {
      accessorKey: 'assessed_risks',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Evaluados" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.original.assessed_risks}
        </span>
      ),
    },
    {
      accessorKey: 'mitigated_risks',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mitigados" />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-status-success font-medium">
          {row.original.mitigated_risks}
        </span>
      ),
    },
    {
      accessorKey: 'critical_open',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Críticos" />
      ),
      cell: ({ row }) => {
        const val = row.original.critical_open
        if (val === 0) {
          return <span className="text-sm text-muted-foreground tabular-nums">—</span>
        }
        return (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-status-danger shrink-0" />
            <span className="text-sm font-semibold text-status-danger tabular-nums">{val}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'completion_percentage',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Progreso" />
      ),
      cell: ({ row }) => {
        const { total_risks, completion_percentage } = row.original
        if (total_risks === 0) {
          return <span className="text-xs text-muted-foreground">Sin análisis</span>
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
      accessorKey: 'risk_analysis_completed',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => {
        const { risk_analysis_completed, total_risks } = row.original
        if (risk_analysis_completed) {
          return (
            <Badge className="bg-status-success-subtle text-status-success border-status-success-border text-xs border">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
            </Badge>
          )
        }
        if (total_risks > 0) {
          return (
            <Badge className="bg-status-warning-subtle text-status-warning border-status-warning-border text-xs border">
              <Clock className="w-3 h-3 mr-1" /> En progreso
            </Badge>
          )
        }
        return (
          <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs border">
            Pendiente
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        if (value === 'completed') return row.original.risk_analysis_completed
        if (value === 'in_progress')
          return !row.original.risk_analysis_completed && row.original.total_risks > 0
        if (value === 'pending') return row.original.total_risks === 0
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
            Ver análisis
          </Button>
        </Link>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RiskPage() {
  const [systems, setSystems] = useState<SystemRiskData[]>([])
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
        .select('id, name, ai_act_level, risk_analysis_completed')
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

      const enriched: SystemRiskData[] = await Promise.all(
        useCases.map(async (uc) => {
          const { data: risks } = await supabase
            .from('use_case_risks')
            .select('status, probability, impact, applicable')
            .eq('use_case_id', uc.id)

          const applicable = risks?.filter((r) => r.applicable === true) ?? []
          const total = applicable.length
          const assessed =
            applicable.filter((r) =>
              ['assessed', 'mitigated', 'accepted'].includes(r.status)
            ).length
          const mitigated =
            applicable.filter((r) => r.status === 'mitigated').length
          const critical_open =
            applicable.filter(
              (r) =>
                r.probability === 'critical' &&
                !['mitigated', 'accepted'].includes(r.status)
            ).length
          const pct = total > 0 ? Math.round((mitigated / total) * 100) : 0

          return {
            id: uc.id,
            name: uc.name,
            ai_act_level: uc.ai_act_level || 'unclassified',
            risk_analysis_completed: uc.risk_analysis_completed ?? false,
            total_risks: total,
            assessed_risks: assessed,
            mitigated_risks: mitigated,
            critical_open,
            completion_percentage: pct,
          }
        })
      )

      enriched.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.ai_act_level] ?? 99) -
          (PRIORITY_ORDER[b.ai_act_level] ?? 99)
      )
      setSystems(enriched)
    } finally {
      setLoading(false)
    }
  }

  const totalSystems = systems.length
  const completedSystems = systems.filter((s) => s.risk_analysis_completed).length
  const systemsWithRisks = systems.filter((s) => s.total_risks > 0).length
  const criticalTotal = systems.reduce((acc, s) => acc + s.critical_open, 0)

  const columns = buildColumns()

  return (
    <PageShell>
      <PageHeader
        title="Gestión de Riesgos"
        description="Estado del análisis de riesgos AI Act para todos tus sistemas"
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
            <Shield className="w-4 h-4 text-[#0B1C3D]" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Sistemas
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{totalSystems}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">
            {systemsWithRisks} con riesgos registrados
          </p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Completados
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">{completedSystems}</p>
          <p className="text-xs text-[#8B9BB4] mt-1">de {totalSystems} sistemas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E3DFD5] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Progreso
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0B1C3D]">
            {totalSystems > 0
              ? Math.round((completedSystems / totalSystems) * 100)
              : 0}
            %
          </p>
          <p className="text-xs text-[#8B9BB4] mt-1">análisis completado</p>
        </div>
        <div
          className={`bg-white rounded-xl border p-4 ${
            criticalTotal > 0 ? 'border-red-200' : 'border-[#E3DFD5]'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle
              className={`w-4 h-4 ${criticalTotal > 0 ? 'text-red-500' : 'text-[#8B9BB4]'}`}
            />
            <span className="text-xs font-medium text-[#8B9BB4] uppercase tracking-wide">
              Críticos abiertos
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${criticalTotal > 0 ? 'text-status-danger' : 'text-[#0B1C3D]'}`}
          >
            {criticalTotal}
          </p>
          <p className="text-xs text-[#8B9BB4] mt-1">riesgos sin mitigar</p>
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
                  { label: 'Riesgo Mínimo', value: 'minimal_risk' },
                  { label: 'No Clasificado', value: 'unclassified' },
                ],
              },
              {
                key: 'risk_analysis_completed',
                label: 'Estado',
                options: [
                  { label: 'Completado', value: 'completed' },
                  { label: 'En progreso', value: 'in_progress' },
                  { label: 'Pendiente', value: 'pending' },
                ],
              },
            ],
          }}
          pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
          emptyState={{
            icon: <AlertCircle className="w-12 h-12 text-gray-300" />,
            title: 'No hay sistemas de IA registrados',
            description: 'Añade tu primer sistema para comenzar el análisis de riesgos.',
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
