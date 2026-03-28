# Testing Invitation Flow v2 — Post-Corrections

**Date:** March 28, 2026 9:35 AM  
**Commit:** `242f7d4` - Implement 3 critical invitation flow improvements per PDF best practices  
**Status:** 🟢 **Ready for Testing**

---

## What Changed

### Correction 1 ✅ Email Disabled in Registration
- **File:** `apps/web/app/(auth)/register/register-form.tsx`
- **Status:** ✅ Already implemented (field has `disabled={isLoading || !!invitationContext}`)
- **Behavior:** Email field is read-only when invitation token is present in URL

### Correction 2 ✅ Server-Side Admin Client
- **Files Created:**
  - `apps/web/lib/supabase/admin.ts` — Creates admin client with `service_role_key`
  - Updated `apps/web/app/api/v1/auth/register-with-invitation/route.ts` — Uses `createAdminClient()`
- **Benefit:** `organization_members` insert bypasses RLS with proper elevated privileges
- **Impact:** More secure, future-proof for stricter RLS policies

### Correction 3 ✅ Server-Side Validation Endpoint
- **Files Created:**
  - `apps/web/app/api/v1/invitations/validate/route.ts` — New POST endpoint
  - `apps/web/app/(auth)/accept-invite/accept-invite-client.tsx` — Client component
  - `apps/web/app/(auth)/accept-invite/page.tsx` — Server component wrapper
- **Benefit:** All validation logic moved server-side (no more business logic in browser)
- **Impact:** Better security posture, easier to tighten RLS later

---

## Test Scenarios

### Pre-Test Checklist
- [ ] Staging deployment available (or local dev with ngrok)
- [ ] Test email address ready (e.g., `test-invite-2024@example.com`)
- [ ] Supabase dashboard access for DB inspection
- [ ] Browser DevTools console open for logs
- [ ] Database inspection queries ready

### Test 1: New User Registration via Invitation (Happy Path)

**Setup:**
1. Create new organization: "Test Org v2"
2. Send invitation to `testuser@example.com` with role "member"
3. Copy invitation URL from Resend

**Steps:**
1. Click invitation link in email
2. Should see "Accept Invitation" page with "Validating your invitation..."
3. Organization name displays: "Test Org v2"
4. **Check logs:** Should see:
   ```
   🟡 Step 1: Server-side validation of invitation token...
   🟢 Step 1b: Invitation is valid: {org: "Test Org v2", role: "member"}
   🟡 Step 2: Checking authentication status...
   🟡 Step 3: User not authenticated, redirecting to signup...
   ```
5. Auto-redirects to `/register?invitation_token=...&email=testuser@example.com`
6. Register form shows:
   - Email field: `testuser@example.com` (**disabled/read-only**)
   - Banner: "✓ Has sido invitado a unirte a Test Org v2"
7. Enter password and confirm
8. Click "Crear Cuenta"

**Expected Result:**
- No errors in console
- POST to `/api/v1/auth/register-with-invitation` returns 200
- Redirects to dashboard
- **DB Check:**
  ```sql
  SELECT * FROM pending_invitations WHERE email = 'testuser@example.com';
  -- status should be 'accepted' ✓
  
  SELECT * FROM organization_members WHERE organization_id = '<org_id>';
  -- new row with user_id and role='member' ✓
  
  SELECT * FROM auth.users WHERE email = 'testuser@example.com';
  -- user exists with email_confirmed_at set ✓
  ```

**Failure Points to Check:**
- [ ] If console shows `400 Bad Request` on `/api/v1/invitations/validate` → RLS policy issue
- [ ] If email field is editable → Bug in register-form.tsx (disabled prop)
- [ ] If dashboard redirects but no org_members row → Email mismatch or transaction failed

---

### Test 2: Duplicate Email (Already Registered User)

**Setup:**
1. Create organization "Test Org 2"
2. Send invitation to `existing-user@example.com`
3. User `existing-user@example.com` already exists in `auth.users`

**Steps:**
1. Click invitation link
2. Redirects to register
3. Form pre-fills email and disables it
4. Enter password for new account
5. Click "Crear Cuenta"

**Expected Result:**
- Error: "Este email ya está registrado" (422 from Supabase)
- **Console logs:**
  ```
  🔴 Auth creation failed: {status: 422, message: "...already registered..."}
  ```
- Stays on register page, error message shows

**DB Check:**
```sql
SELECT * FROM pending_invitations WHERE email = 'existing-user@example.com';
-- status still 'pending' (not accepted) ✓
```

---

### Test 3: Invitation Already Accepted

**Setup:**
1. Create organization "Test Org 3"
2. Send invitation to `already-accepted@example.com`
3. User accepts invitation and completes registration
4. Click the same invitation link again

**Steps:**
1. Visit `/accept-invite?token=<same_token>&email=already-accepted@example.com`
2. Should validate

**Expected Result:**
- Error: "This invitation has already been accepted"
- Stays on error page with option to go to login
- **Console logs:**
  ```
  🔴 Server validation failed: {error: "This invitation has already been accepted"}
  ```

---

### Test 4: Expired Invitation

**Setup:**
1. Create organization "Test Org 4"
2. Manually create invitation with `invite_expires_at` set to **yesterday**
```sql
INSERT INTO pending_invitations (
  organization_id, email, invite_token, invite_expires_at
) VALUES (
  '<org_id>', 'expired@example.com', 'test-token-expired', NOW() - INTERVAL '1 day'
);
```

**Steps:**
1. Visit `/accept-invite?token=test-token-expired&email=expired@example.com`

