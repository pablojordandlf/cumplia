/* @jest-environment jsdom */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { makeQb } from '../helpers/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: { getUser: jest.fn() },
  },
}));

jest.mock('@/lib/auth-helpers', () => ({
  useAuthReady: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock('@/app/(dashboard)/dashboard/settings/members/invite-dialog', () => ({
  InviteDialog: () => null,
}));

jest.mock('@/app/(dashboard)/dashboard/settings/members/usage-indicator', () => ({
  UsageIndicator: () => null,
}));

jest.mock('@/components/ui/data-table', () => ({
  DataTable: ({ data }: { data: unknown[] }) => (
    <ul data-testid="data-table">
      {data.map((_, i) => <li key={i}>row-{i}</li>)}
    </ul>
  ),
  DataTableColumnHeader: ({ title }: { title: string }) => <span>{title}</span>,
}));

import MembersPage from '@/app/(dashboard)/dashboard/settings/members/page';
import { supabase } from '@/lib/supabase';
import { useAuthReady } from '@/lib/auth-helpers';

const VALID_USER = { id: 'user-1', email: 'user@example.com' };

function mockFetchMembers(members: unknown[] = []) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ data: members }),
  });
}

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

describe('MembersPage', () => {
  it('shows spinner when auth is not yet ready', () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: false, user: null });

    render(<MembersPage />);

    expect(screen.getByText(/inicializando sesión/i)).toBeInTheDocument();
  });

  it('shows error message when user has no active membership', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock).mockReturnValue(
      makeQb(null, { code: 'PGRST116', message: 'No rows found' })
    );

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/no se encontró tu membresía/i)).toBeInTheDocument();
    });
  });

  it('shows error when organization data cannot be fetched', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'owner' }))
      .mockReturnValueOnce(makeQb(null, { message: 'Not found' })); // org query fails

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/no se pudo acceder a la información de tu organización/i)).toBeInTheDocument();
    });
  });

  it('renders the page heading after successful data load', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'owner' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 1 }));
    mockFetchMembers();

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Miembros del Equipo')).toBeInTheDocument();
    });
  });

  it('shows Invitar Miembro button for owner', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'owner' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 1 }));
    mockFetchMembers();

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /invitar miembro/i })).toBeInTheDocument();
    });
  });

  it('shows Invitar Miembro button for admin', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'admin' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 2 }));
    mockFetchMembers();

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /invitar miembro/i })).toBeInTheDocument();
    });
  });

  it('does not show Invitar Miembro button for viewer', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'viewer' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 1 }));
    mockFetchMembers();

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Miembros del Equipo')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /invitar miembro/i })).not.toBeInTheDocument();
  });

  it('does not show Invitar Miembro button for editor', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'editor' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 1 }));
    mockFetchMembers();

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText('Miembros del Equipo')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /invitar miembro/i })).not.toBeInTheDocument();
  });

  it('shows error when members API call fails', async () => {
    (useAuthReady as jest.Mock).mockReturnValue({ isReady: true, user: VALID_USER });
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(makeQb({ organization_id: 'org-1', role: 'admin' }))
      .mockReturnValueOnce(makeQb({ id: 'org-1', plan_name: 'professional', seats_total: 5, seats_used: 1 }));
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

    render(<MembersPage />);

    await waitFor(() => {
      expect(screen.getByText(/error al cargar los miembros/i)).toBeInTheDocument();
    });
  });
});
