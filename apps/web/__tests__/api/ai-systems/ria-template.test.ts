import { GET, PUT } from '@/app/api/v1/ai-systems/[id]/ria-template/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const SYSTEM_ID = 'sys-1';
const VALID_USER = { id: 'user-1', email: 'user@example.com' };
const routeParams = { params: Promise.resolve({ id: SYSTEM_ID }) };

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/ai-systems/[id]/ria-template', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`);

    const res = await GET(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns assigned template when one exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const template = { id: 'tpl-1', name: 'Template A', is_default: false };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))              // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }))                         // membership
      .mockReturnValueOnce(makeQb({ template_id: 'tpl-1', ria_form_templates: template })); // assignment

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('tpl-1');
  });

  it('falls back to default template when no assignment exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const defaultTemplate = { id: 'tpl-default', name: 'Default Template', is_default: true };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }))             // membership
      .mockReturnValueOnce(makeQb(null))                          // no assignment
      .mockReturnValueOnce(makeQb(defaultTemplate));              // default template

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('tpl-default');
  });

  it('falls back to system template when no default exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const systemTemplate = { id: 'tpl-system', name: 'System Template', is_system: true };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }))             // membership
      .mockReturnValueOnce(makeQb(null))                          // no assignment
      .mockReturnValueOnce(makeQb(null))                          // no default template
      .mockReturnValueOnce(makeQb(systemTemplate));               // system template

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe('tpl-system');
  });

  it('returns null data when no template exists at all', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }))             // membership
      .mockReturnValueOnce(makeQb(null))                          // no assignment
      .mockReturnValueOnce(makeQb(null))                          // no default
      .mockReturnValueOnce(makeQb(null));                         // no system template

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeNull();
  });
});

describe('PUT /api/v1/ai-systems/[id]/ria-template', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`, {
      method: 'PUT',
      body: { template_id: 'tpl-1' },
    });

    const res = await PUT(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 400 when template_id is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }));            // membership
    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`, {
      method: 'PUT',
      body: {},
    });

    const res = await PUT(req, routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 404 when template does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))         // use_cases
      .mockReturnValueOnce(makeQb({ role: 'admin' }))                    // membership
      .mockReturnValueOnce(makeQb(null, { message: 'Not found' }));      // template not found

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`, {
      method: 'PUT',
      body: { template_id: 'nonexistent-tpl' },
    });

    const res = await PUT(req, routeParams);
    expect(res.status).toBe(404);
  });

  it('returns 200 and upserts assignment when template exists', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // use_cases
      .mockReturnValueOnce(makeQb({ role: 'editor' }))            // membership (editor is allowed)
      .mockReturnValueOnce(makeQb({ id: 'tpl-1' }))              // template exists
      .mockReturnValueOnce(makeQb(null));                         // upsert assignment

    const req = makeRequest(`/api/v1/ai-systems/${SYSTEM_ID}/ria-template`, {
      method: 'PUT',
      body: { template_id: 'tpl-1' },
    });

    const res = await PUT(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.template_id).toBe('tpl-1');
    expect(body.data.ai_system_id).toBe(SYSTEM_ID);
  });
});
