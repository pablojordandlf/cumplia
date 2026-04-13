import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// ---------------------------------------------------------------------------
// PageShell
// Standardised outer wrapper for dashboard pages.
// Default: p-6, max-w-6xl, centered, vertical spacing of 6.
// ---------------------------------------------------------------------------

interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('p-6 max-w-6xl mx-auto space-y-6', className)}>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PageHeader
// Standardised page header: title + optional description + optional actions.
// ---------------------------------------------------------------------------

interface PageHeaderProps {
  title: string
  description?: string
  /** Content rendered on the right (e.g. action buttons) */
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold text-[#0B1C3D]">{title}</h1>
        {description && (
          <p className="text-sm text-[#8B9BB4] mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// PageHeaderSkeleton
// Skeleton placeholder for PageHeader while page data is loading.
// ---------------------------------------------------------------------------

export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// StatCardsSkeleton
// Skeleton for a row of N summary stat cards (default 4).
// ---------------------------------------------------------------------------

interface StatCardsSkeletonProps {
  count?: number
  className?: string
}

export function StatCardsSkeleton({ count = 4, className }: StatCardsSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-[#E3DFD5] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// FormSkeleton
// Skeleton for a form page (e.g. edit page).
// ---------------------------------------------------------------------------

interface FormSkeletonProps {
  fields?: number
  className?: string
}

export function FormSkeleton({ fields = 6, className }: FormSkeletonProps) {
  return (
    <PageShell className={cn('max-w-3xl', className)}>
      <PageHeaderSkeleton />
      <div className="bg-white rounded-xl border border-[#E3DFD5] p-6 space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
    </PageShell>
  )
}
