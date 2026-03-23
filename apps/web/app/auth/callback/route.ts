import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const inviteToken = searchParams.get('invite') // Support invite token in URL

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has organization or pending invitation
      const redirectUrl = await getRedirectUrl(supabase, next, inviteToken)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${redirectUrl}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

async function getRedirectUrl(
  supabase: Awaited<ReturnType<typeof createClient>>, 
  defaultNext: string,
  inviteToken?: string | null
): Promise<string> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return '/login'

    // Check if user already has an active membership
    const { data: existingMembership } = await supabase
      .from('organization_members')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .single()

    if (existingMembership) {
      // User has organization - redirect to dashboard
      return defaultNext
    }

    // Check if user has a pending invitation by email
    const { data: pendingInviteByEmail } = await supabase
      .from('pending_invitations')
      .select('id, organization_id, email, role, name')
      .eq('email', user.email)
      .eq('status', 'pending')
      .limit(1)
      .single()

    if (pendingInviteByEmail) {
      // Accept invitation automatically
      const now = new Date().toISOString()
      
      // Create active membership
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: pendingInviteByEmail.organization_id,
          user_id: user.id,
          email: user.email,
          name: pendingInviteByEmail.name || user.user_metadata?.name || null,
          role: pendingInviteByEmail.role,
          status: 'active',
          created_at: now,
          updated_at: now,
        })

      if (memberError) {
        console.error('Error creating membership from invitation:', memberError)
        // Continue to onboarding instead of failing
        return '/onboarding/organization'
      }

      // Update invitation status to accepted
      await supabase
        .from('pending_invitations')
        .update({ 
          status: 'accepted',
          updated_at: now,
        })
        .eq('id', pendingInviteByEmail.id)

      return defaultNext
    }

    // Check if invite token was provided in URL (for pre-verified invites)
    if (inviteToken) {
      const { data: pendingInviteByToken } = await supabase
        .from('pending_invitations')
        .select('id, organization_id, email, role, name, invite_expires_at')
        .eq('invite_token', inviteToken)
        .eq('status', 'pending')
        .single()

      if (pendingInviteByToken) {
        // Check if invitation expired
        const expiresAt = new Date(pendingInviteByToken.invite_expires_at)
        if (expiresAt < new Date()) {
          // Expired - update status
          await supabase
            .from('pending_invitations')
            .update({ status: 'expired' })
            .eq('id', pendingInviteByToken.id)
          
          return '/login?error=invite_expired'
        }

        // Accept invitation
        const now = new Date().toISOString()
        
        // Create active membership
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: pendingInviteByToken.organization_id,
            user_id: user.id,
            email: user.email,
            name: pendingInviteByToken.name || user.user_metadata?.name || null,
            role: pendingInviteByToken.role,
            status: 'active',
            created_at: now,
            updated_at: now,
          })

        if (!memberError) {
          // Update invitation status
          await supabase
            .from('pending_invitations')
            .update({ 
              status: 'accepted',
              updated_at: now,
            })
            .eq('id', pendingInviteByToken.id)

          return defaultNext
        }
      }
    }

    // No organization - redirect to onboarding
    return '/onboarding/organization'
    
  } catch (error) {
    console.error('Error in getRedirectUrl:', error)
    // On error, default to dashboard (user will be redirected to onboarding if needed)
    return defaultNext
  }
}
