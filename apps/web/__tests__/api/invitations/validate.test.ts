import { GET } from '@/app/api/v1/invitations/validate/route';
import { buildMockSupabase, MockSupabase } from '../../helpers/supabase';
import { makeRequest } from '../../helpers/request';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

import { createClient } from '@/lib/supabase/server';

const VALID_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

let mockSupabase: MockSupabase;

beforeEach(() => {
  jest.resetAllMocks();
  mockSupabase = buildMockSupabase();
  (createClient as jest.Mock).mockResolvedValue(mockSupabase);
});

describe('GET /api/v1/invitations/validate', () => {
  it('returns 400 when token is missing', async () => {
    const req = makeRequest('/api/v1/invitations/validate');

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.isValid).toBe(false);
    expect(body.error).toMatch(/requerido/i);
  });

  it('returns 400 when token is not a valid UUID', async () => {
    const req = makeRequest('/api/v1/invitations/validate', {
      searchParams: { token: 'not-a-uuid' },
    });

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.isValid).toBe(false);
    expect(body.error).toMatch(/inválido/i);
  });

  it('returns 500 when RPC call fails', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } });
    const req = makeRequest('/api/v1/invitations/validate', {
      searchParams: { token: VALID_UUID },
    });

    const res = await GET(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.isValid).toBe(false);
  });

  it('returns valid response when token is valid', async () => {
    const rpcData = {
      isValid: true,
      data: {
        invitationId: 'inv-1',
        email: 'test@example.com',
        organizationId: 'org-1',
        organizationName: 'Test Org',
        role: 'editor',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    };
    mockSupabase.rpc.mockResolvedValue({ data: rpcData, error: null });
    const req = makeRequest('/api/v1/invitations/validate', {
      searchParams: { token: VALID_UUID },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.isValid).toBe(true);
    expect(body.data.organizationName).toBe('Test Org');
  });

  it('returns 400 when token is invalid according to RPC', async () => {
    const rpcData = { isValid: false, error: 'Token not found' };
    mockSupabase.rpc.mockResolvedValue({ data: rpcData, error: null });
    const req = makeRequest('/api/v1/invitations/validate', {
      searchParams: { token: VALID_UUID },
    });

    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.isValid).toBe(false);
  });

  it('calls rpc with correct parameters', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: { isValid: true, data: {} }, error: null });
    const req = makeRequest('/api/v1/invitations/validate', {
      searchParams: { token: VALID_UUID },
    });

    await GET(req);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('validate_invitation_token', {
      p_token: VALID_UUID,
    });
  });
});