**Expected Result:**
- Page shows "Invitation Expired" card
- Error: "This invitation has expired"
- Button "Go to Home"
- **Console logs:**
  ```
  🔴 Server validation failed: {error: "This invitation has expired"}
  ```

---

### Test 5: Email Mismatch

**Setup:**
1. Create invitation for `invited@example.com`
2. Try to access with different email in URL

**Steps:**
1. Visit `/accept-invite?token=<token>&email=different@example.com`

**Expected Result:**
- Error: "Email does not match this invitation"
- Stays on error page
- **Console logs:**
  ```
  🔴 Server validation failed: {error: "Email does not match this invitation"}
  ```

---

### Test 6: Server Component Architecture Check

**Setup:**
- Open browser DevTools → Network tab → JavaScript
- Look for client-side bundle

**Steps:**
1. Visit `/accept-invite?token=<token>`
2. Check Network tab

**Expected Result:**
- `page.tsx` (Server Component) is **not** sent as JS bundle
- Only `accept-invite-client.tsx` JavaScript is loaded
- `/api/v1/invitations/validate` call visible in Network tab as POST request
- **No** direct RLS policy calls from browser

---

### Test 7: Admin Client Elevated Privileges

**Setup:**
- Enable verbose logging in `register-with-invitation/route.ts`

**Steps:**
1. Register via invitation as in Test 1
2. Check server logs

**Expected Result:**
- `organization_members` insert succeeds even if RLS policy is strict
- **No** 403 Forbidden errors
- All 3 DB operations (user create, org_members insert, invitation update) complete atomically
- If any fails, user creation is committed but org_members insert fails (transaction not rolled back in current implementation)

**Verify in DB:**
```sql
SELECT * FROM organization_members 
WHERE user_id = '<new_user_id>' 
  AND organization_id = '<test_org_id>';
-- Should have row with role='member' and status='active' ✓
```

---

## Automated Testing Script

Create a `.env.test` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TEST_EMAIL_BASE=test-$(date +%s)@example.com
```

Run invitation flow test:
```bash
npm run test:invitation
```

---

## DB State Inspection Queries

### After Successful Registration via Invitation
```sql
-- Check invitation status
SELECT id, email, status, organization_id, invite_expires_at
FROM pending_invitations
WHERE email = 'testuser@example.com';

-- Check org membership
SELECT om.*, u.email
FROM organization_members om
JOIN auth.users u ON om.user_id = u.id
WHERE u.email = 'testuser@example.com';

-- Check user was created with email confirmed
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
WHERE email = 'testuser@example.com';
```

### Admin Client Verification
```sql
-- Check that service_role key can insert org_members
-- (Run this as admin in Supabase SQL Editor)
SELECT current_setting('role');
-- Should show either 'authenticated' or 'service_role'
```

---

## Debugging Checklist

### If Test 1 Fails at Registration:

**Error: 400 on `/api/v1/invitations/validate`**
- [ ] Check RLS policy on `pending_invitations` has `USING (true)` for SELECT
- [ ] Verify policy name: "Anyone can lookup invitation by token"
- [ ] Check if policy is correctly created in Supabase
- [ ] Run query manually: `SELECT * FROM pending_invitations WHERE invite_token = '...';`

**Error: Email mismatch**
- [ ] Check URL has correct email encoded: `?email=test%40example.com`
- [ ] Verify database invitation email matches exactly (case-insensitive compare)
- [ ] Check for whitespace in email field

**Error: 422 on register**
- [ ] Verify service_role_key is set in `.env.local`
- [ ] Check `supabase.auth.admin.createUser()` is being called (not `signUp()`)
- [ ] Review Supabase Auth logs for duplicate key errors

### If Dashboard Doesn't Load Post-Registration:

**Missing org_members row**
- [ ] Check if organization_members insert failed silently
- [ ] Look for RLS errors in Supabase logs
- [ ] Verify admin client has correct privileges
- [ ] Run insert manually in Supabase SQL Editor

**User created but invitation not updated to 'accepted'**
- [ ] Check if pending_invitations update failed
- [ ] Verify row exists before update
- [ ] Check for concurrent update issues

---

## Success Criteria

✅ All 7 tests pass  
✅ No 403 Forbidden or RLS errors  
✅ Email field properly disabled in registration form  
✅ Server validation endpoint works as expected  
✅ Admin client bypasses RLS correctly  
✅ DB state is consistent (no orphaned users or pending invitations)  
✅ Dashboard redirects work  
✅ Build compiles without errors  

---

## Known Issues / Limitations

1. **No transaction rollback:** If `organization_members` insert fails, user is still created in auth
   - **Mitigation:** This is acceptable for v1 (user can manually be added to org)
   - **Future:** Implement Supabase transaction wrapper or two-phase commit

2. **RLS policies need manual migration:** New policies must be applied in Supabase
   - **Status:** Migration files exist but need to be applied
   - **Script:** Run `CLEAN_RLS_FOR_INVITES.sql` in Supabase SQL Editor

3. **Admin client requires `.env` variable:** Must be set in production
   - **Variable:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Risk:** Exposure of this key = full database access
   - **Mitigation:** Never commit to git, use secrets management

---

## Next Steps After Successful Testing

1. [ ] Merge to `develop` branch
2. [ ] Deploy staging to Vercel
3. [ ] Test end-to-end in staging
4. [ ] Get approval for production deployment
5. [ ] Merge to `master`
6. [ ] Deploy to production
7. [ ] Monitor for invitation acceptance errors
8. [ ] Update documentation with new flow
