# Paleta de Colores 2026 - Phase 2 Component Updates

## Status
- [x] Phase 1: Configs (tailwind.config.ts, globals.css) - ✅ COMPLETE
- [ ] Phase 2: Core Components - IN PROGRESS
- [ ] Phase 3: Refinement & Polish

## Phase 1 Completed
- ✅ Updated tailwind.config.ts with new color tokens
- ✅ Updated globals.css with new CSS variables
- ✅ New palette colors registered:
  - cumplia-white: #FFFFFF
  - cumplia-nearly-white: #E8ECEB
  - cumplia-warm: #E09E50
  - cumplia-teal: #8CBDB9
  - cumplia-dark: #2D3E4E
- ✅ CSS variables for light + dark mode
- ✅ New utility classes for components
- ✅ Build validation: 0 TypeScript errors
- ✅ Commit + Push to GitHub

## Phase 2: Core Components to Update

### Priority 1: High Visual Impact
1. **RiskDistributionChart** (`components/risk-distribution-chart.tsx`)
   - ✅ Already using light theme + new colors
   - Status: NO CHANGES NEEDED
   
2. **PendingObligationsWidget** (`components/pending-obligations-widget.tsx`)
   - ✅ Already using light theme
   - Status: NO CHANGES NEEDED

3. **RiskAnalysisStatusCard** (`components/dashboard/risk-analysis-status-card.tsx`)
   - ✅ Already using light theme
   - Status: NO CHANGES NEEDED

### Priority 2: General UI Components
1. **Button** (`components/ui/button.tsx`)
   - ✅ Uses CSS variables (primary, secondary) - automatically updated
   - Status: NO CHANGES NEEDED

2. **Input** (`components/ui/input.tsx`)
   - ✅ Uses CSS variables - automatically updated
   - Status: NO CHANGES NEEDED

3. **Card** (`components/ui/card.tsx`)
   - ✅ Uses CSS variables - automatically updated
   - Status: NO CHANGES NEEDED

### Priority 3: Dashboard Components
1. **Dashboard Navbar** (`components/dashboard-navbar.tsx`)
   - TODO: Update background to white/nearly-white
   - TODO: Update text to dark navy
   - TODO: Update accent colors

2. **Dashboard Sidebar** (`components/dashboard-sidebar.tsx`)
   - TODO: Update background colors
   - TODO: Update text colors
   - TODO: Update active/hover states

3. **Navigation/Menu Items**
   - TODO: Update link colors
   - TODO: Update hover states
   - TODO: Update active indicators

## Implementation Strategy

### Step 1: Verify Current State
- [x] Components are already using new light theme
- [x] CSS variables map correctly
- [x] Build passes validation

### Step 2: Check for Hardcoded Colors
Components that need manual review (looking for hardcoded hex/rgb values):
```bash
grep -r "bg-\|text-\|border-" components/ | grep -E "slate|gray|blue|red|orange|yellow|green" | head -30
```

### Step 3: Update Hardcoded Colors
When found, replace with:
- Old dark text → `text-cumplia-primary` or `text-[#2D3E4E]`
- Old light bg → `bg-white` or `bg-[#E8ECEB]`
- Old accent colors → `text-cumplia-warm`, `bg-cumplia-warm`, etc.

### Step 4: Test
- Build: `npm run build`
- Visual regression: Screenshot before/after
- Contrast check: Run Lighthouse
- Mobile responsive: Test on multiple screen sizes

## Components Already Updated (Light Theme)
- risk-distribution-chart.tsx ✅
- pending-obligations-widget.tsx ✅
- risk-analysis-status-card.tsx ✅

## Remaining Work

### Dashboard Components to Review
```
dashboard-navbar.tsx          - Navigation styling
dashboard-sidebar.tsx         - Sidebar & menu styling
landing-header.tsx           - Landing page header
landing-footer.tsx           - Landing page footer
filter-bar.tsx               - Filter UI
global-search.tsx            - Search component
```

### Form Components to Review
```
ui/form.tsx                  - Form wrapper
ui/input.tsx                 - Input styling (likely OK)
ui/label.tsx                 - Label styling
ui/form-field-with-validation.tsx - Form fields
```

### Modal & Dialog Components
```
ui/dialog.tsx                - Dialog backgrounds & text
ui/modal.tsx                 - Modal styling (if exists)
```

## Notes
- Most components already use CSS variables (automatic palette update)
- Light theme already implemented in chart components
- Need to check for hardcoded Tailwind color classes (slate, gray, blue, etc.)
- WCAG contrast requirements already met by palette choice

## Next Steps
1. Run comprehensive grep for hardcoded colors
2. Update any found hardcoded colors
3. Do full visual regression testing
4. Test mobile responsiveness
5. Create PR with changelog
6. Deploy to staging for final review
