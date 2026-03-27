'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Search,
  FileText,
  AlertTriangle,
  Package,
  Zap,
  ChevronRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'use-case' | 'template' | 'inventory' | 'control';
  url?: string;
}

// Mock data - en production, esto vendría de una API
const MOCK_RESULTS: SearchResult[] = [
  {
    id: '1',
    title: 'Sistema de recomendación personalizada',
    category: 'use-case',
    description: 'Recomendaciones de productos basadas en IA',
  },
  {
    id: '2',
    title: 'Risk Template - High Risk',
    category: 'template',
    description: 'Plantilla para sistemas de alto riesgo',
  },
  {
    id: '3',
    title: 'Camera System Inventory',
    category: 'inventory',
    description: 'Inventario de sistemas de visión por IA',
  },
  {
    id: '4',
    title: 'Documented Governance Process',
    category: 'control',
    description: 'Control de procesos de gobernanza documentados',
  },
];

const CATEGORY_INFO = {
  'use-case': {
    label: 'Caso de uso',
    icon: Zap,
    color: 'text-blue-600',
  },
  'template': {
    label: 'Plantilla de riesgo',
    icon: AlertTriangle,
    color: 'text-orange-600',
  },
  'inventory': {
    label: 'Inventario',
    icon: Package,
    color: 'text-green-600',
  },
  'control': {
    label: 'Control',
    icon: FileText,
    color: 'text-purple-600',
  },
};

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredResults = React.useMemo(() => {
    if (!searchValue) return MOCK_RESULTS;
    
    return MOCK_RESULTS.filter((result) =>
      result.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      (result.description?.toLowerCase().includes(searchValue.toLowerCase()) ?? false)
    );
  }, [searchValue]);

  const handleSelect = (result: SearchResult) => {
    // Navigate based on category
    switch (result.category) {
      case 'use-case':
        window.location.href = `/dashboard/use-cases/${result.id}`;
        break;
      case 'template':
        window.location.href = `/dashboard/admin?tab=risk-templates`;
        break;
      case 'inventory':
        window.location.href = `/dashboard/inventory/${result.id}`;
        break;
      case 'control':
        window.location.href = `/dashboard/controls/${result.id}`;
        break;
    }
    setOpen(false);
  };

  return (
    <>
      {/* Keyboard shortcut indicator - visible in navbar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden md:inline">Buscar...</span>
        <kbd className="hidden sm:inline px-2 py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded">
          ⌘K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <Command className="[&_[cmdk-input]]:h-12">
            <div className="flex items-center border-b px-3 gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Command.Input
                placeholder="Busca en casos de uso, plantillas, inventario, controles..."
                className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>
            
            <Command.List className="max-h-[300px] overflow-y-auto">
              {filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Search className="w-6 h-6 mb-2 opacity-50" />
                  <p>No se encontraron resultados</p>
                  <p className="text-xs mt-1">Intenta otra búsqueda</p>
                </div>
              ) : (
                <>
                  {filteredResults.map((result) => {
                    const categoryInfo = CATEGORY_INFO[result.category];
                    const IconComponent = categoryInfo.icon;
                    
                    return (
                      <Command.Item
                        key={result.id}
                        value={result.id}
                        onSelect={() => handleSelect(result)}
                        className="px-3 py-2.5 flex items-start gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <IconComponent className={`w-4 h-4 mt-0.5 flex-shrink-0 ${categoryInfo.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {result.title}
                          </div>
                          {result.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {result.description}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {categoryInfo.label}
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-50 flex-shrink-0" />
                      </Command.Item>
                    );
                  })}
                </>
              )}
            </Command.List>
          </Command>

          <div className="border-t px-3 py-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs">↑↓</kbd>
              Navegar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs">⏎</kbd>
              Seleccionar
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-xs">Esc</kbd>
              Cerrar
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
