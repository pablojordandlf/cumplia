# 🔴 INVITATION FLOW - ISSUES IDENTIFIED & FIXES

## Problems Found

### ⚠️ PROBLEM #1: Email Link Goes to Accept Page WITHOUT Proper Token Encoding
**File:** `send-invite.ts`
**Line:** `const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;`

**Issue:**
- `inviteToken` is NOT URL-encoded
- If token contains special chars (/, +, =, %), the URL breaks
- User clicks email link → URL malformed → token fails validation
- Accept-invite page doesn't get valid token

**Fix:**
```typescript
// BEFORE (❌ BROKEN)
const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

// AFTER (✅ FIXED)
const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
```

---

### ⚠️ PROBLEM #2: No RLS Policy for Public Token Lookup
**File:** Supabase RLS Policies (pending_invitations table)

**Issue:**
- `accept-invite` page runs on `useEffect` BEFORE user logs in
- It tries: `supabase.from('pending_invitations').select(...).eq('invite_token', token).single()`
- User is NOT authenticated yet → RLS blocks the query
- Query returns null/error → page shows "Invitación no encontrada"

**Current Flow (BROKEN):**
```
1. User not logged in
2. Accept-invite page tries to query pending_invitations by token
3. RLS policy blocks anonymous access → ERROR
4. Page says "Token not found"
5. Redirects to login
6. After login, token is lost in redirect chain
```

**Fix:**
Need RLS policy that allows ANYONE (even anonymous users) to query by `invite_token`.

---

### ⚠️ PROBLEM #3: Login Redirect Parameter NOT Properly Decoded
**File:** `login-form.tsx`
**Line:** `router.push(decodeURIComponent(redirectUrl));`

**Issue:**
- `redirectUrl` is DOUBLE-encoded:
  - In accept-invite: `router.push(`/login?redirect=${encodeURIComponent(`/accept-invite?token=${encodedToken}`)}`);`
  - This creates: `/login?redirect=%2Faccept-invite%3Ftoken%3DXXX`
  - In login-form: `decodeURIComponent(redirectUrl)` → `/accept-invite?token=XXX`
  - BUT the `token` param is still encoded inside!

**Example:**
```
Accept-invite creates: /login?redirect=%2Faccept-invite%3Ftoken%3Dabc123
                                          ↓
Login-form decodes to: /accept-invite?token=abc123
                                             ↓
Accept-invite reads: "abc123" ✅ OK

BUT if token had special chars like "abc+123/def=":
Encoded: abc%2B123%2Fdef%3D
After first decode: abc+123/def= ✅ But if double-encoded...
Actually after first decode: abc%2B123%2Fdef%3D (still encoded!)
After second decode: abc+123/def= ✅ OK
```

**The real issue:** Token lookup happens BEFORE login, not after.

---

## Root Cause Analysis

**The main issue is TIMING:**

```
Current (❌ BROKEN):
1. User opens email link → /accept-invite?token=XXX
2. No user logged in
3. useEffect runs, tries query by token
4. RLS blocks → Token lookup FAILS
5. Redirect to /login?redirect=/accept-invite?token=XXX
6. User logs in
7. Redirect back to /accept-invite?token=XXX
8. useEffect runs AGAIN (new component mount)
9. NOW user is logged in, query succeeds ✅
10. Creates member + marks accepted ✅

What SHOULD happen:
1. User opens email link → /accept-invite?token=XXX
2. No user logged in
3. Accept-invite checks: "Am I logged in?"
4. NO → Redirect to /login?redirect=/accept-invite?token=XXX
5. User logs in
6. After success: redirect back to /accept-invite?token=XXX
7. useEffect runs
8. User IS logged in, query by token succeeds ✅
9. Creates member + marks accepted ✅
10. Shows "Bienvenido!"
11. Redirect to /dashboard
```

**The code LOOKS correct, but there's a flow issue:**
- Accept-invite tries to query BEFORE redirecting to login
- This causes RLS to block the lookup
- Then redirect happens, which is inefficient but should work

**ACTUAL BUG:** I need to check if RLS policies exist!

---

## Missing RLS Policies

**Required RLS Policy on `pending_invitations` table:**

