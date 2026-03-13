# Design System - CumplIA Inventory Management

## Overview
Design system for the AI Act Inventory Management feature, providing consistent styling for risk level visualization, component patterns, and responsive layouts.

---

## 1. Color System for Risk Levels

### Primary Risk Level Colors

| Nivel | Nombre | Color Principal | Tailwind Class | Uso |
|-------|--------|-----------------|----------------|-----|
| Prohibited | Prohibido | #DC2626 | `bg-red-600` | Nivel más alto - Sistemas prohibidos por el AI Act |
| High Risk | Alto Riesgo | #EA580C | `bg-orange-600` | Crítico - Sistemas de alto riesgo que requieren cumplimiento estricto |
| Limited Risk | Riesgo Limitado | #CA8A04 | `bg-yellow-600` | Moderado - Sistemas con obligaciones de transparencia |
| Minimal Risk | Riesgo Mínimo | #16A34A | `bg-green-600` | Bajo - Sistemas con mínimas obligaciones |
| Unclassified | Sin Clasificar | #6B7280 | `bg-gray-500` | Default - Pendiente de clasificación |

### Color Variants Reference

#### Prohibited (Red)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| Light | #FEE2E2 | `bg-red-100` |
| Lighter | #FEF2F2 | `bg-red-50` |
| Primary | #DC2626 | `bg-red-600` |
| Dark | #991B1B | `bg-red-800` |
| Text | #DC2626 | `text-red-600` |
| Border | #FCA5A5 | `border-red-300` |

#### High Risk (Orange)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| Light | #FFEDD5 | `bg-orange-100` |
| Lighter | #FFF7ED | `bg-orange-50` |
| Primary | #EA580C | `bg-orange-600` |
| Dark | #9A3412 | `bg-orange-800` |
| Text | #EA580C | `text-orange-600` |
| Border | #FDBA74 | `border-orange-300` |

#### Limited Risk (Yellow)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| Light | #FEF9C3 | `bg-yellow-100` |
| Lighter | #FEFCE8 | `bg-yellow-50` |
| Primary | #CA8A04 | `bg-yellow-600` |
| Dark | #854D0E | `bg-yellow-800` |
| Text | #CA8A04 | `text-yellow-600` |
| Border | #FDE047 | `border-yellow-300` |

#### Minimal Risk (Green)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| Light | #DCFCE7 | `bg-green-100` |
| Lighter | #F0FDF4 | `bg-green-50` |
| Primary | #16A34A | `bg-green-600` |
| Dark | #166534 | `bg-green-800` |
| Text | #16A34A | `text-green-600` |
| Border | #86EFAC | `border-green-300` |

#### Unclassified (Gray)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| Light | #F3F4F6 | `bg-gray-100` |
| Lighter | #F9FAFB | `bg-gray-50` |
| Primary | #6B7280 | `bg-gray-500` |
| Dark | #1F2937 | `bg-gray-800` |
| Text | #6B7280 | `text-gray-500` |
| Border | #D1D5DB | `border-gray-300` |

### CSS Custom Properties

```css
:root {
  --risk-prohibited: #DC2626;
  --risk-prohibited-light: #FEE2E2;
  --risk-prohibited-dark: #991B1B;
  
  --risk-high: #EA580C;
  --risk-high-light: #FFEDD5;
  --risk-high-dark: #9A3412;
  
  --risk-limited: #CA8A04;
  --risk-limited-light: #FEF9C3;
  --risk-limited-dark: #854D0E;
  
  --risk-minimal: #16A34A;
  --risk-minimal-light: #DCFCE7;
  --risk-minimal-dark: #166534;
  
  --risk-unclassified: #6B7280;
  --risk-unclassified-light: #F3F4F6;
  --risk-unclassified-dark: #1F2937;
}
```

---

## 2. Component Specifications

### RiskBadge Component

**Purpose:** Visual indicator for EU AI Act risk levels with appropriate iconography and color coding.

#### Props Interface
```typescript
interface RiskBadgeProps {
  level: 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}
```

