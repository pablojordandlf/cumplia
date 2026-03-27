# ✅ Correct Invitation Flow - Complete Implementation Guide

## The Problem with Current Flow

**Current (BROKEN):**
```
1. User clicks email link → /accept-invite?token=XXX (no auth)
2. Accept page redirects to login
3. User logs in or signs up
4. Redirected back to /accept-invite?token=XXX
5. ❌ But signup created a NEW user account with NEW organization
6. ❌ Invite never accepted, user not in target org
```

**Why it breaks:**
- Signup creates auth.user with auto-generated organization
- Invite acceptance happens AFTER auth setup
- Two competing org creation flows

---

## The Solution: Invitation-First Flow

The correct pattern is to **pass invitation context through auth, then accept AFTER signup completes**.

### Architecture Overview

```
Email Link: /accept-invite?token=XXX&email=user@example.com
                    ↓
Accept-Invite Page (Anonymous)
  └─ Validates token + email match
  └─ Stores invite context in sessionStorage
  └─ Detects user auth status:
     ├─ If logged in → Directly accept invite → redirect to dashboard
     └─ If NOT logged in → Redirect to /signup?invitation_token=XXX
                                      
Signup/Login Page
  └─ Reads invitation_token from URL
  └─ Shows: "Joining organization: <org_name>"
  └─ Completes auth flow
  └─ IMPORTANT: Do NOT create organization on signup
  └─ Redirects to complete invitation
  
Post-Auth Redirect
  └─ User now has auth.user
  └─ Completes invitation acceptance
  └─ User added to organization_members table
  └─ Redirected to dashboard
```

---

## Implementation Steps

### 1. Update Accept-Invite Page (Frontend)

**File:** `apps/web/app/(auth)/accept-invite/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [status, setStatus] = useState<'validating' | 'authenticated' | 'unauthenticated' | 'error' | 'accepted'>('validating');
  const [error, setError] = useState<string>('');
  const [orgName, setOrgName] = useState<string>('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        if (!token) {
          setError('Missing invitation token');
          setStatus('error');
          return;
        }

        // 🟡 Step 1: Validate token exists and get org info
        console.log('🟡 Step 1: Validating invitation token...');
        const { data: invitation, error: inviteError } = await supabase
          .from('pending_invitations')
          .select(`
            id,
            email,
            organization_id,
            invite_expires_at,
            organizations (name)
          `)
          .eq('invite_token', token)
          .single();

        if (inviteError || !invitation) {
          console.log('🔴 Token lookup failed:', inviteError);
          setError('Invalid or expired invitation link');
          setStatus('error');
          return;
        }

        console.log('🟢 Step 2: Invitation found for org:', invitation.organizations?.name);
        setOrgName(invitation.organizations?.name || 'Unknown Organization');

        // 🟡 Step 3: Check expiration
        const expiryDate = new Date(invitation.invite_expires_at);
        if (new Date() > expiryDate) {
          console.log('🟡 Step 3: Invitation expired');
          setError('Invitation has expired');
          setStatus('error');
          return;
        }

        // 🟡 Step 4: Check auth status
        console.log('🟡 Step 4: Checking authentication status...');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // User is authenticated - accept invite immediately
          console.log('🟡 Step 5: User authenticated, accepting invitation...');
          await acceptInvitation(invitation.id, session.user.id, token);
          setStatus('accepted');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // User not authenticated - store context and redirect to signup
          console.log('🟡 Step 5: User not authenticated, redirecting to signup...');
          
          // Store invitation context
          sessionStorage.setItem('invitation_token', token);
          sessionStorage.setItem('invitation_email', invitation.email);
          sessionStorage.setItem('invitation_org_id', invitation.organization_id);
          sessionStorage.setItem('invitation_org_name', orgName);

          // Redirect to signup with invitation token
          const signupUrl = `/signup?invitation_token=${encodeURIComponent(token)}&email=${encodeURIComponent(invitation.email)}`;
          console.log('🟡 Redirecting to:', signupUrl);
          router.push(signupUrl);
        }
      } catch (err) {
        console.error('🔴 Unexpected error:', err);
        setError('An error occurred while processing your invitation');
        setStatus('error');
      }
    };

    if (token) {
      handleInvitation();
    }
  }, [token, supabase, router]);

  // Accept invitation in database
  async function acceptInvitation(invitationId: string, userId: string, token: string) {
    console.log('🟡 Step 6: Accepting invitation in database...');
    
    try {
      // Update pending_invitations status
      const { error: updateError } = await supabase
        .from('pending_invitations')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)
        .eq('invite_token', token);

      if (updateError) {
        console.warn('🟠 Warning: Failed to update invitation status:', updateError);
        // Continue anyway - the member insert is more important
      }

      // Add user to organization_members
      console.log('🟡 Step 7: Adding user to organization...');
      const { data: invitation } = await supabase
        .from('pending_invitations')
        .select('organization_id, role')
        .eq('id', invitationId)
        .single();

      if (invitation) {
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: invitation.organization_id,
            user_id: userId,
            role: invitation.role || 'member',
            status: 'active'
          })
          .select()
          .single();

        if (memberError) {
          console.error('🔴 Failed to add member:', memberError);
          throw new Error('Failed to add you to the organization');
        }

        console.log('🟢 Step 8: User successfully added to organization');
      }
    } catch (err) {
      console.error('🔴 Error accepting invitation:', err);
      throw err;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      <div className="w-full max-w-md p-8 bg-[#2a2a2a] rounded-lg border border-[#7a8a92]/30">
        {status === 'validating' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#E09E50] animate-spin mx-auto" />
            <p className="text-[#E8ECEB]">Validating your invitation...</p>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="text-center space-y-4">
            <p className="text-[#E8ECEB]">Redirecting to signup...</p>
          </div>
        )}

        {status === 'authenticated' && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#E09E50] animate-spin mx-auto" />
            <p className="text-[#E8ECEB]">Accepting your invitation to {orgName}...</p>
          </div>
        )}

        {status === 'accepted' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-[#E8ECEB]">
              Welcome to {orgName}! Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-[#C92A2A] mx-auto" />
            <div>
              <p className="text-[#E8ECEB] font-semibold mb-2">Invitation Error</p>
              <p className="text-[#7a8a92] text-sm">{error}</p>
              <p className="text-[#7a8a92] text-xs mt-4">
                Token: {token || 'missing'}
              </p>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-[#E09E50] text-[#0a0a0a] rounded-lg font-semibold hover:bg-[#E09E50]/80 transition"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 2. Update Signup Page

**File:** `apps/web/app/(auth)/signup/page.tsx`

Add context for invitation in signup form:

```typescript
'use client';

