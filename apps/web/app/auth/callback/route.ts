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
      // Ensure user has organization and membership
      await ensureUserOrganization(supabase)
      
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

async function ensureUserOrganization(supabase: Awaited<ReturnType<typeof createClient>>) {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if user already has a membership
    const { data: existingMembership } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (existingMembership) return // User already has organization

    // Check if user has an organization as owner
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)
      .single()

    if (existingOrg) {
      // Org exists but membership missing - create it
      await supabase.from('organization_members').insert({
        organization_id: existingOrg.id,
        user_id: user.id,
        email: user.email,
        role: 'owner',
        status: 'active',
        invited_by: user.id
      })
      return
    }

    // Create new organization for user
    const companyName = user.user_metadata?.company_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Mi Organización'
    const slug = `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(0, 8)}`

    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: companyName,
        slug: slug,
        owner_id: user.id,
        plan: 'starter',
        seats_total: 1,
        seats_used: 1
      })
      .select('id')
      .single()

    if (orgError || !newOrg) {
      console.error('Error creating organization:', orgError)
      return
    }

    // Create membership for owner
    const { error: memberError } = await supabase.from('organization_members').insert({
      organization_id: newOrg.id,
      user_id: user.id,
      email: user.email,
      role: 'owner',
      status: 'active',
      invited_by: user.id
    })

    if (memberError) {
      console.error('Error creating membership:', memberError)
    }
  } catch (error) {
    console.error('Error in ensureUserOrganization:', error)
  }
}