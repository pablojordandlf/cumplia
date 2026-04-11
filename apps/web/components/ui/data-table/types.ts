import { ReactNode } from 'react'

export interface DataTableFilterOption {
  label: string
  value: string
  icon?: ReactNode
}

export interface DataTableFilterConfig {
  key: string
  label: string
  options: DataTableFilterOption[]
}

export interface DataTableToolbarConfig {
  searchPlaceholder?: string
  searchKey?: string
  filters?: DataTableFilterConfig[]
}

export interface DataTablePaginationConfig {
  pageSize?: number
  pageSizeOptions?: number[]
}

export interface DataTableEmptyState {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}
