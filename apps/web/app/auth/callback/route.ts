import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if user has organization - redirect to onboarding if not
      const redirectUrl = await getRedirectUrl(supabase, next)
      
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

async function getRedirectUrl(supabase: Awaited<ReturnType<typeof createClient>>, defaultNext: string): Promise<string> {
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

    // Check if user has a pending invitation
    const { data: pendingInvite } = await supabase
      .from('organization_members')
      .select('id, organization_id, status')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1)
      .single()

    if (pendingInvite) {
      // User has pending invitation - accept it automatically
      await supabase
        .from('organization_members')
        .update({ 
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .eq('id', pendingInvite.id)
      
      return defaultNext
    }

    // No organization - redirect to onboarding
    return '/onboarding/organization'
    
  } catch (error) {
    console.error('Error in getRedirectUrl:', error)
    // On error, default to dashboard (user will be redirected to onboarding if needed)
    return defaultNext
  }
}