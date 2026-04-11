import { cn } from '@/lib/utils'

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
