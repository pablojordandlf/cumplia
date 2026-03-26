# 🔍 Plan: Implementar Cmd+K Search - Quick Win #1

## 🎯 Objetivo
Crear una command palette estilo Linear/Figma que:
- Permita buscar sistemas de IA por nombre, descripción, nivel de riesgo
- Acciones rápidas: "Create system", "View template", "Export report"
- Fuzzy matching (tolerante a typos)
- Keyboard-first (Cmd+K / Ctrl+K, arrow keys, Enter)
- ~2h de trabajo total

---

## 📦 Dependencias

```bash
npm install cmdk   # Vercel's command palette library
```

**Por qué `cmdk`**:
- Built by Vercel team
- 6.5KB gzipped
- A11y built-in
- Works with any framework
- Example: https://cmdk.paco.me

---

## 🏗️ Estructura

```
apps/web/
├── components/
│   └── command-palette.tsx        ← NEW (200 líneas)
├── app/
│   ├── layout.tsx                  ← UPDATE (add provider)
│   └── globals.css                 ← UPDATE (add cmdk styles)
└── hooks/
    └── use-command-palette.ts      ← NEW (hook lógica)
```

---

## 📋 Fase 1: Component Setup

### 1.1 Crear `command-palette.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Eye, Download, Search, AlertCircle } from 'lucide-react';

interface CommandPaletteProps {
  systems: any[];
  templates: any[];
  onSelectSystem: (id: string) => void;
  onCreateSystem: () => void;
}

