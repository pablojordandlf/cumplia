# 🚀 INVITATION SYSTEM - COMPLETE FIX PLAN

## Summary of Issues

The invitation flow fails at 3 critical points:

1. **Token encoding in email link** → Not URL-encoded → Browser can't parse special characters
2. **RLS policy blocking token lookup** → Anonymous users can't query by token → Lookup fails before login
3. **Flow timing issue** → Page tries to query before redirecting to login → Inefficient but should recover after login

---

## Issues & Fixes

### ISSUE #1: Token Not URL-Encoded in Email Link ✅ FIXED

**File:** `/apps/web/lib/email/send-invite.ts`

**Problem:**
```typescript
// ❌ BROKEN - Special chars in token break URL
const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;
// Example: token = "abc+def/123="
// Link becomes: /accept-invite?token=abc+def/123=
// Browser sees: + as space, / as path separator → INVALID
```

**Fix Applied:**
```typescript
// ✅ FIXED - Token is properly encoded
const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
// Example: token = "abc+def/123="
// Link becomes: /accept-invite?token=abc%2Bdef%2F123%3D
// Browser correctly decodes to: abc+def/123= ✅
```

**Status:** ✅ DONE - Committed to repo

---

### ISSUE #2: RLS Policy Blocks Anonymous Token Lookup

**File:** Supabase `pending_invitations` table RLS policies

**Problem:**
```
User clicks email link → /accept-invite?token=XXX (not logged in)
                    ↓
accept-invite useEffect tries to query by token
                    ↓
Supabase RLS blocks because:
  - User is anonymous (no auth.uid())
  - No policy allows anonymous SELECT
                    ↓
Query fails → setError("La invitación no se encontrada")
                    ↓
Redirect to login (but token is in URL, should work)
                    ↓
After login, accept-invite mounts again
                    ↓
NOW query succeeds (user authenticated)
                    ↓
✅ BUT this is inefficient and causes user confusion
```

**Root Cause:**
- Current RLS policies probably only allow:
  - SELECT if `auth.uid() = user_id` (only your own memberships)
  - Or no SELECT policy at all for public lookup
- We need a policy that allows ANYONE (even anonymous) to SELECT by `invite_token`

**Fix Required:**
```sql
-- Add this RLS policy to pending_invitations
CREATE POLICY "allow_public_token_lookup" ON pending_invitations
  FOR SELECT
  USING (true);  -- Allow anyone to SELECT
```

**Status:** ⚠️ NEEDS EXECUTION - Script ready at `/cumplia/FIX_RLS_POLICY_FOR_INVITES.sql`

---

### ISSUE #3: Accept-Invite Flow Not Optimized (Lower Priority)

**File:** `/apps/web/app/(auth)/accept-invite/page.tsx`

**Current behavior (works, but inefficient):**
```
1. User clicks email link (not logged in)
2. Accept-invite loads, tries to query token
3. RLS blocks → Query fails
4. Code correctly redirects to login
5. User logs in
6. Redirected back to accept-invite
7. Now query succeeds
```

**Optimized behavior (should be):**
```
1. User clicks email link (not logged in)
2. Accept-invite checks: "Am I logged in?"
3. NO → Redirect to login immediately (don't try query)
4. User logs in
5. Redirected back to accept-invite
6. Query succeeds, accept invitation
```

**Impact:** Low - Current code works, just not optimal

**Status:** ℹ️ LOW PRIORITY - Can improve after main fixes

---

## Execution Plan (REQUIRED STEPS)

### Step 1: ✅ Already Done - URL Encode Token
- [x] Modified `/apps/web/lib/email/send-invite.ts`
- [x] Added `encodeURIComponent()` to token in email link
- [x] Committed to repo

### Step 2: ⚠️ URGENT - Execute RLS Policy Fix

**DO THIS IN SUPABASE:**

1. Go to **Supabase Studio → SQL Editor**
2. Copy the full script from `/cumplia/FIX_RLS_POLICY_FOR_INVITES.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Verify output shows policies were created
6. Run verification queries at bottom to confirm

**Expected output:**
```
CREATE POLICY: allow_public_token_lookup ON pending_invitations
CREATE POLICY: allow_member_invite_creation ON pending_invitations
CREATE POLICY: allow_invited_user_accept ON pending_invitations
CREATE POLICY: allow_delete_pending_invitations ON pending_invitations
```

**Verification queries should show:**
```
policyname                         | permissive | qual | with_check
---
allow_public_token_lookup          | PERMISSIVE | true | (nothing)
allow_member_invite_creation       | PERMISSIVE | NULL | auth.uid() IS NOT NULL
allow_invited_user_accept          | PERMISSIVE | true | auth.uid() IS NOT NULL
allow_delete_pending_invitations   | PERMISSIVE | NULL | auth.uid() IS NOT NULL
```

### Step 3: 🧪 Test End-to-End

**Test scenario:**
1. Delete old test data: Run `CLEANUP_USER_FINAL.sql` for test email
2. Invite a new user from another account:
   - Go to Dashboard → Settings → Members
   - Click "Invitar Miembro"
   - Enter email: `test.user@example.com`
   - Select role: Viewer
   - Click "Enviar Invitación"
3. Check email for invite link
4. **WITHOUT logging in**, open the invite link in a new browser tab/incognito
5. You should see: Loading spinner → Token lookup succeeds → Shows login redirect
6. Log in as the invited user
7. **CRITICAL CHECK:** You should be redirected back to accept-invite page
8. Page should show: "¡Bienvenido!" with button to go to dashboard
9. Go to Dashboard
10. **Verify in Supabase:**
    - `pending_invitations` → status changed to `'accepted'` ✅
    - `organization_members` → new row with status `'active'` ✅
    - invited user has correct role ✅

---

## Debugging Checklist

If it still doesn't work, check:

- [ ] **Email body:** Does the link have the correct token? (Check browser console → Network → email endpoint)
- [ ] **Token encoding:** Is token URL-encoded in email link? (Should be `abc%2Bdef`, not `abc+def`)
- [ ] **RLS policies:** Do they exist? (Run verification queries from fix script)
- [ ] **Supabase logs:** Any RLS violations? (Supabase Studio → Logs)
- [ ] **Browser console:** Any JavaScript errors? (DevTools → Console)
- [ ] **Network tab:** Is accept-invite query succeeding or failing? (DevTools → Network → API calls)

### Debug Commands

**In browser console on accept-invite page:**
```javascript
// See all console logs from the page
// Look for 🟡🟢🔴🟠 emoji markers to trace flow

