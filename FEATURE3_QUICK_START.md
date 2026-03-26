# Feature 3: Quick Start Guide

## 🎯 What Changed

The dashboard now adapts based on user roles:
- **admin**: Full featured interface
- **compliance_officer**: Risk-focused interface
- **auditor**: Report-focused interface  
- **viewer**: Read-only dashboard only

## 🚀 How to Use

### 1. Protection is Automatic
The main layout (`apps/web/app/(dashboard)/layout.tsx`) now:
- Fetches the user's role from `organization_members.role`
- Routes to the appropriate layout variant
- Shows a loading spinner while fetching

No changes needed to existing pages - they'll automatically show/hide based on role.

### 2. Conditional Navigation
The sidebar (`apps/web/components/dashboard-sidebar.tsx`) now:
- Filters menu items based on user role
- Shows a role badge for non-admin users
- Dynamically updates mobile bottom nav

Navigation is automatically role-aware. No code changes needed.

### 3. Protect New Pages

When creating new pages, use `RoleGuard` for extra protection:

```tsx
// apps/web/app/(dashboard)/my-admin-page/page.tsx
'use client';

import { RoleGuard } from '@/components/role-guard';

export default function MyAdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div>
        <h1>Admin Only</h1>
        {/* Content */}
      </div>
    </RoleGuard>
  );
}
```

### 4. Show Role Information

Display the user's current role:

```tsx
'use client';

import { useUserOrganization } from '@/lib/auth-helpers';
import { ReadOnlyBadge } from '@/components/read-only-badge';

export default function Header() {
  const { data } = useUserOrganization();
  
  return (
    <div>
      <h1>Welcome {data?.role}</h1>
      <ReadOnlyBadge />
    </div>
  );
}
```

## 📋 Available Roles

| Role | Type | Access Level | Use Case |
|------|------|--------------|----------|
| `admin` | Full | Everything | System administrators |
| `compliance_officer` | Limited | Risk & Compliance | Compliance teams |
| `auditor` | Limited | Reports & Audit | Auditors |
| `viewer` | Read-only | Dashboard summary | Stakeholders |

## 🔐 Navigation by Role

### Admin (Full Access)
```
Dashboard
Riesgo
Evaluaciones  
Reportes
Sistemas de IA
Formación
Templates
Usuarios
Configuración
Mi Perfil
```

### Compliance Officer (Risk-focused)
```
Dashboard
Riesgo
Evaluaciones
Reportes
Mi Perfil
```

### Auditor (Report-focused)
```
Dashboard
Riesgo
Evaluaciones (read-only)
Reportes
Mi Perfil
```

### Viewer (Read-only)
```
Dashboard (summary only)
Mi Perfil
```

## 🛠️ Developer Info

### Components

**RoleGuard** - Client-side route protection
```tsx
<RoleGuard allowedRoles={['admin', 'compliance_officer']}>
  <ProtectedComponent />
</RoleGuard>
```

**ReadOnlyBadge** - Shows current role
```tsx
<ReadOnlyBadge />
```

### Hooks

**useUserOrganization** - Get current role
```tsx
const { data, error, isLoading } = useUserOrganization();
console.log(data.role); // 'admin' | 'compliance_officer' | ...
```

### Types

```ts
type UserRole = 'admin' | 'compliance_officer' | 'auditor' | 'viewer';
```

## 🔄 Updating Navigation Items

The navigation is defined in `apps/web/components/dashboard-sidebar.tsx`:

```tsx
const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    // No roles = visible to everyone
  },
  {
    title: "Risk",
    href: "/dashboard/risk",
    icon: AlertCircle,
    roles: ['compliance_officer', 'auditor', 'admin'],
    // Only these roles see this item
  },
  // ... more items
];
```

To add a new nav item:
1. Add to `allNavItems` array
2. Set `roles` array for role-specific items
3. Leave `roles` undefined to show to all roles

## ⚡ Performance Notes

- Role is fetched once per layout mount
- Cached by React (not refetched on every render)
- Falls back to 'viewer' role on error
- Async loading with fallback UI

## 🔗 File Locations

| File | Purpose |
|------|---------|
| `apps/web/app/(dashboard)/layouts/*` | Layout variants |
| `apps/web/app/(dashboard)/layout.tsx` | Main router |
| `apps/web/components/dashboard-sidebar.tsx` | Navigation |
| `apps/web/components/role-guard.tsx` | Protection |
| `apps/web/components/read-only-badge.tsx` | Status badge |
| `apps/web/middleware.ts` | Server-side router (future) |
| `apps/web/lib/auth-helpers.ts` | Role fetching |

## 🐛 Troubleshooting

### Role not updating
- Hard refresh the page (Ctrl+F5)
- Check organization_members table has correct role
- Verify user_id matches

### Routes not protected
- Ensure RoleGuard is wrapping the content
- Check allowedRoles includes the user's role
- Verify user is authenticated

### Navigation items missing
- Check user has correct role in organization_members
- Verify NavItem has correct roles array
- Check browser console for auth errors

## 📞 Support

For issues or questions:
1. Check auth state: `useAuthReady()` shows current user
2. Verify role: `useUserOrganization()` shows user role
3. Review FEATURE3_IMPLEMENTATION.md for technical details
