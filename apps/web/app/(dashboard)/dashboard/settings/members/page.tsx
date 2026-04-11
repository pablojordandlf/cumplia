'use client'

import { useState, useEffect, useCallback } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InviteDialog } from './invite-dialog'
import { UsageIndicator } from './usage-indicator'
import { Member, MemberRole, PendingInvitation } from '@/types/organization'
import {
  MoreHorizontal,
  Mail,
  UserX,
  Shield,
  Loader2,
  AlertCircle,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthReady } from '@/lib/auth-helpers'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROLE_COLORS: Record<MemberRole, string> = {
  owner: 'bg-purple-100 text-purple-700 border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  editor: 'bg-green-100 text-green-700 border-green-200',
  viewer: 'bg-gray-100 text-gray-700 border-gray-200',
}

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface UnifiedMember {
  id: string
  type: 'member' | 'invitation'
  email: string
  name?: string
  role: MemberRole
  status: string
  createdAt?: string
  created_at?: string
  inviteExpiresAt?: string
  invite_expires_at?: string
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

function buildMemberColumns(
  canManageMembers: boolean,
  currentUserRole: MemberRole | null,
  onRemove: (id: string) => void
): ColumnDef<Member>[] {
  return [
    {
      id: 'member',
      header: 'Miembro',
      accessorFn: (row) => row.name || row.email,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {(row.original.name?.charAt(0) || row.original.email.charAt(0)).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.original.name || row.original.email}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => (
        <Badge className={`${ROLE_COLORS[row.original.role]} border text-xs`}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
      filterFn: (row, _id, value) => row.original.role === value,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Estado" />
      ),
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status === 'active' ? 'Activo' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Fecha alta" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => {
        if (!canManageMembers || row.original.role === 'owner') return null
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUserRole === 'owner' && (
                <DropdownMenuItem
                  onClick={() => toast.info('Funcion de cambio de rol proxima')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Cambiar Rol
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onRemove(row.original.id)}
                className="text-red-600"
              >
                <UserX className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

function buildInviteColumns(
  onResend: (id: string) => void,
  onCancel: (id: string) => void
): ColumnDef<PendingInvitation>[] {
  return [
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rol" />
      ),
      cell: ({ row }) => (
        <Badge className={`${ROLE_COLORS[row.original.role]} border text-xs`}>
          {ROLE_LABELS[row.original.role]}
        </Badge>
      ),
    },
    {
      accessorKey: 'inviteExpiresAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expira" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.inviteExpiresAt
            ? new Date(row.original.inviteExpiresAt).toLocaleDateString('es-ES')
            : 'Sin expiracion'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onResend(row.original.id)}>
              <Mail className="w-4 h-4 mr-2" />
              Reenviar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onCancel(row.original.id)}
              className="text-red-600"
            >
              <UserX className="w-4 h-4 mr-2" />
              Cancelar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function MembersPage() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([])
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<MemberRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  const { isReady: isAuthReady, user } = useAuthReady()

  useEffect(() => {
    if (isAuthReady) {
      fetchData()
    }
  }, [isAuthReady])

  async function fetchData() {
    try {
      setIsLoading(true)
      setError(null)

      if (!user) {
        setIsLoading(false)
        return
      }

      // Step 1: get membership (with retry)
      let memberData = null
      let memberError = null

      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from('organization_members')
          .select('organization_id, role')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single()

        memberData = result.data
        memberError = result.error

        if (!result.error || result.error.code === 'PGRST116') break
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)))
        }
      }

      if (memberError) {
        if (memberError.code === 'PGRST116') {
          setError(
            'No se encontró tu membresía en ninguna organización activa. Contacta con soporte si crees que esto es un error.'
          )
        } else {
          setError(
            'No se pudo acceder a la información de tu organización. Verifica que tienes acceso activo.'
          )
        }
        setIsLoading(false)
        return
      }

      if (!memberData) {
        setError('No se encontró tu membresía en ninguna organización activa.')
        setIsLoading(false)
        return
      }

      // Step 2: verify org exists
      const { error: orgError } = await supabase
        .from('organizations')
        .select('id, plan_name, seats_total, seats_used')
        .eq('id', memberData.organization_id)
        .single()

      if (orgError) {
        setError('No se pudo acceder a la información de tu organización.')
        setIsLoading(false)
        return
      }

      setOrganizationId(memberData.organization_id)
      setCurrentUserRole(memberData.role)

      // Step 3: fetch members and invitations
      const membersRes = await fetch(
        `/api/v1/organizations/${memberData.organization_id}/members`
      )
      if (!membersRes.ok) {
        setError('Error al cargar los miembros del equipo.')
        setIsLoading(false)
        return
      }

      const membersResponse = await membersRes.json()
      const unifiedMembers: UnifiedMember[] = membersResponse.data || []

      const activeMembers: Member[] = unifiedMembers
        .filter((m: UnifiedMember) => m.type === 'member')
        .map((m: UnifiedMember) => ({
          id: m.id,
          organizationId: memberData.organization_id,
          userId: m.id,
          email: m.email,
          name: m.name || m.email.split('@')[0],
          role: m.role,
          status: m.status as 'active' | 'invited' | 'suspended' | 'removed',
          createdAt: m.created_at || m.createdAt || new Date().toISOString(),
          updatedAt: m.created_at || m.createdAt || new Date().toISOString(),
        }))

      const pendingInvitations: PendingInvitation[] = unifiedMembers
        .filter((m: UnifiedMember) => m.type === 'invitation')
        .map((m: UnifiedMember) => ({
          id: m.id,
          organizationId: memberData.organization_id,
          email: m.email,
          name: m.name,
          role: m.role,
          status: 'pending' as const,
          inviteToken: '',
          inviteExpiresAt:
            m.invite_expires_at ||
            m.inviteExpiresAt ||
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          invitedBy: '',
          createdAt: m.created_at || m.createdAt || new Date().toISOString(),
          updatedAt: m.created_at || m.createdAt || new Date().toISOString(),
        }))

      setMembers(activeMembers)
      setPendingInvites(pendingInvitations)
      setIsLoading(false)
    } catch {
      setError('Error inesperado al cargar los datos del equipo.')
      setIsLoading(false)
    }
  }

  const handleResendInvite = useCallback(
    async (inviteId: string) => {
      if (!organizationId) return
      try {
        const response = await fetch(
          `/api/v1/organizations/${organizationId}/members`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resend', invitationId: inviteId }),
          }
        )
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to resend invitation')
        }
        toast.success('Invitación reenviada')
        fetchData()
      } catch {
        toast.error('Error al reenviar la invitación')
      }
    },
    [organizationId]
  )

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!organizationId) return
      if (!confirm('¿Estás seguro de que quieres eliminar a este miembro?')) return
      try {
        const response = await fetch(
          `/api/v1/organizations/${organizationId}/members?userId=${memberId}`,
          { method: 'DELETE' }
        )
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to remove member')
        }
        toast.success('Miembro eliminado')
        fetchData()
      } catch {
        toast.error('Error al eliminar el miembro')
      }
    },
    [organizationId]
  )

  const handleCancelInvite = useCallback(
    async (inviteId: string) => {
      if (!organizationId) return
      if (!confirm('¿Estás seguro de que quieres cancelar esta invitación?')) return
      try {
        const response = await fetch(
          `/api/v1/organizations/${organizationId}/members?invitationId=${inviteId}`,
          { method: 'DELETE' }
        )
        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || 'Failed to cancel invitation')
        }
        toast.success('Invitación cancelada')
        fetchData()
      } catch {
        toast.error('Error al cancelar la invitación')
      }
    },
    [organizationId]
  )

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'

  if (!isAuthReady) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Inicializando sesión...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            setIsRetrying(true)
            fetchData().finally(() => setIsRetrying(false))
          }}
          disabled={isRetrying}
          className="mt-4"
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reintentando...
            </>
          ) : (
            'Reintentar'
          )}
        </Button>
      </div>
    )
  }

  const memberColumns = buildMemberColumns(
    canManageMembers,
    currentUserRole,
    handleRemoveMember
  )
  const inviteColumns = buildInviteColumns(handleResendInvite, handleCancelInvite)

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miembros del Equipo</h1>
          <p className="text-gray-500 mt-1">
            Gestiona quién tiene acceso a tu organización
          </p>
        </div>
        {canManageMembers && (
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Miembro
          </Button>
        )}
      </div>

      {/* Usage Indicator */}
      <UsageIndicator />

      {/* Active Members */}
      <div className="bg-white rounded-xl border border-[#E3DFD5]">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-base font-semibold text-gray-900">Miembros Activos</h2>
        </div>
        <div className="p-4 pt-2">
          <DataTable
            columns={memberColumns}
            data={members}
            loading={isLoading}
            skeletonRows={4}
            toolbar={{
              searchPlaceholder: 'Buscar miembro...',
              searchKey: 'member',
              filters: [
                {
                  key: 'role',
                  label: 'Rol',
                  options: [
                    { label: 'Propietario', value: 'owner' },
                    { label: 'Administrador', value: 'admin' },
                    { label: 'Editor', value: 'editor' },
                    { label: 'Visualizador', value: 'viewer' },
                  ],
                },
              ],
            }}
            pagination={false}
            emptyState={{
              title: 'No hay miembros activos',
              description: 'No hay miembros activos en tu organización.',
            }}
          />
        </div>
      </div>

      {/* Pending Invitations */}
      {(isLoading || pendingInvites.length > 0) && (
        <div className="bg-white rounded-xl border border-[#E3DFD5]">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-base font-semibold text-gray-900">
              Invitaciones Pendientes
            </h2>
          </div>
          <div className="p-4 pt-2">
            <DataTable
              columns={inviteColumns}
              data={pendingInvites}
              loading={isLoading}
              skeletonRows={2}
              pagination={false}
              emptyState={{
                title: 'Sin invitaciones pendientes',
                description: 'No hay invitaciones en espera de aceptación.',
              }}
            />
          </div>
        </div>
      )}

      <InviteDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={fetchData}
        organizationId={organizationId}
        currentUserRole={currentUserRole}
      />
    </div>
  )
}
