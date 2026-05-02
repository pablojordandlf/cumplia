import { GET } from '@/app/api/v1/dashboard/risk-analysis-stats/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const VALID_USER = { id: 'user-1', email: 'user@example.com' };

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/dashboard/risk-analysis-stats', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest('/api/v1/dashboard/risk-analysis-stats');

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns all zeros when user has no systems', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb([]))  // org_members (no orgs) — thenable
      .mockReturnValueOnce(makeQb([])); // use_cases (no systems) — thenable

    const req = makeRequest('/api/v1/dashboard/risk-analysis-stats');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.total_high_risk).toBe(0);
    expect(body.total_limited_risk).toBe(0);
    expect(body.total_minimal_risk).toBe(0);
    expect(body.completed_high_risk).toBe(0);
  });

  it('aggregates stats correctly by AI Act level', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const systems = [
      { id: 's-1', ai_act_level: 'high_risk', risk_analysis_completed: true },
      { id: 's-2', ai_act_level: 'high_risk', risk_analysis_completed: false },
      { id: 's-3', ai_act_level: 'limited_risk', risk_analysis_completed: true },
      { id: 's-4', ai_act_level: 'minimal_risk', risk_analysis_completed: false },
      { id: 's-5', ai_act_level: 'minimal_risk', risk_analysis_completed: true },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb([{ organization_id: 'org-1' }]))
      .mockReturnValueOnce(makeQb(systems));

    const req = makeRequest('/api/v1/dashboard/risk-analysis-stats');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.total_high_risk).toBe(2);
    expect(body.completed_high_risk).toBe(1);
    expect(body.total_limited_risk).toBe(1);
    expect(body.completed_limited_risk).toBe(1);
    expect(body.total_minimal_risk).toBe(2);
    expect(body.completed_minimal_risk).toBe(1);
  });

  it('ignores prohibited and unclassified systems in stats', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const systems = [
      { id: 's-1', ai_act_level: 'prohibited', risk_analysis_completed: true },
      { id: 's-2', ai_act_level: null, risk_analysis_completed: false },
      { id: 's-3', ai_act_level: 'high_risk', risk_analysis_completed: true },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb([{ organization_id: 'org-1' }]))
      .mockReturnValueOnce(makeQb(systems));

    const req = makeRequest('/api/v1/dashboard/risk-analysis-stats');
    const res = await GET(req);
    const body = await res.json();
    expect(body.total_high_risk).toBe(1);
    expect(body.completed_high_risk).toBe(1);
    expect(body.total_limited_risk).toBe(0);
    expect(body.total_minimal_risk).toBe(0);
  });

  it('returns 500 when use_cases query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb([{ organization_id: 'org-1' }]))
      .mockReturnValueOnce(makeQb(null, { message: 'DB error' }));

    const req = makeRequest('/api/v1/dashboard/risk-analysis-stats');
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
