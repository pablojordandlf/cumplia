import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, X } from 'lucide-react';

// Define the available risk levels
type RiskLevel = 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';

// Define the available status values
type UseCaseStatus = 'draft' | 'active' | 'archived';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  riskLevelFilter: string | null;
  onRiskLevelChange: (level: string | null) => void;
  sectorFilter: string | null;
  onSectorChange: (sector: string | null) => void;
  statusFilter: string | null;
  onStatusChange: (status: string | null) => void;
  onClearFilters: () => void;
  className?: string;
}

const riskLevels: Array<{ value: RiskLevel | null; label: string }> = [
  { value: null, label: 'Todos los niveles' },
  { value: 'prohibited', label: 'Prohibido' },
  { value: 'high', label: 'Alto Riesgo' },
  { value: 'limited', label: 'Riesgo Limitado' },
  { value: 'minimal', label: 'Riesgo Mínimo' },
  { value: 'unclassified', label: 'Sin Clasificar' },
];

const sectors: Array<{ value: string | null; label: string }> = [
  { value: null, label: 'Todos los sectores' },
  { value: 'health', label: 'Salud' },
  { value: 'education', label: 'Educación' },
  { value: 'public_safety', label: 'Seguridad Pública' },
  { value: 'employment', label: 'Empleo' },
  { value: 'transport', label: 'Transporte' },
  { value: 'finance', label: 'Finanzas' },
  { value: 'justice', label: 'Justicia' },
  { value: 'other', label: 'Otros' },
];

const statuses: Array<{ value: UseCaseStatus | null; label: string }> = [
  { value: null, label: 'Todos los estados' },
  { value: 'draft', label: 'Borrador' },
  { value: 'active', label: 'Activo' },
  { value: 'archived', label: 'Archivado' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  riskLevelFilter,
  onRiskLevelChange,
  sectorFilter,
  onSectorChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  className,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasActiveFilters = riskLevelFilter || sectorFilter || statusFilter || searchQuery;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Mobile Filter Toggle */}
      <div className="flex gap-2 sm:hidden">
        <Button
          variant="outline"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className={cn(
            "flex-1 min-h-[44px]",
            mobileFiltersOpen && "bg-[#E8ECEB]"
          )}
        >
          {mobileFiltersOpen ? (
            <><X className="h-5 w-5 mr-2" /> Cerrar Filtros</>
          ) : (
            <><SlidersHorizontal className="h-5 w-5 mr-2" /> Filtros</>
          )}
        </Button>
      </div>

      {/* Mobile Filters Panel */}
      {mobileFiltersOpen && (
        <div className="sm:hidden bg-white rounded-lg border border-[#E8ECEB] p-3 space-y-3">
          <div className="grid grid-cols-1 gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between min-h-[44px] text-sm"
                >
                  {riskLevels.find(rl => rl.value === riskLevelFilter)?.label || 'Nivel de Riesgo'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-3rem)]">
                {riskLevels.map((level) => (
                  <DropdownMenuItem key={level.value ?? 'null'} onSelect={() => onRiskLevelChange(level.value)}>
                    {level.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between min-h-[44px] text-sm"
                >
                  {sectors.find(s => s.value === sectorFilter)?.label || 'Sector'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-3rem)]">
                {sectors.map((sector) => (
                  <DropdownMenuItem key={sector.value ?? 'null'} onSelect={() => onSectorChange(sector.value)}>
                    {sector.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between min-h-[44px] text-sm"
                >
                  {statuses.find(s => s.value === statusFilter)?.label || 'Estado'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100vw-3rem)]">
                {statuses.map((status) => (
                  <DropdownMenuItem key={status.value ?? 'null'} onSelect={() => onStatusChange(status.value)}>
                    {status.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                onClearFilters();
                setMobileFiltersOpen(false);
              }}
              className="w-full text-sm text-[#7a8a92] hover:text-[#E09E50]"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Desktop Filter Bar */}
      <div className="hidden sm:flex flex-wrap gap-3 items-center p-4 bg-white rounded-lg shadow-sm border border-[#E8ECEB]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-3 py-2 border border-[#E8ECEB] rounded-md text-sm min-w-[120px] justify-between">
              {riskLevels.find(rl => rl.value === riskLevelFilter)?.label || 'Nivel de Riesgo'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {riskLevels.map((level) => (
              <DropdownMenuItem key={level.value ?? 'null'} onSelect={() => onRiskLevelChange(level.value)}>
                {level.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-3 py-2 border border-[#E8ECEB] rounded-md text-sm min-w-[120px] justify-between">
              {sectors.find(s => s.value === sectorFilter)?.label || 'Sector'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sectors.map((sector) => (
              <DropdownMenuItem key={sector.value ?? 'null'} onSelect={() => onSectorChange(sector.value)}>
                {sector.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-3 py-2 border border-[#E8ECEB] rounded-md text-sm min-w-[120px] justify-between">
              {statuses.find(s => s.value === statusFilter)?.label || 'Estado'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {statuses.map((status) => (
              <DropdownMenuItem key={status.value ?? 'null'} onSelect={() => onStatusChange(status.value)}>
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-sm text-[#7a8a92] hover:text-[#E09E50] underline ml-auto"
          >
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;