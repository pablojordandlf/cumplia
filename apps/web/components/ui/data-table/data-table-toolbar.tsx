'use client'

import { Table } from '@tanstack/react-table'
import { X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTableFilterConfig } from './types'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: DataTableFilterConfig[]
  children?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Buscar...',
  searchKey,
  filters = [],
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().globalFilter ||
    table.getState().columnFilters.length > 0

  const handleReset = () => {
    table.resetGlobalFilter()
    table.resetColumnFilters()
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      {searchKey !== undefined && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
            onChange={(e) =>
              table.getColumn(searchKey)?.setFilterValue(e.target.value)
            }
            className="pl-9 h-9"
          />
        </div>
      )}

      {/* Column filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const column = table.getColumn(filter.key)
          if (!column) return null
          const value = column.getFilterValue() as string | undefined

          return (
            <div key={filter.key} className="flex items-center gap-1">
              <Select
                value={value ?? 'all'}
                onValueChange={(val) =>
                  column.setFilterValue(val === 'all' ? undefined : val)
                }
              >
                <SelectTrigger className="h-9 w-auto min-w-[130px] text-xs">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {filter.label}: Todos
                  </SelectItem>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {value && (
                <Badge
                  variant="secondary"
                  className="h-6 px-1.5 text-xs rounded-sm"
                >
                  {filter.options.find((o) => o.value === value)?.label}
                  <button
                    onClick={() => column.setFilterValue(undefined)}
                    className="ml-1 hover:text-foreground"
                    aria-label={`Quitar filtro ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )
        })}

        {/* Clear all filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Right slot for custom actions (e.g. column visibility, add button) */}
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  )
}
