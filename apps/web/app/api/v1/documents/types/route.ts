import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Document types metadata aligned with AI Act requirements
const DOCUMENT_TYPES = {
  ai_policy: {
    title: 'Política de Uso de IA',
    description: 'Documento maestro de gobernanza de IA para toda la organización. Define principios, prohibiciones y procedimientos de uso de sistemas de IA.',
    requires_use_case: false,
    obligatory_for: ['all'],
    legal_basis: 'Art. 26 AI Act (Obligaciones del usuario/deployer)',
    plan_required: 'essential',
  },
  employee_notice: {
    title: 'Aviso a Empleados',
    description: 'Información obligatoria para empleados sobre sistemas de IA de alto riesgo utilizados en el workplace.',
    requires_use_case: true,
    obligatory_for: ['high_risk'],
    legal_basis: 'Art. 50 AI Act (Transparencia hacia personas)',
    plan_required: 'essential',
  },
  systems_register: {
    title: 'Registro de Sistemas de IA',
    description: 'Inventario formal de todos los sistemas de IA de alto riesgo de la organización.',
    requires_use_case: true,
    obligatory_for: ['high_risk'],
    legal_basis: 'Art. 71 AI Act (Registro EU de sistemas de alto riesgo)',
    plan_required: 'essential',
  },
  fria: {
    title: 'FRIA - Evaluación de Impacto',
    description: 'Evaluación de Impacto en Derechos Fundamentales (Art. 27 AI Act). Obligatoria para sistemas de alto riesgo.',
    requires_use_case: true,
    obligatory_for: ['high_risk'],
    legal_basis: 'Art. 27 AI Act (FRIA para sistemas de alto riesgo)',
    plan_required: 'professional',
  },
  candidate_notice: {
    title: 'Aviso a Candidatos',
    description: 'Información para candidatos cuando se utilizan sistemas de IA en procesos de selección de personal.',
    requires_use_case: true,
    obligatory_for: ['high_risk', 'recruitment'],
    legal_basis: 'Art. 50 AI Act (Transparencia en contratación)',
    plan_required: 'essential',
  },
};

export async function GET(request: NextRequest) {
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

    // Get user's plan from organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organizations!inner(id, plan_name)')
      .eq('user_id', user.id)
      .single();

    const organization = Array.isArray(membership?.organizations)
      ? membership?.organizations[0]
      : membership?.organizations;

    const plan = organization?.plan_name || 'starter';

    // Map legacy plans
    const planMapping: Record<string, string> = {
      'free': 'starter',
      'starter': 'starter',
      'pro': 'essential',
      'essential': 'essential',
      'business': 'professional',
      'professional': 'professional',
      'agency': 'professional',
    };

    const mappedPlan = planMapping[plan] || plan;

    // Filter document types based on plan
    const planHierarchy: Record<string, number> = {
      'starter': 1,
      'essential': 2,
      'professional': 3,
    };

    const userPlanLevel = planHierarchy[mappedPlan] || 1;

    const availableTypes = Object.entries(DOCUMENT_TYPES).reduce((acc, [key, type]) => {
      const requiredLevel = planHierarchy[type.plan_required] || 2;
      acc[key] = {
        ...type,
        available: userPlanLevel >= requiredLevel,
        upgrade_required: userPlanLevel < requiredLevel,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      types: availableTypes,
      plan: mappedPlan,
    });
  } catch (error) {
    console.error('Error fetching document types:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