// Check what token was passed
const urlParams = new URLSearchParams(window.location.search);
console.log('Token from URL:', urlParams.get('token'));

// Check if user is logged in
// The accept-invite code logs this: "Usuario logueado: <ID>"
```

---

## After Fixes - What Should Happen

### Scenario A: User NOT logged in when clicking email link

```
Email link: https://cumplia.app/accept-invite?token=abc123%2Bdef456

1. Accept-invite page loads
2. Console: 🟡 Starting invitation acceptance process with token: abc123...
3. Console: 🟡 Step 1: Obteniendo sesión...
4. Console: 🟡 Step 1.1: Usuario NO logueado, redirigiendo a login...
5. Browser redirects to: /login?redirect=%2Faccept-invite%3Ftoken%3Dabc123%252Bdef456
6. User sees login form
7. User enters credentials, clicks "Iniciar Sesión"
8. Backend authenticates user
9. Console: 🟢 Login: Sign in successful
10. Console: 🟡 Login: Redirecting to /accept-invite?token=abc123%2Bdef456
11. Page redirects to accept-invite with token still in URL
12. Accept-invite mounts again
13. Console: 🟡 Starting invitation acceptance process with token: abc123...
14. Console: 🟡 Step 1: Obteniendo sesión...
15. Console: 🟡 Step 2: Usuario logueado: <user-id>
16. Console: 🟡 Step 3: Buscando invitación con token...
17. Console: 🟢 Step 4: Invitación encontrada. Status actual: pending
18. Console: 🟡 Step 5: Validando expiración...
19. Console: 🟡 Step 6: Obteniendo datos de la organización...
20. Console: 🟡 Step 7: Organización: Test Org
21. Console: 🟡 Step 8: Verificando membresía actual...
22. Console: 🟡 Step 9: Creando registro de miembro...
23. Console: 🟢 Miembro creado exitosamente: <member-id>
24. Console: 🟡 Step 10: Actualizando estado de invitación a 'accepted'...
25. Console: 🟢 Invitación marcada como aceptada
26. Console: 🟢 ✅ ÉXITO: Invitación completamente aceptada
27. UI updates: Shows "¡Bienvenido! Tu invitación ha sido aceptada correctamente"
28. User clicks "Ir al Dashboard"
29. Browser goes to /dashboard ✅
30. User sees dashboard as member of organization ✅

Database after completion:
- pending_invitations[id].status = 'accepted' ✅
- organization_members[new_row].user_id = <invited-user-id> ✅
- organization_members[new_row].status = 'active' ✅
- organization_members[new_row].role = 'viewer' (or invited role) ✅
```

### Scenario B: User already logged in when clicking email link

```
Email link: https://cumplia.app/accept-invite?token=abc123%2Bdef456
User is already logged in as "test.user@example.com"

1. Accept-invite page loads
2. Console: 🟡 Starting invitation acceptance process with token: abc123...
3. Console: 🟡 Step 1: Obteniendo sesión...
4. Console: 🟡 Step 2: Usuario logueado: <user-id>
5. Console: 🟡 Step 3: Buscando invitación con token...
6. Console: 🟢 Step 4: Invitación encontrada. Status actual: pending
7. [... steps 5-26 same as above ...]
26. Console: 🟢 ✅ ÉXITO: Invitación completamente aceptada
27. UI updates: Shows "¡Bienvenido!"
28. User clicks "Ir al Dashboard"
29. Browser goes to /dashboard ✅
30. User can now see organization data ✅

Database same as above ✅
```

---

## Commit & Push

After fixing in Supabase:

```bash
cd /home/pablojordan/.openclaw/workspace/cumplia
git add .
git commit -m "Fix: URL-encode invite token in email link

- encodeURIComponent() applied to token in send-invite.ts
- Token special chars (/, +, =, %) now properly encoded in email links
- Fixes issue where tokens with special chars couldn't be parsed

Separate commit: RLS policy for public token lookup
- Allows anonymous users to query pending_invitations by invite_token
- Enables email link preview before login
"
git push origin develop
```

---

## Expected Result

After all fixes:
- ✅ Email contains properly encoded invite link
- ✅ Anonymous users can click link and see token lookup attempt
- ✅ User redirected to login if not authenticated
- ✅ After login, redirected back with token preserved
- ✅ Token lookup succeeds → invitation accepted
- ✅ Database tables updated correctly
- ✅ User redirected to dashboard as org member
- ✅ User can access organization data with their role

---

## Critical Success Criteria

- [ ] RLS policy allows public token lookup (execute SQL script)
- [ ] Email link has URL-encoded token (already done in send-invite.ts)
- [ ] Full end-to-end test passes (invitation → email → login → accept → member created)
- [ ] Both `pending_invitations` and `organization_members` updated in DB
- [ ] User can access dashboard after acceptance
- [ ] User has correct role in organization