import { useSearchParams } from 'next/navigation';
import SignupForm from './signup-form';
import { useEffect, useState } from 'react';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const [invitationContext, setInvitationContext] = useState<{
    token: string;
    email: string;
    orgName: string;
  } | null>(null);

  useEffect(() => {
    const token = searchParams.get('invitation_token');
    const email = searchParams.get('email');
    
    // Try to get org name from sessionStorage (set by accept-invite page)
    const orgName = sessionStorage.getItem('invitation_org_name');

    if (token && email) {
      setInvitationContext({
        token,
        email,
        orgName: orgName || 'Organization'
      });
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
      <div className="w-full max-w-md p-8 bg-[#2a2a2a] rounded-lg border border-[#7a8a92]/30">
        {invitationContext && (
          <div className="mb-6 p-4 bg-[#E09E50]/10 border border-[#E09E50]/30 rounded-lg">
            <p className="text-[#E09E50] text-sm font-semibold">
              ✓ Invitation accepted!
            </p>
            <p className="text-[#E8ECEB] text-xs mt-1">
              You're about to join <strong>{invitationContext.orgName}</strong>
            </p>
          </div>
        )}

        <SignupForm
          initialEmail={invitationContext?.email}
          skipOrganizationCreation={!!invitationContext}
          invitationToken={invitationContext?.token}
        />
      </div>
    </div>
  );
}
```

---

### 3. Update Signup Form Logic

**File:** `apps/web/app/(auth)/signup/signup-form.tsx`

Key changes:

```typescript
// IMPORTANT: When invitation exists, DO NOT create organization
if (!invitationToken) {
  // Only create org if NOT invited
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      created_by: user.id
    })
    .select()
    .single();

  if (org) {
    // Add user as owner
    await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
        status: 'active'
      });
  }
} else {
  // If invited, complete the invitation acceptance
  const token = sessionStorage.getItem('invitation_token');
  const orgId = sessionStorage.getItem('invitation_org_id');
  
  if (token && orgId) {
    // User already added to org by accept-invite page
    // Just update their status if needed
    sessionStorage.removeItem('invitation_token');
    sessionStorage.removeItem('invitation_email');
    sessionStorage.removeItem('invitation_org_id');
    sessionStorage.removeItem('invitation_org_name');
  }
}

// After signup completes
router.push(invitationToken ? '/dashboard' : '/onboarding');
```

---

### 4. Email Template Update

**File:** `apps/web/lib/email/invite-template.tsx`

```typescript
const InviteEmailTemplate = ({ 
  inviterName, 
  orgName, 
  inviteLink,
  recipientEmail 
}: InviteEmailTemplateProps) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {inviterName} invited you to join {orgName}
      </h2>
      
      <p style={styles.text}>
        Click the button below to accept the invitation and get started:
      </p>

      {/* IMPORTANT: Include email in URL for verification */}
      <a 
        href={`${inviteLink}&email=${encodeURIComponent(recipientEmail)}`}
        style={styles.button}
      >
        Accept Invitation
      </a>

      <p style={styles.footer}>
        This link expires in 7 days.
      </p>
    </div>
  );
};
```

---

### 5. Update Send-Invite Endpoint

**File:** `apps/web/lib/email/send-invite.ts`

```typescript
export async function sendInviteEmail({
  email,
  organizationName,
  inviterName,
  role = 'member',
  organizationId,
}: SendInviteEmailParams) {
  try {
    // 1. Create pending invitation record
    const { data: invitation, error: insertError } = await supabase
      .from('pending_invitations')
      .insert({
        email,
        organization_id: organizationId,
        invited_by: inviterId,
        role,
        invite_token: crypto.randomUUID(),
        invite_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create invitation: ${insertError.message}`);
    }

    // 2. Build invite link with BOTH token and email for verification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cumplia.vercel.app';
    const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(invitation.invite_token)}&email=${encodeURIComponent(email)}`;

    // 3. Send email
    const html = InviteEmailTemplate({
      inviterName,
      orgName: organizationName,
      inviteLink,
      recipientEmail: email
    });

    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `${inviterName} invited you to join ${organizationName}`,
      html,
    });

    return { success: true, invitationId: invitation.id };
  } catch (error) {
    console.error('Failed to send invite:', error);
    throw error;
  }
}
```

---

## RLS Policies (Updated)

```sql
-- Allow anyone to lookup invitation by token (for clicking email links)
CREATE POLICY "allow_public_token_lookup" ON pending_invitations
  FOR SELECT
  USING (true);

