import { GET, POST, DELETE } from '@/app/api/v1/organizations/[id]/members/route';
import { buildMockSupabase, makeQb, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/email/send-invite', () => ({
  sendInviteEmail: jest.fn().mockResolvedValue(undefined),
}));

import { createClient } from '@/lib/supabase/server';

const ORG_ID = 'org-1';
const VALID_USER = { id: 'user-1', email: 'admin@example.com' };
const routeParams = { params: Promise.resolve({ id: ORG_ID }) };

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/organizations/[id]/members', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`);

    const res = await GET(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not a member of the organization', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb(null)); // no membership

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(403);
  });

  it('returns 200 with members and invitations', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const members = [{ id: 'm-1', email: 'a@test.com', role: 'owner', status: 'active' }];
    const invitations = [{ id: 'i-1', email: 'b@test.com', role: 'editor', status: 'pending' }];
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'owner' }))   // membership check
      .mockReturnValueOnce(makeQb(members))              // active members
      .mockReturnValueOnce(makeQb(invitations));         // pending invitations

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`);
    const res = await GET(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(2);
  });
});

describe('POST /api/v1/organizations/[id]/members', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'editor' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user role is editor or viewer', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'editor' })); // editor can't invite

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'viewer' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(403);
  });

  it('returns 400 when email is missing', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'admin' }));

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { role: 'editor' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 400 when role is invalid', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'admin' }));

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'superuser' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 409 when user is already a member', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))          // membership check
      .mockReturnValueOnce(makeQb({ id: 'existing-member' })); // existing member

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'editor' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already a member/i);
  });

  it('returns 409 when invitation is already pending', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))               // membership check
      .mockReturnValueOnce(makeQb(null))                             // no existing member
      .mockReturnValueOnce(makeQb({ id: 'pending-invite' }));        // pending invitation

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'editor' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already pending/i);
  });

  it('returns 201 when invitation is created successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const createdInvitation = { id: 'inv-1', email: 'new@example.com', role: 'editor' };
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))                              // membership check
      .mockReturnValueOnce(makeQb(null))                                            // no existing member
      .mockReturnValueOnce(makeQb(null))                                            // no pending invitation
      .mockReturnValueOnce(makeQb({ plan_name: 'professional', seats_used: 2 }))   // org seats check (professional allows 3 users)
      .mockReturnValueOnce(makeQb(createdInvitation))                              // insert invitation
      .mockReturnValueOnce(makeQb(null))                                            // update seats_used
      .mockReturnValueOnce(makeQb({ name: 'My Org' }))                            // org name for email
      .mockReturnValueOnce(makeQb({ full_name: 'Admin User' }));                   // inviter name for email

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'POST',
      body: { email: 'new@example.com', role: 'editor' },
    });

    const res = await POST(req, routeParams);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.email).toBe('new@example.com');
  });
});

describe('DELETE /api/v1/organizations/[id]/members', () => {
  it('returns 401 when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members?userId=user-2`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 400 when neither userId nor invitationId is provided', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 403 when user does not have permission to remove members', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from.mockReturnValueOnce(makeQb({ role: 'viewer' }));

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members?userId=user-2`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(403);
  });

  it('returns 403 when trying to remove the owner', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))   // requester's membership
      .mockReturnValueOnce(makeQb({ role: 'owner' }));   // target member's role

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members?userId=owner-user`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/cannot remove owner/i);
  });

  it('returns 200 when member is removed successfully', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))    // requester's membership
      .mockReturnValueOnce(makeQb({ role: 'editor' }))   // target member's role
      .mockReturnValueOnce(makeQb(null));                 // update status to removed

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members?userId=user-2`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('returns 200 when invitation is canceled', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: VALID_USER }, error: null });
    mockSupabase.from
      .mockReturnValueOnce(makeQb({ role: 'admin' }))  // requester's membership
      .mockReturnValueOnce(makeQb(null))                // delete invitation
      .mockReturnValueOnce(makeQb({ seats_used: 2 })) // org for seat decrement
      .mockReturnValueOnce(makeQb(null));               // update seats_used

    const req = makeRequest(`/api/v1/organizations/${ORG_ID}/members?invitationId=inv-1`, {
      method: 'DELETE',
    });

    const res = await DELETE(req, routeParams);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