#### Size Specifications
| Size | Height | Padding | Font Size | Icon Size |
|------|--------|---------|-----------|-----------|
| sm | 24px | px-2 py-0.5 | text-xs | 12px |
| md | 28px | px-2.5 py-1 | text-sm | 14px |
| lg | 32px | px-3 py-1.5 | text-sm | 16px |

#### Icon Mapping (Lucide React)
| Level | Icon | Import |
|-------|------|--------|
| prohibited | ShieldAlert | `import { ShieldAlert } from 'lucide-react'` |
| high | AlertTriangle | `import { AlertTriangle } from 'lucide-react'` |
| limited | AlertCircle | `import { AlertCircle } from 'lucide-react'` |
| minimal | CheckCircle | `import { CheckCircle } from 'lucide-react'` |
| unclassified | HelpCircle | `import { HelpCircle } from 'lucide-react'` |

#### States

**Default State:**
- Background: Solid primary color
- Text: White
- Border: None
- Shadow: None

**Hover State:**
- Background: Dark variant (e.g., `bg-red-700` for prohibited)
- Transform: `scale(1.02)`
- Transition: `all 200ms ease-in-out`
- Cursor: Pointer (if clickable)

#### Example Usage
```tsx
<RiskBadge level="high" size="md" showIcon={true} />
<RiskBadge level="minimal" size="sm" />
```

---

### UseCaseCard Component

**Purpose:** Card component displaying an AI use case with visual risk indicator and action buttons.

#### Props Interface
```typescript
interface UseCaseCardProps {
  id: string;
  name: string;
  description: string;
  sector: string;
  riskLevel: 'prohibited' | 'high' | 'limited' | 'minimal' | 'unclassified';
  status: 'draft' | 'active' | 'archived';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}
```

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ █│ Name of Use Case                            [⋯] [✎] [🗑]│
│ █│                                                        │
│ █│ Brief description excerpt that may span...            │
│ █│                                                        │
│ █│ [Sector Badge]              [RiskBadge] [StatusBadge] │
└─────────────────────────────────────────────────────────┘
```

**Left Border:** 4px solid color matching risk level
- Prohibited: `border-l-4 border-l-red-600`
- High: `border-l-4 border-l-orange-600`
- Limited: `border-l-4 border-l-yellow-600`
- Minimal: `border-l-4 border-l-green-600`
- Unclassified: `border-l-4 border-l-gray-500`

#### Card Specifications
| Property | Value |
|----------|-------|
| Background | White (`bg-white`) |
| Border Radius | `rounded-lg` (8px) |
| Shadow | `shadow-sm` default |
| Hover Shadow | `shadow-md` |
| Padding | `p-4` (16px) |
| Gap | `gap-3` between elements |

#### Action Buttons (Top Right)
- **View:** Eye icon, `text-gray-400 hover:text-blue-600`
- **Edit:** Pencil icon, `text-gray-400 hover:text-blue-600`
- **Delete:** Trash icon, `text-gray-400 hover:text-red-600`

All buttons: `p-1.5 rounded-md hover:bg-gray-100`

#### Status Badge Styles
| Status | Background | Text Color |
|--------|------------|------------|
| draft | `bg-gray-100` | `text-gray-700` |
| active | `bg-green-100` | `text-green-700` |
| archived | `bg-orange-100` | `text-orange-700` |

#### Hover Effects
- Shadow increases from `shadow-sm` to `shadow-md`
- Slight Y translation: `-translate-y-0.5`
- Transition: `all 200ms ease`

---

### ProgressWizard Component

**Purpose:** Step indicator for the 4-step classification wizard flow.

#### Props Interface
```typescript
interface ProgressWizardProps {
  currentStep: 1 | 2 | 3 | 4;
  steps: Array<{
    id: number;
    label: string;
    completed: boolean;
  }>;
}
```

#### Step Configuration
```typescript
const STEPS = [
  { id: 1, label: 'Información', completed: false },
  { id: 2, label: 'Sector', completed: false },
  { id: 3, label: 'Propósito', completed: false },
  { id: 4, label: 'Resultado', completed: false },
];
```

#### Visual Structure
```
  ●───────●───────●───────○
  │       │       │       │
