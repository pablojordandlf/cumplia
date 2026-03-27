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
  Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/lib/auth-helpers';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: 'inventory' | 'use-case';
  url?: string;
}

const CATEGORY_INFO = {
  'use-case': {
    label: 'Caso de uso',
    icon: Zap,
    color: 'text-blue-600',
  },
  'inventory': {
    label: 'Sistema de IA',
    icon: Package,
    color: 'text-green-600',
  },
};

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { user, isReady } = useAuthReady();

  // Keyboard shortcut
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

  // Fetch inventory items when dialog opens or search value changes
  React.useEffect(() => {
    if (!open || !isReady || !user) {
      setResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Try to get user's organization first
        const { data: memberData } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        // Build a flexible query: org systems OR personal systems
        let query = supabase
          .from('use_cases')
          .select('id, name, description')
          .is('deleted_at', null);

        // If user is in org, fetch org + personal systems
        // If not, fetch only personal systems
        if (memberData?.organization_id) {
          query = query.or(
            `and(organization_id.eq.${memberData.organization_id}),and(user_id.eq.${user.id})`
          );
        } else {
          query = query.eq('user_id', user.id);
        }

        if (searchValue.trim()) {
          query = query.or(`name.ilike.%${searchValue}%,description.ilike.%${searchValue}%`);
        }

        query = query.limit(10);
        const { data: inventoryData } = await query;

        const formattedResults: SearchResult[] = (inventoryData || []).map((item: any) => ({
          id: item.id,
          title: item.name,
          description: item.description || 'Sistema de IA',
          category: 'inventory',
        }));

        setResults(formattedResults);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [open, searchValue, isReady, user]);

  const handleSelect = (result: SearchResult) => {
    // Navigate to inventory item
    if (result.category === 'inventory') {
      window.location.href = `/dashboard/inventory/${result.id}`;
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Loader2 className="w-6 h-6 mb-2 animate-spin" />
                  <p>Buscando sistemas...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
                  <Search className="w-6 h-6 mb-2 opacity-50" />
                  <p>No se encontraron resultados</p>
                  <p className="text-xs mt-1">Intenta otra búsqueda</p>
                </div>
              ) : (
                <>
                  {results.map((result) => {
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
