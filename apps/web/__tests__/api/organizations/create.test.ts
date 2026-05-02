import { POST } from '@/app/api/v1/organizations/create/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/supabase/admin', () => ({
  createAdminClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const VALID_USER = {
  id: 'user-1',
  email: 'owner@example.com',
  user_metadata: { full_name: 'Test Owner' },
};
const CREATED_ORG = {
  id: 'org-1',
  name: 'Test Org',
  slug: 'test-org',
};

let mockSupabase: MockSupabase;
let mockAdmin: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  mockAdmin = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  (createAdminClient as jest.Mock).mockReturnValue(mockAdmin);
});

describe('POST /api/v1/organizations/create', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth error' } });
    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org', country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when user already belongs to an organization', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ organization_id: 'existing-org' }));

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org', country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/ya perteneces/i);
  });

  it('returns 400 when name is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null)); // no existing membership

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/nombre/i);
  });

  it('returns 400 when name is too short', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'A', country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when country is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toMatch(/país/i);
  });

  it('returns 201 and creates organization with owner membership', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null)); // no existing membership
    mockAdmin.from
      .mockReturnValueOnce(makeQb(CREATED_ORG))  // insert org
      .mockReturnValueOnce(makeQb(null));          // insert member

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org', country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.organization.id).toBe('org-1');
    expect(body.organization.name).toBe('Test Org');
    expect(body.organization.role).toBe('owner');
  });

  it('returns 500 when organization creation fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));
    mockAdmin.from.mockReturnValueOnce(makeQb(null, { message: 'DB error' }));

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org', country: 'ES' },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('sets plan to professional regardless of client input', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null));

    const orgQb = makeQb(CREATED_ORG);
    mockAdmin.from
      .mockReturnValueOnce(orgQb)
      .mockReturnValueOnce(makeQb(null));

    const req = makeRequest('/api/v1/organizations/create', {
      method: 'POST',
      body: { name: 'Test Org', country: 'ES', plan: 'enterprise' },
    });

    await POST(req);
    expect(orgQb.insert).toHaveBeenCalledWith(
      expect.objectContaining({ plan_name: 'professional' })
    );
  });
});