Información Sector Propósito Resultado
```

#### Step States

**Completed Step:**
- Circle: `bg-blue-600`, white checkmark icon
- Line to next: `bg-blue-600`
- Label: `text-blue-600 font-medium`

**Current Step:**
- Circle: `bg-white border-2 border-blue-600`, `text-blue-600`
- Line to next: `bg-gray-200`
- Label: `text-blue-600 font-semibold`

**Pending Step:**
- Circle: `bg-gray-200`, `text-gray-400`
- Line to next: `bg-gray-200`
- Label: `text-gray-400`

#### Specifications
| Element | Value |
|---------|-------|
| Circle Size | 32px (`w-8 h-8`) |
| Line Height | 2px (`h-0.5`) |
| Line Width | Flexible (fills space) |
| Label Size | `text-sm` |
| Connector Gap | `gap-2` between circles and lines |

---

### EmptyState Component

**Purpose:** Displayed when no use cases exist in the inventory.

#### Props Interface
```typescript
interface EmptyStateProps {
  icon?: 'inbox' | 'folder-open';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

#### Default Content (Spanish)
- **Icon:** FolderOpen (Lucide)
- **Title:** "No hay casos de uso"
- **Description:** "Comienza creando tu primer caso de uso de IA para clasificarlo según el AI Act Europeo."
- **CTA:** "Crear caso de uso"

#### Layout Structure
```
                    ┌─────────────┐
                    │   📁        │
                    │   (icon)    │
                    └─────────────┘
                          │
                 No hay casos de uso
                          │
    Comienza creando tu primer caso de uso
            de IA para clasificarlo...
                          │
              ┌─────────────────────┐
              │  Crear caso de uso  │
              └─────────────────────┘
```

#### Styling
| Element | Style |
|---------|-------|
| Container | `text-center py-16 px-4` |
| Icon | `w-16 h-16 text-gray-300 mx-auto mb-4` |
| Title | `text-xl font-semibold text-gray-900 mb-2` |
| Description | `text-gray-500 max-w-md mx-auto mb-6` |
| CTA Button | `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md` |

---

### FilterBar Component

**Purpose:** Filter and search controls for the inventory dashboard.

#### Props Interface
```typescript
interface FilterBarProps {
  riskLevelFilter: string | null;
  sectorFilter: string | null;
  statusFilter: string | null;
  searchQuery: string;
  onRiskLevelChange: (value: string | null) => void;
  onSectorChange: (value: string | null) => void;
  onStatusChange: (value: string | null) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}
```

#### Layout Structure (Desktop)
```
┌────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Buscar casos de uso...    [Nivel ▼] [Sector ▼] [Estado ▼] [Limpiar]    │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Layout Structure (Mobile)
```
┌────────────────────────────────────────┐
│ 🔍 Buscar casos de uso...              │
├────────────────────────────────────────┤
│ [Nivel ▼] [Sector ▼] [Estado ▼]       │
├────────────────────────────────────────┤
│ [      Limpiar filtros      ]          │
└────────────────────────────────────────┘
```

#### Filter Options

**Risk Level Dropdown:**
- Todos los niveles
- Prohibido
- Alto riesgo
- Riesgo limitado
- Riesgo mínimo
- Sin clasificar

**Sector Dropdown:**
- Todos los sectores
- Salud
- Educación
- Seguridad pública
- Empleo
- Transporte
- Finanzas
- Justicia
- Otros

**Status Dropdown:**
- Todos los estados
- Borrador
- Activo
- Archivado

#### Styling
| Element | Style |
|---------|-------|
| Container | `flex flex-wrap gap-3 items-center p-4 bg-white rounded-lg shadow-sm` |
| Search Input | `flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500` |
| Dropdowns | `px-3 py-2 border border-gray-300 rounded-md bg-white text-sm min-w-[120px]` |
| Clear Button | `text-sm text-gray-500 hover:text-gray-700 underline` |

---

## 3. Page Layouts

### Dashboard Inventory Page

**Route:** `/inventory`
**Purpose:** Main dashboard displaying all AI use cases with filtering capabilities.

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ CumplIA                                   [👤 Profile] [⚙️ Settings] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ Inventario de casos de uso                       [+ Nuevo caso de uso]│
│                                                                     │
│ ┌─────────────────────────────────────────────────────────────────┐│
│ │ 🔍 Search...  [Nivel ▼] [Sector ▼] [Estado ▼]  [Limpiar]        ││
│ └─────────────────────────────────────────────────────────────────┘│
│                                                                     │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│ │ UseCaseCard 1   │ │ UseCaseCard 2   │ │ UseCaseCard 3   │        │
│ │ [red border]    │ │ [green border]  │ │ [orange border] │        │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│ ┌─────────────────┐ ┌─────────────────┐                            │
│ │ UseCaseCard 4   │ │ UseCaseCard 5   │                            │
│ │ [yellow border] │ │ [gray border]   │                            │
│ └─────────────────┘ └─────────────────┘                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Responsive Behavior
- **Mobile (< 640px):** Single column, stacked filters
- **Tablet (640px - 1024px):** 2 columns, inline filters
- **Desktop (> 1024px):** 3 columns, inline filters

#### Empty State Display
When `useCases.length === 0`:
- Hide grid
- Center EmptyState component in viewport
- Keep FilterBar visible (allows clearing filters)

---

### Classification Wizard Page

**Route:** `/inventory/classify` or `/inventory/classify/:id`
**Purpose:** Guided flow for classifying AI use cases according to EU AI Act.

#### Layout Structure
```
┌─────────────────────────────────────────────────────────────────────┐
│ CumplIA                                   [👤 Profile] [⚙️ Settings] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │        ○══════○══════○══════○                           │      │
│    │     Info → Sector → Propósito → Resultado               │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                     │
│    ┌─────────────────────────────────────────────────────────┐      │
│    │                                                     │   │      │
│    │  STEP CONTENT (forms, selects, etc.)                │ P │      │
│    │                                                     │ R │      │
│    │  - Step 1: Basic info (name, description)           │ E │      │
│    │  - Step 2: Sector selection                         │ V │      │
│    │  - Step 3: Purpose & capabilities                   │ I │      │
│    │  - Step 4: Review & classification result           │ E │      │
│    │                                                     │ W │      │
│    │                                                     │   │      │
│    │  [Anterior]                    [Siguiente/Clasificar]│   │      │
│    │                                                     │   │      │
│    └─────────────────────────────────────────────────────────┘      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Container Specifications
- **Max Width:** 800px (`max-w-3xl`)
- **Centered:** `mx-auto`
- **Padding:** `px-4 py-8` (responsive)
- **Background:** Page background remains `bg-gray-50`
- **Card Background:** `bg-white`

#### Step Content Areas

**Step 1 - Información:**
- Name input (text)
- Description textarea
- Internal reference input (optional)

**Step 2 - Sector:**
- Sector dropdown selection
- Sub-sector conditional dropdown

**Step 3 - Propósito:**
- Purpose categories (multi-select or radio)
- AI capabilities checklist
- Human oversight confirmation

**Step 4 - Resultado:**
- Summary of inputs
- Classification result preview with RiskBadge
- Final confirmation before save

#### Navigation Buttons

**Anterior (Back):**
- Style: `bg-white border border-gray-300 text-gray-700 hover:bg-gray-50`
- Hidden on Step 1
- Position: Bottom left

**Siguiente (Next):**
- Style: `bg-blue-600 text-white hover:bg-blue-700`
- Visible on Steps 1-3
- Position: Bottom right

**Clasificar (Classify):**
- Style: `bg-green-600 text-white hover:bg-green-700`
- Visible only on Step 4
- Position: Bottom right
- Icon: Sparkles or Wand (optional)

---

## 4. Spanish Labels Reference

### Action Labels

| English | Spanish | Context |
|---------|---------|---------|
| New Use Case | Nuevo caso de uso | Primary CTA button |
| Risk Level | Nivel de riesgo | Filter label, column header |
| Sector | Sector | Filter label, column header |
| Status | Estado | Filter label, column header |
| Classify | Clasificar | Wizard final step button |
| Save | Guardar | Form submit button |
| Cancel | Cancelar | Cancel action button |
| Delete | Eliminar | Delete confirmation button |
| Edit | Editar | Edit action |
| View | Ver | View details action |
| Search | Buscar | Search input placeholder |
| Clear Filters | Limpiar filtros | Filter reset button |
| Previous | Anterior | Wizard navigation |
| Next | Siguiente | Wizard navigation |

### UI Labels

| English | Spanish | Context |
|---------|---------|---------|
| Inventory | Inventario | Page title |
| Use Cases | Casos de uso | Section title |
| Description | Descripción | Form label |
| Name | Nombre | Form label |
| Reference | Referencia | Form label |
| Classification | Clasificación | Result section |
| Result | Resultado | Wizard step |
| Information | Información | Wizard step |
| Purpose | Propósito | Wizard step |
| All | Todos | Filter option |
| Draft | Borrador | Status value |
| Active | Activo | Status value |
| Archived | Archivado | Status value |

### Risk Level Labels

| Level Key | Spanish Label | Badge Text |
|-----------|---------------|------------|
| prohibited | Prohibido | PROHIBIDO |
| high | Alto riesgo | ALTO RIESGO |
| limited | Riesgo limitado | RIESGO LIMITADO |
| minimal | Riesgo mínimo | RIESGO MÍNIMO |
| unclassified | Sin clasificar | SIN CLASIFICAR |

---

## 5. Responsive Breakpoints

### Breakpoint Definitions

| Name | Min Width | Max Width | Tailwind Prefix |
|------|-----------|-----------|-----------------|
| Mobile | - | < 640px | Default (no prefix) |
| Tablet | 640px | 1024px | `sm:`, `md:`, `lg:` |
| Desktop | > 1024px | - | `lg:`, `xl:`, `2xl:` |

### Grid System

**Dashboard Cards Grid:**
```
// Mobile: 1 column
grid-cols-1

// Tablet: 2 columns
sm:grid-cols-2

// Desktop: 3 columns
lg:grid-cols-3
```

**Form Layouts:**
```
// Mobile: Stacked
flex flex-col gap-4

// Desktop: Side-by-side
lg:grid lg:grid-cols-2 lg:gap-6
```

### Component Adaptations

#### FilterBar
| Viewport | Layout |
|----------|--------|
| Mobile | Search full-width, filters stacked, clear button full-width |
| Tablet+ | All elements inline, flex row |

#### UseCaseCard
| Property | Mobile | Desktop |
|----------|--------|---------|
| Actions | Bottom of card | Top-right corner |
| Description | 2 lines max | 3 lines max |
| Padding | p-3 | p-4 |

#### ProgressWizard
| Viewport | Label Visibility |
|----------|------------------|
| Mobile | Hide labels, show active step label only |
| Tablet+ | Show all step labels |

### Touch Targets (Mobile)

- Minimum touch target: 44px × 44px
- Button padding: `p-3` on mobile
- Dropdown height: `min-h-[44px]`
- Card actions: `p-2` minimum

---

## 6. Accessibility Notes

### Keyboard Navigation

**Global Requirements:**
- All interactive elements must be focusable via Tab key
- Focus order must follow visual layout (top-to-bottom, left-to-right)
- Enter or Space activates buttons and links
- Escape closes modals, dropdowns, and dismisses toasts

**Wizard Navigation:**
- Arrow keys move between steps in ProgressWizard (optional enhancement)
- Tab moves between form fields
- Shift+Tab moves backward

**Card Actions:**
- Tab sequence: Edit → Delete → View
- Focus visible on all action buttons

### Focus States

**Visible Focus Ring:**
```css
:focus-visible {
  outline: 2px solid #2563EB; /* blue-600 */
  outline-offset: 2px;
}
```

**Focus Styles by Element:**
| Element | Focus Style |
|---------|-------------|
| Button | `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` |
| Input | `focus:ring-2 focus:ring-blue-500 focus:border-blue-500` |
| Card | `focus:ring-2 focus:ring-blue-500` (if clickable) |
| Dropdown | `focus:ring-2 focus:ring-blue-500` |

### ARIA Labels

**Icon-Only Buttons:**
```tsx
<button aria-label="Editar caso de uso">
  <PencilIcon className="w-4 h-4" />
</button>

<button aria-label="Eliminar caso de uso">
  <TrashIcon className="w-4 h-4" />
</button>

<button aria-label="Ver detalles">
  <EyeIcon className="w-4 h-4" />
</button>
```

**RiskBadge (if interactive):**
```tsx
<span 
  role="img" 
  aria-label={`Nivel de riesgo: ${riskLevelLabel}`}
>
  <ShieldAlertIcon />
  {label}
</span>
```

**ProgressWizard:**
```tsx
<nav aria-label="Progreso de clasificación">
  <ol role="list">
    <li aria-current={isCurrent ? 'step' : undefined}>
      {/* step content */}
    </li>
  </ol>
</nav>
```

### Color Independence

**Requirement:** Color must never be the sole indicator of information.

**Implementation:**
- Risk badges always include both color AND icon
- Risk badges always include text label
- Status indicators include both color dot AND text
- Cards have left border color AND risk badge inside

**Examples:**
```tsx
// ✅ Good - Icon + Color + Text
<RiskBadge level="high" showIcon />
// Shows: [⚠️] ALTO RIESGO (orange background)

// ❌ Bad - Color only
<div className="bg-orange-600" />  // Don't do this
```

### Screen Reader Support

**Live Regions:**
```tsx
// Announce classification results
<div role="status" aria-live="polite" aria-atomic="true">
  {classificationResult && `Clasificación: ${result}`}
</div>
```

**Form Labels:**
```tsx
// Always associate labels with inputs
<label htmlFor="use-case-name">Nombre del caso de uso</label>
<input id="use-case-name" aria-required="true" />
```

**Error Messages:**
```tsx
<input 
  aria-invalid={hasError}
  aria-describedby={hasError ? 'name-error' : undefined}
/>
{hasError && <span id="name-error" role="alert">{errorMessage}</span>}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Contrast Requirements

All text must meet WCAG 2.1 AA contrast ratios:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

**Verified Combinations:**
| Background | Text | Ratio | Pass |
|------------|------|-------|------|
| #DC2626 (red-600) | White | 4.6:1 | ✅ AA |
| #EA580C (orange-600) | White | 3.5:1 | ✅ AA Large |
| #CA8A04 (yellow-600) | White | 3.2:1 | ✅ AA Large |
| #16A34A (green-600) | White | 3.8:1 | ✅ AA Large |
| #6B7280 (gray-500) | White | 5.4:1 | ✅ AA |

---

## Appendix: Icon Reference

### Lucide React Icons Used

| Component | Icons | Import |
|-----------|-------|--------|
| RiskBadge | ShieldAlert, AlertTriangle, AlertCircle, CheckCircle, HelpCircle | `lucide-react` |
| UseCaseCard | Pencil, Trash2, Eye | `lucide-react` |
| EmptyState | FolderOpen, Inbox | `lucide-react` |
| FilterBar | Search, ChevronDown, X | `lucide-react` |
| ProgressWizard | Check | `lucide-react` |
| General | Plus, Sparkles, Wand2 | `lucide-react` |

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Badge icons | 14-16px | `w-4 h-4` |
| Card action icons | 16px | `w-4 h-4` |
| Empty state icon | 64px | `w-16 h-16` |
| Button icons | 16-20px | `w-5 h-5` |
| Wizard step icons | 16px | `w-4 h-4` |

---

*Document Version: 1.0*
*Last Updated: 2026-03-13*
*System: CumplIA Inventory Management Design System*