```sql
-- Allow anonymous users to query by token (for email link clicks)
CREATE POLICY "Allow public invite lookup by token" ON pending_invitations
  FOR SELECT
  USING (true) -- Anyone can select
  WITH CHECK (true);

-- Or more specific: allow ONLY lookup by invite_token
CREATE POLICY "Allow token-based invite lookup" ON pending_invitations
  FOR SELECT
  USING (
    -- Only allow if querying by a matching token
    -- This is a bit tricky because we can't easily check "if querying by token"
    -- Better approach: allow all SELECT, but RLS naturally filters based on session
    true
  );
```

**But wait...** Let me check if RLS is even ENABLED on this table.

---

## Solution Implementation

### Step 1: Fix Token URL Encoding (send-invite.ts)
```typescript
const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(inviteToken)}`;
```

### Step 2: Add RLS Policy for Public Token Lookup
```sql
-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_public_token_lookup" ON pending_invitations;

-- Create new policy: allow anonymous SELECT
CREATE POLICY "allow_public_token_lookup" ON pending_invitations
  FOR SELECT
  USING (true);
```

### Step 3: Simplify Accept-Invite Flow
- Check login status FIRST
- If not logged in → redirect to login immediately
- DON'T try to query token before login
- After login → query succeeds because user is authenticated

### Step 4: Verify Login Redirect Chain
- Login success → check `redirect` param
- If exists → go to that URL (token will be in URL)
- Accept-invite re-runs useEffect with user logged in
- Query by token succeeds → invitation accepted

---

## Updated Flow (CORRECTED)

```
1. User clicks email link → /accept-invite?token=abc123%2Bdef
   ↓
2. Accept-invite useEffect runs
   ↓
3. Check: Is user logged in?
   ├─ YES → Query pending_invitations by token
   │         │
   │         ├─ Found → Accept invitation
   │         │          Show "Bienvenido!"
   │         │          Redirect to /dashboard
   │         │
   │         └─ Not found → Show error
   │
   └─ NO → Redirect to /login?redirect=%2Faccept-invite%3Ftoken%3Dabc123%252Bdef
            (Double-encoded for safety)
            ↓
4. User logs in
   ↓
5. Login success → Check for redirect param
   ├─ Found → Redirect to /accept-invite?token=abc123%2Bdef
   │           (This will be decoded by Next.js router)
   │
   └─ Not found → Redirect to /dashboard
   ↓
6. Accept-invite mounts again with user logged in
   ↓
7. useEffect runs
   ├─ User logged in ✅
   ├─ Token present ✅
   ├─ Query pending_invitations → SUCCEEDS (RLS allows it)
   ├─ Create organization_members
   ├─ Update invitation.status = 'accepted'
   └─ Show "Bienvenido!" + redirect to /dashboard ✅
```

---

## Testing Verification

### Test Case 1: User NOT logged in
```
1. Click: https://cumplia.app/accept-invite?token=abc123
2. Expected: Shows loading spinner
3. Then: Redirects to /login?redirect=%2Faccept-invite%3Ftoken%3Dabc123
4. User logs in
5. Expected: Redirects back to /accept-invite?token=abc123
6. Expected: Token lookup succeeds, invitation accepted ✅
```

### Test Case 2: Already logged in
```
1. User logged in as invitee
2. Click: https://cumplia.app/accept-invite?token=abc123
3. Expected: Token lookup succeeds immediately
4. Expected: Invitation accepted, shows "Bienvenido!" ✅
5. Expected: Redirect to /dashboard
```

### Test Case 3: Invalid token
```
1. Click: https://cumplia.app/accept-invite?token=invalid
2. Expected: Shows "La invitación no se encontró"
```

### Test Case 4: Already accepted
```
1. User already accepted this invite before
2. Click: https://cumplia.app/accept-invite?token=abc123
3. Expected: Shows "Esta invitación ya fue aceptada"
```

---

## Implementation Checklist

- [ ] **send-invite.ts**: Add `encodeURIComponent()` to token
- [ ] **Supabase**: Add RLS policy allowing public token lookup
- [ ] **accept-invite page.tsx**: Verify flow is correct (maybe it already is!)
- [ ] **login-form.tsx**: Verify redirect handling works
- [ ] **Test end-to-end**: Invite → Email → Click → Login → Accept → Member created
- [ ] **Verify in DB**: pending_invitations.status changed to 'accepted'
- [ ] **Verify in DB**: organization_members has new row with status='active'

---

## Next Action

Test with the actual flow to see WHERE it's breaking:
1. Is the email link correct? (check email body)
2. Is the token being passed correctly to accept-invite? (check URL bar)
3. Is RLS blocking the token lookup? (check browser console errors)
4. Is the redirect from login working? (check redirect param after login)
