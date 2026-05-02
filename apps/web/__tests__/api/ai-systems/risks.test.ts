import { GET, PATCH, POST } from '@/app/api/v1/ai-systems/[id]/risks/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const SYSTEM_ID = 'sys-1';
const VALID_USER = { id: 'user-1', email: 'user@example.com' };
const VALID_SYSTEM = { id: SYSTEM_ID, organization_id: 'org-1', ai_act_level: 'high_risk' };
const routeParams = { params: Promise.resolve({ id: SYSTEM_ID }) };

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/ai-systems/[id]/risks', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`);

    const res = await GET(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 404 when system does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null, { message: 'Not found' }));

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(404);
  });

  it('returns 403 when user has no access', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))   // system found
      .mockReturnValueOnce(makeQb(null, { code: 'PGRST116', message: 'No rows' }))  // no membership
      .mockReturnValueOnce(makeQb(null, { message: 'No rows' }));  // not owner either

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(403);
  });

  it('returns 200 with risks and summary when user has org membership', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const risks = [
      { id: 'r-1', status: 'mitigated', catalog_risk: { criticality: 'high' } },
      { id: 'r-2', status: 'identified', catalog_risk: { criticality: 'critical' } },
      { id: 'r-3', status: 'assessed', catalog_risk: { criticality: 'medium' } },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))              // system found
      .mockReturnValueOnce(makeQb({ id: 'member-1', user_id: VALID_USER.id }))  // membership
      .mockReturnValueOnce(makeQb(risks));                    // risks

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.risks).toHaveLength(3);
    expect(body.summary.total).toBe(3);
    expect(body.summary.mitigated).toBe(1);
    expect(body.summary.assessed).toBe(2); // mitigated + assessed
    expect(body.summary.critical_open).toBe(1);
    expect(body.ai_act_level).toBe('high_risk');
  });

  it('returns 200 with completion_percentage of 0 when no risks', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))
      .mockReturnValueOnce(makeQb({ id: 'member-1', user_id: VALID_USER.id }))
      .mockReturnValueOnce(makeQb([]));

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`);
    const res = await GET(req, routeParams);
    const body = await res.json();
    expect(body.summary.completion_percentage).toBe(0);
  });
});

describe('PATCH /api/v1/ai-systems/[id]/risks', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'PATCH',
      body: { applicable_catalog_risk_ids: [] },
    });

    const res = await PATCH(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 404 when system does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null, { message: 'Not found' }));

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'PATCH',
      body: { applicable_catalog_risk_ids: [] },
    });

    const res = await PATCH(req, routeParams);
    expect(res.status).toBe(404);
  });

  it('returns 200 and marks risks applicable/not-applicable', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const allRisks = [
      { id: 'r-1', catalog_risk_id: 'cat-1' },
      { id: 'r-2', catalog_risk_id: 'cat-2' },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))                   // system
      .mockReturnValueOnce(makeQb({ role: 'editor' }))              // membership
      .mockReturnValueOnce(makeQb(null))                            // mark applicable update
      .mockReturnValueOnce(makeQb(allRisks))                        // get all risks
      .mockReturnValueOnce(makeQb(null));                           // mark not-applicable

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'PATCH',
      body: { applicable_catalog_risk_ids: ['cat-1'] },
    });

    const res = await PATCH(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.applicable_count).toBe(1);
    expect(body.not_applicable_count).toBe(1);
  });
});

describe('POST /api/v1/ai-systems/[id]/risks', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { template_id: 'tpl-1' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 404 when system does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null, { message: 'Not found' }));

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { template_id: 'tpl-1' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(404);
  });

  it('returns 400 for prohibited systems', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ ...VALID_SYSTEM, ai_act_level: 'prohibited' }))
      .mockReturnValueOnce(makeQb({ role: 'editor' }));

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { template_id: 'tpl-1' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/prohibited/i);
  });

  it('returns 200 when action is clear', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))
      .mockReturnValueOnce(makeQb({ role: 'editor' }))
      .mockReturnValueOnce(makeQb(null));  // delete risks

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { action: 'clear' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toMatch(/cleared/i);
  });

  it('returns 201 when applying a template', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const templateItems = [
      { catalog_risk_id: 'cat-1' },
      { catalog_risk_id: 'cat-2' },
    ];
    const createdRisks = [
      { id: 'r-1', use_case_id: SYSTEM_ID, catalog_risk_id: 'cat-1' },
      { id: 'r-2', use_case_id: SYSTEM_ID, catalog_risk_id: 'cat-2' },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))       // system
      .mockReturnValueOnce(makeQb({ role: 'editor' })) // membership
      .mockReturnValueOnce(makeQb(templateItems))       // template items
      .mockReturnValueOnce(makeQb(null))                // clear existing risks
      .mockReturnValueOnce(makeQb(createdRisks));       // insert new risks

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { template_id: 'tpl-1' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.risks).toHaveLength(2);
  });

  it('returns 404 when template is empty or not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_SYSTEM))
      .mockReturnValueOnce(makeQb({ role: 'editor' }))
      .mockReturnValueOnce(makeQb([], null)); // empty template

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/risks`, {
      method: 'POST',
      body: { template_id: 'empty-tpl' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(404);
  });
});