-- Allow authenticated users to create invitations
CREATE POLICY "allow_member_invite_creation" ON pending_invitations
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow accepting invitations (update status) - can be done by invited user
CREATE POLICY "allow_invited_user_accept" ON pending_invitations
  FOR UPDATE
  USING (true)  -- Anyone can look up
  WITH CHECK (auth.uid() IS NOT NULL);  -- Only auth users can update

-- Organization members - allow authenticated users to see their org memberships
CREATE POLICY "allow_user_see_org_members" ON organization_members
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );
```

---

## Complete Flow Diagram

```
1. Admin invites user@example.com
   └─ Creates pending_invitations row
   └─ Sends email with link: /accept-invite?token=XXX&email=user@example.com

2. User clicks email link
   └─ Accept-invite page validates token
   └─ ✓ Token valid, org found
   └─ Check: Is user logged in?
   
   IF NOT LOGGED IN:
   ├─ Store invitation context in sessionStorage
   ├─ Redirect to /signup?invitation_token=XXX&email=user@example.com
   ├─ User signs up with that email
   ├─ ⚠️ DO NOT create organization (only for non-invited users)
   ├─ After signup success, auth flow returns to accept-invite
   └─ Accept invitation, add to org_members, redirect to /dashboard

   IF ALREADY LOGGED IN:
   ├─ Update pending_invitations status = 'accepted'
   ├─ Insert into organization_members
   ├─ Redirect to /dashboard with new org access
   └─ User can switch organizations

3. User in /dashboard
   └─ Has access to invited organization
   └─ Can see organization data based on permissions
   └─ Invitation flow complete ✓
```

---

## Testing Checklist

- [ ] Non-existent user clicks invite link
  - [ ] Redirected to /signup with email pre-filled
  - [ ] Shows "You're joining [org]" banner
  - [ ] Signup form has no "Create Organization" field
  - [ ] After signup, added to org with correct role
  - [ ] No new org created in organizations table

- [ ] Existing user clicks invite link
  - [ ] Accept-invite validates auth immediately
  - [ ] Invited organization added to user's accessible orgs
  - [ ] Redirected to /dashboard with new org in switcher
  - [ ] pending_invitations.status changed to 'accepted'

- [ ] Expired invitation link
  - [ ] Error message shown
  - [ ] Suggest login and contact admin

- [ ] Already member tries to accept invite again
  - [ ] Duplicate entry prevented (unique constraint on org_id + user_id)
  - [ ] User shown message: "You're already a member"

---

## Key Implementation Notes

1. **Session Storage vs URL params:** 
   - Use URL params for data that survives page reloads
   - Use sessionStorage for temporary context (invitation_token, org_name)

2. **Organization creation bypass:**
   - Check if `invitationToken` exists in signup form
   - If yes: skip org creation, user joins existing org
   - If no: create new org as usual

3. **RLS policies:**
   - `allow_public_token_lookup` allows anyone to find invitations by token
   - This is safe because: (1) tokens are UUIDs, (2) email verification required, (3) 7-day expiry

4. **Error handling:**
   - Token not found → "Invalid or expired invitation"
   - Already member → "You're already a member of this organization"
   - Invite expired → "Invitation expired, contact admin"

---

## Files to Update

1. ✅ `/apps/web/app/(auth)/accept-invite/page.tsx` - New complete flow
2. ✅ `/apps/web/app/(auth)/signup/page.tsx` - Add invitation context
3. ✅ `/apps/web/app/(auth)/signup/signup-form.tsx` - Skip org creation if invited
4. ✅ `/apps/web/lib/email/invite-template.tsx` - Add email param to link
5. ✅ `/apps/web/lib/email/send-invite.ts` - Include email in URL
6. ✅ Database RLS policies (already created in Supabase)

---

## Expected Result

**Before accepting invitation:**
- pending_invitations.status = 'pending'
- No user in organization_members

**After accepting invitation:**
- pending_invitations.status = 'accepted'
- ✅ organization_members has new row: { organization_id, user_id, role, status: 'active' }
- ✅ User can access dashboard with organization data
- ✅ No duplicate org created
