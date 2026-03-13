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
  return (
    <div className={cn('flex flex-wrap gap-3 items-center p-4 bg-white rounded-lg shadow-sm', className)}>
      <Input
        type="text"
        placeholder="Buscar casos de uso..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] justify-between">
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
          <Button variant="outline" className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] justify-between">
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
          <Button variant="outline" className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px] justify-between">
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

      <Button
        variant="ghost"
        onClick={onClearFilters}
        className="text-sm text-gray-500 hover:text-gray-700 underline ml-auto"
      >
        Limpiar filtros
      </Button>
    </div>
  );
};

export default FilterBar;
