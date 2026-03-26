'use client';

import { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ResponsiveTableProps {
  columns: Array<{
    header: string;
    accessor: string;
    width?: string;
    render?: (value: any, row: any) => ReactNode;
  }>;
  data: Array<Record<string, any>>;
  expandable?: boolean;
  renderExpandedContent?: (row: any) => ReactNode;
}

/**
 * Tabla responsive que se adapta a móvil
 * - Desktop: tabla estándar con scroll horizontal
 * - Mobile: cards apiladas con posibilidad de expandir
 */
export function ResponsiveTable({
  columns,
  data,
  expandable = false,
  renderExpandedContent,
}: ResponsiveTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b">
              <tr>
                {expandable && <th className="w-10 px-4 py-3"></th>}
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className={`px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider ${
                      col.width || 'flex-1'
                    }`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row, idx) => {
                const rowId = `${idx}`;
                return (
                  <tr
                    key={rowId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {expandable && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(rowId)}
                          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          aria-label="Expandir fila"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedRows.has(rowId) ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.accessor} className="px-4 py-3 text-sm">
                        {col.render
                          ? col.render(row[col.accessor], row)
                          : row[col.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => {
          const rowId = `${idx}`;
          return (
            <div
              key={rowId}
              className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900"
            >
              {/* Card Header - Expandable */}
              <button
                onClick={() => toggleRow(rowId)}
                className="w-full flex items-start justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  {columns.slice(0, 2).map((col) => (
                    <div key={col.accessor} className="mb-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase">
                        {col.header}
                      </div>
                      <div className="text-sm font-medium truncate">
                        {col.render
                          ? col.render(row[col.accessor], row)
                          : row[col.accessor]}
                      </div>
                    </div>
                  ))}
                </div>
                {expandable && (
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-2 transition-transform ${
                      expandedRows.has(rowId) ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>

              {/* Expanded Content */}
              {expandable && expandedRows.has(rowId) && (
                <div className="px-4 py-3 border-t bg-slate-50 dark:bg-slate-800/50">
                  {renderExpandedContent ? (
                    renderExpandedContent(row)
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {columns.slice(2).map((col) => (
                        <div key={col.accessor}>
                          <div className="text-xs font-semibold text-muted-foreground uppercase">
                            {col.header}
                          </div>
                          <div className="text-sm">
                            {col.render
                              ? col.render(row[col.accessor], row)
                              : row[col.accessor]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
