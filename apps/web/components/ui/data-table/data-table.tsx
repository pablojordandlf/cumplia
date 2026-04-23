'use client'

import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from './data-table-toolbar'
import { DataTablePagination } from './data-table-pagination'
import { DataTableSkeleton } from './data-table-skeleton'
import {
  DataTableEmptyState,
  DataTableFilterConfig,
  DataTablePaginationConfig,
  DataTableToolbarConfig,
} from './types'

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  loading?: boolean
  skeletonRows?: number
  toolbar?: DataTableToolbarConfig
  pagination?: DataTablePaginationConfig | false
  emptyState?: DataTableEmptyState
  onRowClick?: (row: Row<TData>) => void
  className?: string
  /**
   * Slot rendered inside the toolbar on the right side.
   * Use this for action buttons (e.g. "Add new").
   */
  toolbarEnd?: React.ReactNode
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  skeletonRows = 8,
  toolbar,
  pagination = {},
  emptyState,
  onRowClick,
  className,
  toolbarEnd,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const pageSize = (pagination !== false && pagination?.pageSize) || 10
  const pageSizeOptions =
    (pagination !== false && pagination?.pageSizeOptions) || [10, 20, 50]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination !== false ? getPaginationRowModel() : undefined,
    initialState: {
      pagination: { pageSize },
    },
  })

  // Show skeleton while loading
  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={skeletonRows}
        hasToolbar={!!toolbar}
        hasPagination={pagination !== false}
      />
    )
  }

  const rows = table.getRowModel().rows

  return (
    <div className={cn('space-y-3', className)}>
      {/* Toolbar */}
      {(toolbar || toolbarEnd) && (
        <DataTableToolbar
          table={table}
          searchPlaceholder={toolbar?.searchPlaceholder}
          searchKey={toolbar?.searchKey}
          filters={toolbar?.filters as DataTableFilterConfig[]}
        >
          {toolbarEnd}
        </DataTableToolbar>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'border-b border-border/50 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-muted/50'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-48 text-center"
                >
                  {emptyState ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-6">
                      {emptyState.icon && (
                        <div className="text-muted-foreground">
                          {emptyState.icon}
                        </div>
                      )}
                      <div>
                        <p className="text-base font-medium text-foreground">
                          {emptyState.title}
                        </p>
                        {emptyState.description && (
                          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                            {emptyState.description}
                          </p>
                        )}
                      </div>
                      {emptyState.action && (
                        <div className="mt-1">{emptyState.action}</div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No hay resultados
                    </p>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination !== false && (
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      )}
    </div>
  )
}