export function CommandPalette({
  systems,
  templates,
  onSelectSystem,
  onCreateSystem,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  // Cmd+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command shouldFilter value={value} onValueChange={setValue}>
          <Command.Input
            placeholder="Search systems, templates, actions... (type '?' for help)"
            className="border-0 bg-transparent px-4 py-3 text-lg outline-none"
          />
          <Command.List className="max-h-[300px] overflow-y-auto px-2 py-2">
            {/* Quick Actions */}
            <Command.Group heading="Quick Actions">
              <Command.Item
                value="create-system"
                onSelect={() => {
                  onCreateSystem();
                  setOpen(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create new AI system
              </Command.Item>

              <Command.Item value="export-report">
                <Download className="mr-2 h-4 w-4" />
                Export compliance report
              </Command.Item>
            </Command.Group>

            {/* Systems Results */}
            {systems.length > 0 && (
              <Command.Group heading="Systems">
                {systems
                  .filter(s => 
                    s.name.toLowerCase().includes(value.toLowerCase()) ||
                    (s.description?.toLowerCase().includes(value.toLowerCase()))
                  )
                  .slice(0, 5)
                  .map(system => (
                    <Command.Item
                      key={system.id}
                      value={`system-${system.id}`}
                      onSelect={() => {
                        onSelectSystem(system.id);
                        setOpen(false);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{system.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {system.description}
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {system.ai_act_level}
                      </span>
                    </Command.Item>
                  ))}
              </Command.Group>
            )}

            {/* Help */}
            {value === '?' && (
              <Command.Group heading="Help">
                <Command.Item disabled>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  <div>
                    <div className="text-sm">Keyboard shortcuts:</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <div>Cmd+K - Open/close search</div>
                      <div>↑↓ - Navigate results</div>
                      <div>Enter - Select</div>
                      <div>Esc - Close</div>
                    </div>
                  </div>
                </Command.Item>
              </Command.Group>
            )}

            {!value && (
              <Command.Group heading="Type '?' for help" />
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

### 1.2 Actualizar `layout.tsx`

```tsx
import { CommandPalette } from '@/components/command-palette';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Existing layout */}
        {children}
        
        {/* Add CommandPalette */}
        <CommandPaletteWrapper />
      </body>
    </html>
  );
}

// Wrapper para acceder a los datos
function CommandPaletteWrapper() {
  const systems = useSystems(); // Fetch from API
  const templates = useTemplates();

  return (
    <CommandPalette
      systems={systems}
      templates={templates}
      onSelectSystem={(id) => navigateTo(`/dashboard/inventory/${id}`)}
      onCreateSystem={() => navigateTo('/dashboard/inventory/new')}
    />
  );
}
```

### 1.3 Estilos en `globals.css`

```css
/* Cmd+K Dialog styles */
[cmdk-root] {
  --cmdk-result-padding: 8px;
  --cmdk-result-height: 40px;
}

[cmdk-root] input {
  font-size: 16px;
}

[cmdk-group-heading] {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #999;
  letter-spacing: 0.05em;
  padding: 4px 8px;
}

[cmdk-item] {
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
}

[cmdk-item][aria-selected="true"] {
  background: #f3f4f6;
}
```

---

## 📊 Fase 2: Search Logic

### 2.1 Hook `use-command-palette.ts`

```tsx
export function useCommandSearch(systems: any[], templates: any[]) {
  const [results, setResults] = useState<any[]>([]);

  const search = useCallback((query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    // Fuzzy matching
    const fuzzyMatch = (str: string, pattern: string) => {
      return pattern.split('').every(char => 
        (str = str.slice(str.indexOf(char) + 1)) !== ''
      );
    };

    const systemResults = systems
      .filter(s => fuzzyMatch(s.name.toLowerCase(), query.toLowerCase()))
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.name.toLowerCase().startsWith(query.toLowerCase())) return -1;
        return 0;
      });

    setResults(systemResults.slice(0, 8));
  }, [systems]);

  return { results, search };
}
```

---

## ⚡ Fase 3: Integración

### 3.1 En dashboard layout

```tsx
// apps/web/app/(dashboard)/layout.tsx
import { CommandPalette } from '@/components/command-palette';

export default function DashboardLayout({ children }) {
  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
```

### 3.2 Data fetching

```tsx
// En CommandPalette o wrapper
const { data: systems } = useSystems(); // Already have this hook
const { data: templates } = useTemplates(); // Already have this hook
```

---

## 🎨 UI Polish

### Dark mode support
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="... dark:bg-gray-900 dark:text-white">
    {/* Automáticamente supported con Tailwind */}
  </DialogContent>
</Dialog>
```

### Keyboard accessibility
- ✅ Arrow keys for navigation
- ✅ Enter to select
- ✅ Esc to close
- ✅ Type to filter (built in cmdk)
- ✅ Screen reader support (cmdk has aria labels)

---

## 📈 Metrics to Track

After launching:
1. **Adoption**: % de users using Cmd+K weekly
2. **Time to first action**: Avg seconds to execute action via search
3. **Search queries**: Most common searches (helps prioritize more features)
4. **Satisfaction**: NPS on search experience

---

## 🧪 Testing Checklist

- [ ] Cmd+K opens/closes
- [ ] Type to filter works (fuzzy matching)
- [ ] Arrow keys navigate results
- [ ] Enter selects item
- [ ] Esc closes
- [ ] Works on mobile (maybe disable on <600px)
- [ ] Dark mode looks good
- [ ] Keyboard traps don't exist
- [ ] Screen readers can use it

---

## 📅 Estimated Effort

| Task | Time |
|------|------|
| Install `cmdk` | 2 min |
| Create component | 45 min |
| Hook logic | 15 min |
| Integration | 20 min |
| Testing + polish | 30 min |
| **Total** | **~1.5h** |

**Can be done in one session!**

---

## 🚀 Alternative: Simpler Version (30 min)

If pressed for time, implement minimal version:
- Only search systems (no templates)
- Simple substring matching (not fuzzy)
- 3 quick actions (Create, Export, Settings)
- Same Cmd+K hotkey

This would still give massive UX boost.

---

## 📚 References

- cmdk docs: https://cmdk.paco.me
- Linear's implementation (inspiration)
- Figma's implementation (inspiration)

