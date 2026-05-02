import { POST } from '@/app/api/v1/invitations/accept/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const VALID_USER = { id: 'user-1', email: 'user@example.com' };
const VALID_INVITATION = {
  id: 'inv-1',
  organization_id: 'org-1',
  email: 'user@example.com',
  role: 'editor',
  status: 'pending',
  invite_expires_at: new Date(Date.now() + 86400000).toISOString(),
  invite_token: 'token-123',
};

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('POST /api/v1/invitations/accept', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 400 when inviteToken is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/missing/i);
  });

  it('returns 400 when email is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when email does not match authenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'other@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/email does not match/i);
  });

  it('returns 404 when invitation is not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null, { message: 'Not found' }));

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'bad-token', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 when invitation is already accepted', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(
      makeQb({ ...VALID_INVITATION, status: 'accepted' })
    );

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/already accepted/i);
  });

  it('returns 400 when invitation has expired', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(
      makeQb({ ...VALID_INVITATION, invite_expires_at: new Date(Date.now() - 1000).toISOString() })
    );

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/expired/i);
  });

  it('returns 400 when user is already a member', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_INVITATION))      // pending_invitations lookup
      .mockReturnValueOnce(makeQb({ id: 'member-1' }));   // existing member check

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/already a member/i);
  });

  it('returns 500 when inserting member fails', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_INVITATION))          // pending_invitations lookup
      .mockReturnValueOnce(makeQb(null))                      // no existing member
      .mockReturnValueOnce(makeQb(null, { message: 'DB error' }));  // insert member fails

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('returns 200 and accepts invitation successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb(VALID_INVITATION))              // pending_invitations lookup
      .mockReturnValueOnce(makeQb(null))                          // no existing member
      .mockReturnValueOnce(makeQb({ id: 'new-member-1' }))        // insert member
      .mockReturnValueOnce(makeQb({ id: 'inv-1', status: 'accepted' }));  // update invitation

    const req = makeRequest('/api/v1/invitations/accept', {
      method: 'POST',
      body: { inviteToken: 'token-123', email: 'user@example.com' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.organizationId).toBe('org-1');
    expect(body.data.role).toBe('editor');
  });
});
