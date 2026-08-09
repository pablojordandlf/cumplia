import { GET, POST } from '@/app/api/v1/ria-templates/route';
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

describe('GET /api/v1/ria-templates', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest('/api/v1/ria-templates');

    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns 200 with list of templates', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const templates = [
      { id: 'tpl-1', name: 'System Template', is_system: true, is_default: true },
      { id: 'tpl-2', name: 'Custom Template', is_system: false, is_default: false },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // membership lookup
      .mockReturnValueOnce(makeQb(templates));                     // templates query

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });

  it('returns 500 when database query fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))       // membership lookup
      .mockReturnValueOnce(makeQb(null, { message: 'DB error' }));     // templates query fails

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe('POST /api/v1/ria-templates', () => {
  const VALID_STRUCTURE = { sections: [] };
  const VALID_RULES = { conditions: [] };

  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'New Template', structure: VALID_STRUCTURE, classification_rules: VALID_RULES },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user lacks templates:manage permission', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    // requirePermission calls getUserRole which calls from('organization_members')
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'viewer' }));

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'New Template', structure: VALID_STRUCTURE, classification_rules: VALID_RULES },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('returns 400 when name is empty', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'admin' })); // requirePermission

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: '', structure: VALID_STRUCTURE, classification_rules: VALID_RULES },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/nombre/i);
  });

  it('returns 400 when structure and rules are missing without source', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'admin' })); // requirePermission

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'New Template' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/estructura/i);
  });

  it('returns 201 when template is created successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const createdTemplate = { id: 'tpl-new', name: 'New Template', is_system: false };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))     // requirePermission
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' }))  // membership for org_id
      .mockReturnValueOnce(makeQb(createdTemplate));       // insert template

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'New Template', structure: VALID_STRUCTURE, classification_rules: VALID_RULES },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe('tpl-new');
  });

  it('returns 404 when source_template_id does not exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))            // requirePermission
      .mockReturnValueOnce(makeQb(null, { message: 'Not found' })); // source template lookup

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'Cloned Template', source_template_id: 'nonexistent-id' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('clones structure from source_template_id when provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const sourceTemplate = { structure: VALID_STRUCTURE, classification_rules: VALID_RULES };
    const createdTemplate = { id: 'tpl-clone', name: 'Cloned Template', is_system: false };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))       // requirePermission
      .mockReturnValueOnce(makeQb(sourceTemplate))           // source template
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1' })) // membership
      .mockReturnValueOnce(makeQb(createdTemplate));         // insert

    const req = makeRequest('/api/v1/ria-templates', {
      method: 'POST',
      body: { name: 'Cloned Template', source_template_id: 'src-tpl-1' },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});
