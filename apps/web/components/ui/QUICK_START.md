# 🎨 Emotional Design - Quick Start Guide

Get delightful microinteractions and personality in your components in 5 minutes.

## 🎬 1. Show Celebration on Success

```tsx
import { CelebrationModal } from '@/components/ui/celebration-modal'
import { useState } from 'react'

export function RiskAssessment() {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleComplete = async () => {
    // ... your logic
    setShowSuccess(true)
  }

  return (
    <>
      {/* Your form */}
      <button onClick={handleComplete}>Submit</button>

      <CelebrationModal
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="Assessment Complete! 🎉"
        message="Your systems are now classified for compliance."
        ctaLabel="View Report"
      />
    </>
  )
}
```

---

## 📦 2. Replace Empty States

```tsx
import { EmptyInventory, EmptyUseCases, EmptyRisks } from '@/components/ui/empty-states'

export function SystemsView() {
  const systems = useQuery(...)
  
  // Instead of: if (!systems) return <div>No systems</div>
  
  if (systems.length === 0) {
    return (
      <EmptyInventory 
        onAddSystem={() => navigate('/add-system')}
      />
    )
  }

  return <SystemsList systems={systems} />
}
```

---

## ✨ 3. Add Form Validation Animation

```tsx
import { FormFieldWithValidation } from '@/components/ui/form-field-with-validation'
import { FormWrapper } from '@/components/ui/form-wrapper'

export function CreateUseCase() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // ... your api call
    setLoading(false)
  }

  return (
    <FormWrapper
      title="Create Use Case"
      submitLabel="Create Use Case"
      submitLoading={loading}
      onSubmit={handleSubmit}
    >
      {/* Replaces <input> with validation checkmark */}
      <FormFieldWithValidation
        label="Use Case Name"
        placeholder="e.g., Document Classification"
        onValidate={async (value) => {
          const exists = await checkNameExists(value)
          return !exists
        }}
        successMessage="Name is available!"
        helperText="Choose a unique name"
      />

      <FormFieldWithValidation
        label="Description"
        placeholder="What does this system do?"
        successMessage="Looks good!"
      />
    </FormWrapper>
  )
}
```

---

## 🔄 4. Contextual Loading Messages

```tsx
import { ContextualLoader } from '@/components/ui/contextual-loader'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export function AIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <>
      {/* Inline loader */}
      <ContextualLoader
        isLoading={isAnalyzing}
        context="analysis"  // "analyzing with AI..."
        customMessage="Evaluating risk levels..."
      >
        <div>{/* your content */}</div>
      </ContextualLoader>

      {/* OR full-screen loader */}
      <ContextualLoader
        isLoading={isAnalyzing}
        context="generating"  // "generating your report..."
        fullScreen={true}
      />
    </>
  )
}
```

---

## 🛡️ 5. Error Handling with Personality

```tsx
import { ErrorBoundary } from '@/components/ui/error-boundary'

export function DashboardPage() {
  return (
    <ErrorBoundary>
      <div>
        {/* Your components here */}
        {/* If any error occurs, friendly message + retry button */}
      </div>
    </ErrorBoundary>
  )
}
```

---

## 📝 6. Use Friendly Micro-Copy

```tsx
import { microcopy } from '@/lib/microcopy'

// Anywhere in your code:
export function FormButtons() {
  return (
    <>
      <button>{microcopy.actions.submit}</button>
      {/* Result: "Create Use Case" not "Submit" */}
      
      <button>{microcopy.buttons.addSystem}</button>
      {/* Result: "Add Your First System" not "Add" */}
    </>
  )
}
```

**Quick reference:**
```ts
microcopy.actions.submit       // "Create Use Case"
microcopy.actions.save         // "Save Changes"
microcopy.loading.analysis     // "Analyzing with AI..."
microcopy.errors.network       // "Looks like we lost connection..."
microcopy.empty.noSystems      // "Your inventory is empty"
```

---

## 🪝 7. Use Micro-Interaction Hooks

```tsx
import { useMicroInteraction, useFormValidation } from '@/lib/hooks/use-micro-interaction'

export function CompleteForm() {
  const { celebrate, showSuccess } = useMicroInteraction()
  const { setFieldValidation, getFieldStatus, isFormValid } = useFormValidation()

  const handleFieldChange = (field, value) => {
    const isValid = validateField(field, value)
    setFieldValidation(field, isValid)
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return

    // Trigger celebration
    await celebrate({ duration: 2000 })
    
    // Then show success
    await showSuccess(600)
  }

  return (
    <>
      <input
        onChange={(e) => handleFieldChange('email', e.target.value)}
        className={getFieldStatus('email') === 'success' ? 'border-green-500' : ''}
      />
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}
```

---

## 🎯 Common Patterns

### Pattern 1: Form with Validation
```tsx
<FormWrapper onSubmit={handleSubmit} submitLabel="Create Use Case">
  <FormFieldWithValidation label="Name" onValidate={validate} />
  <FormFieldWithValidation label="Description" />
</FormWrapper>
```

### Pattern 2: Loading Data
```tsx
<ContextualLoader isLoading={loading} context="analysis">
  {data && <YourContent data={data} />}
</ContextualLoader>
```

### Pattern 3: Empty States
```tsx
{items.length === 0 ? (
  <EmptyInventory onAddSystem={handleAdd} />
) : (
  <ItemsList items={items} />
)}
```

### Pattern 4: Error Handling
```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Pattern 5: Celebration
```tsx
<button onClick={() => setShowSuccess(true)}>
  Complete
</button>
<CelebrationModal open={showSuccess} onOpenChange={setShowSuccess} />
```

---

## 📚 Full Documentation

See `/components/ui/EMOTIONAL_DESIGN.md` for:
- Complete component API
- All animation options
- Micro-copy dictionary
- Advanced usage examples
- Mobile considerations
- Performance tips

---

## 💡 Tips

1. **Animations are subtle** - 300-600ms max, never jarring
2. **Context matters** - Use specific loading messages
3. **Test with users** - Measure delight with real feedback
4. **Mobile first** - All components are responsive
5. **Type safe** - Full TypeScript support throughout

---

## 🚀 Ready? Start Using These Today!

Pick one component and integrate it into your next PR. Users will notice the difference immediately.

**Questions?** Check `/components/ui/EMOTIONAL_DESIGN.md` or look at the component source code (it's well-commented).

---

**Remember:** Small details = big happiness. Ship it! 🎉
