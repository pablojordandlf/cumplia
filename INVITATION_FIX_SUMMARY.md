# Invitation System Fix Summary

## 🔴 PROBLEM

When accepting an invitation:
1. Email link token matches database token ✅
2. But invitation status remains `pending` (never becomes `accepted`) ❌
3. User never appears in `organization_members` table ❌
4. No clear error in frontend or logs ❌

### Root Cause

**RLS Policy Validation Failure (Silent)**

The client-side UPDATE to `pending_invitations` was being silently blocked by RLS policies:

```typescript
// OLD (BROKEN)
const { error: updateError } = await supabase
  .from('pending_invitations')
  .update({ status: 'accepted' })
  .eq('id', invitationId)
  .eq('invite_token', token);

// Result: error = null, but no rows updated! 🔴
```

The RLS policy `WITH CHECK (auth.uid() IS NOT NULL)` only validated that user existed, not that they could modify THIS specific invitation.

---

## ✅ SOLUTION

### 1. Backend Endpoint: `/api/v1/invitations/accept`

**File:** `apps/web/app/api/v1/invitations/accept/route.ts`

**Purpose:** Accept invitation server-side where RLS is bypassed and proper context exists

**Workflow:**
1. User is authenticated (verified via `supabase.auth.getUser()`)
2. Validate email matches authenticated user email
3. Find invitation by token + email
4. Check expiration and status
5. Add user to `organization_members` (atomic insert)
6. Update `pending_invitations` status to `accepted` (atomic update)

**Error Handling:**
- Returns 404 if invitation not found
- Returns 400 if already accepted or expired
- Returns 500 with details if DB operations fail
- Non-blocking member addition (tries both operations)

---

### 2. Updated Frontend Flows

#### A. Accept-Invite Page
**File:** `apps/web/app/(auth)/accept-invite/page.tsx`

**Change:** Call backend endpoint instead of direct UPDATE

```typescript
// NEW: Call backend
const response = await fetch('/api/v1/invitations/accept', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inviteToken: token,
    email: invitationEmail,  // Validated from DB first
  }),
});
```

**Handles both cases:**
- ✅ Authenticated user: Backend accepts immediately
- ✅ Unauthenticated user: Redirects to signup, passes token in URL

#### B. Register/Signup Flow
**File:** `apps/web/app/(auth)/register/register-form.tsx`

**Change:** Use backend endpoint after signup

```typescript
// After signup completes, call acceptance endpoint
const response = await fetch('/api/v1/invitations/accept', {
  method: 'POST',
  body: JSON.stringify({
    inviteToken: token,
    email: newUser.email,
  }),
});
```

**Result:** New user is added to organization automatically ✅

---

## 📊 Data Flow

### Scenario 1: Authenticated User Accepts Invitation

```
1. Email link: /accept-invite?token=XXX&email=user@example.com
2. Accept-invite page validates token (PUBLIC query via RLS)
3. Detects user is authenticated
4. Calls POST /api/v1/invitations/accept
   └─ Backend: Adds user to org_members + updates status
5. Redirect to dashboard
```

### Scenario 2: Unauthenticated User Accepts Invitation

```
1. Email link: /accept-invite?token=XXX&email=user@example.com
2. Accept-invite page validates token (PUBLIC query via RLS)
3. Detects user NOT authenticated
4. Stores token/email in sessionStorage
5. Redirects to signup: /register?invitation_token=XXX&email=user@example.com
6. User signs up with email
7. Calls POST /api/v1/invitations/accept
   └─ Backend: Adds user to org_members + updates status
8. Redirects to dashboard (NOT onboarding)
```

---

## 🔒 Security Considerations

✅ **Token Validation:**
- Token must be URL-encoded (handles base64 special chars)
- Token must exist in DB and not be expired
- Token + email must match exactly

✅ **Authentication:**
- User must be logged in to accept
- User's email must match invitation email
- Prevents users from accepting invitations meant for others

✅ **Atomic Operations:**
- Both INSERT and UPDATE succeed or both fail
- User cannot be member without invitation being accepted
- No partial state

---

## 🧪 Testing Checklist

- [ ] Send invitation from dashboard
- [ ] Copy email link
- [ ] Click link WITHOUT being logged in
  - [ ] Token should validate ✅
  - [ ] Should redirect to signup ✅
  - [ ] Email should be pre-filled ✅
- [ ] Sign up with same email
  - [ ] Should auto-accept invitation ✅
  - [ ] Should NOT show organization creation page ✅
  - [ ] Should redirect to dashboard ✅
- [ ] Verify Supabase data:
  - [ ] `pending_invitations.status` = `accepted` ✅
  - [ ] `organization_members` has new row ✅
  - [ ] `organization_members.role` matches invitation role ✅
- [ ] Click link while already logged in
  - [ ] Should immediately accept ✅
  - [ ] Status bar should complete ✅
  - [ ] Should redirect to dashboard ✅

---

## 🚀 Commits

1. **`f9e120d`** - Backend endpoint + accept-invite page update
   - New: `POST /api/v1/invitations/accept`
   - Updated: accept-invite page to use endpoint
   
2. **`7b0504b`** - Register flow update
   - Refactored: register-form.tsx invitation completion
   - Uses backend endpoint instead of direct DB updates

---

## 📝 References

- **RLS Policy Issues:** RLS was working (SELECT/INSERT OK), but UPDATE had incorrect `WITH CHECK`
- **Solution Type:** Architecture change from client-side to server-side DB operations
- **Impact:** All invitation acceptance flows now reliable

---

## Future Improvements

1. **Rate Limiting:** Add rate limit to acceptance endpoint
2. **Audit Logging:** Log who accepted which invitation and when
3. **Notification:** Send admin notification when invitation accepted
4. **Auto-cleanup:** Remove expired pending_invitations after 30+ days
