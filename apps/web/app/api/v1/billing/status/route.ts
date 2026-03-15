import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's subscription from the subscriptions table
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subError);
    }

    // Default to free plan
    let plan = 'free';
    let subscriptionStatus = 'inactive';
    let isPro = false;
    let isAgency = false;
    
    if (subscription) {
      plan = subscription.plan_type || 'free';
      subscriptionStatus = subscription.status;
      isPro = plan === 'pro' || plan === 'agency';
      isAgency = plan === 'agency';
    }

    // Get organization plan if exists
    const { data: org } = await supabase
      .from('organizations')
      .select('plan_name')
      .eq('id', user.id)
      .single();

    // Use organization plan if higher than subscription
    if (org?.plan_name && org.plan_name !== 'free') {
      plan = org.plan_name;
      isPro = plan === 'pro' || plan === 'agency';
      isAgency = plan === 'agency';
    }

    // Get plan limits
    const { data: planData } = await supabase
      .from('plans')
      .select('limits, display_name')
      .eq('name', plan)
      .single();

    return NextResponse.json({
      plan,
      display_name: planData?.display_name || plan,
      status: subscriptionStatus,
      is_pro: isPro,
      is_agency: isAgency,
      limits: planData?.limits || {
        use_cases: 3,
        documents: 0,
        managed_orgs: 1,
        ai_check_exports: 0
      },
      user: {
        id: user.id,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Error in billing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
