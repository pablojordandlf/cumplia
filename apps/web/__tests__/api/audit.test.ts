import { GET, POST } from '@/app/api/v1/audit/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../helpers/supabase';
import { makeRequest } from '../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const VALID_USER = { id: 'user-1', email: 'user@example.com' };
const MEMBERSHIP = { organization_id: 'org-1' };

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/audit', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest('/api/v1/audit');

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when user has no active organization', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));

    const req = makeRequest('/api/v1/audit');
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 200 with audit entries', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const entries = [
      { id: 'e-1', action: 'create', entity_type: 'ai_system' },
      { id: 'e-2', action: 'update', entity_type: 'risk' },
    ];
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))  // org_members single
      .mockReturnValueOnce(makeQb(entries));     // audit_log range (thenable)

    const req = makeRequest('/api/v1/audit');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries).toHaveLength(2);
  });

  it('returns empty array when no entries exist', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))
      .mockReturnValueOnce(makeQb(null));  // null data → returned as []

    const req = makeRequest('/api/v1/audit');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entries).toEqual([]);
  });

  it('clamps limit to 200', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))
      .mockReturnValueOnce(makeQb([]));

    const req = makeRequest('/api/v1/audit', { searchParams: { limit: '500' } });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const auditQb = mockSupabase.from.mock.results[1].value;
    expect(auditQb.range).toHaveBeenCalledWith(0, 199); // min(500, 200) = 200 → range(0, 199)
  });

  it('applies entity_type filter when provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))
      .mockReturnValueOnce(makeQb([]));

    const req = makeRequest('/api/v1/audit', { searchParams: { entity_type: 'ai_system' } });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const auditQb = mockSupabase.from.mock.results[1].value;
    expect(auditQb.eq).toHaveBeenCalledWith('entity_type', 'ai_system');
  });
});

describe('POST /api/v1/audit', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Unauthorized' } });
    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { action: 'create', entity_type: 'ai_system' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 404 when user has no active organization', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));

    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { action: 'create', entity_type: 'ai_system' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 when action is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(MEMBERSHIP));

    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { entity_type: 'ai_system' }, // missing action
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when entity_type is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(MEMBERSHIP));

    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { action: 'create' }, // missing entity_type
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('creates audit log entry and returns it', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const created = {
      id: 'log-1',
      action: 'create',
      entity_type: 'ai_system',
      organization_id: 'org-1',
      user_id: 'user-1',
    };
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))  // org_members
      .mockReturnValueOnce(makeQb(created));     // audit_log insert single

    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { action: 'create', entity_type: 'ai_system', entity_id: 'sys-1', entity_name: 'My System' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('log-1');
    expect(body.action).toBe('create');
  });

  it('auto-populates organization_id and user_id', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const created = { id: 'log-2', action: 'delete', entity_type: 'risk', organization_id: 'org-1', user_id: 'user-1' };
    const insertQb = makeQb(created);
    mockSupabase.from
      .mockReturnValueOnce(makeQb(MEMBERSHIP))
      .mockReturnValueOnce(insertQb);

    const req = makeRequest('/api/v1/audit', {
      method: 'POST',
      body: { action: 'delete', entity_type: 'risk' },
    });

    await POST(req);
    expect(insertQb.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        organization_id: 'org-1',
        user_id: 'user-1',
        user_email: 'user@example.com',
      })
    );
  });
});
