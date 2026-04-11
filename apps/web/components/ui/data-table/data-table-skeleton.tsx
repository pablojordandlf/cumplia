import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableSkeletonProps {
  columnCount: number
  rowCount?: number
  hasToolbar?: boolean
  hasPagination?: boolean
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 8,
  hasToolbar = true,
  hasPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Toolbar skeleton */}
      {hasToolbar && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-[240px]" />
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="h-9 w-[130px]" />
        </div>
      )}

      {/* Table skeleton */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-[80px]" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIdx) => (
              <TableRow key={rowIdx} className="hover:bg-transparent">
                {Array.from({ length: columnCount }).map((_, colIdx) => (
                  <TableCell key={colIdx}>
                    <Skeleton
                      className="h-4"
                      style={{
                        width: `${Math.floor(Math.random() * 40) + 60}%`,
                        opacity: 1 - rowIdx * 0.04,
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      {hasPagination && (
        <div className="flex items-center justify-between px-2 py-1">
          <Skeleton className="h-4 w-[160px]" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[110px]" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-[80px]" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  )
}
