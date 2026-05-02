import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageMembers,
  canAnalyzeRisks,
  isReadOnly,
  ROLE_PERMISSIONS,
} from '@/lib/permissions';

describe('hasPermission', () => {
  it('owner has ai_systems:read', () => {
    expect(hasPermission('owner', 'ai_systems:read')).toBe(true);
  });

  it('owner has ai_systems:create', () => {
    expect(hasPermission('owner', 'ai_systems:create')).toBe(true);
  });

  it('owner has templates:manage', () => {
    expect(hasPermission('owner', 'templates:manage')).toBe(true);
  });

  it('owner does not have organization:delete', () => {
    expect(hasPermission('owner', 'organization:delete')).toBe(false);
  });

  it('admin has same permissions as owner', () => {
    expect(ROLE_PERMISSIONS.admin).toEqual(ROLE_PERMISSIONS.owner);
  });

  it('admin has templates:manage', () => {
    expect(hasPermission('admin', 'templates:manage')).toBe(true);
  });

  it('admin does not have organization:delete', () => {
    expect(hasPermission('admin', 'organization:delete')).toBe(false);
  });

  it('editor has ai_systems:create', () => {
    expect(hasPermission('editor', 'ai_systems:create')).toBe(true);
  });

  it('editor has risks:analyze', () => {
    expect(hasPermission('editor', 'risks:analyze')).toBe(true);
  });

  it('editor does not have templates:manage', () => {
    expect(hasPermission('editor', 'templates:manage')).toBe(false);
  });

  it('editor does not have members:invite', () => {
    expect(hasPermission('editor', 'members:invite')).toBe(false);
  });

  it('editor does not have evidences:delete', () => {
    expect(hasPermission('editor', 'evidences:delete')).toBe(false);
  });

  it('viewer has ai_systems:read', () => {
    expect(hasPermission('viewer', 'ai_systems:read')).toBe(true);
  });

  it('viewer has organization:read', () => {
    expect(hasPermission('viewer', 'organization:read')).toBe(true);
  });

  it('viewer does not have ai_systems:create', () => {
    expect(hasPermission('viewer', 'ai_systems:create')).toBe(false);
  });

  it('viewer does not have risks:analyze', () => {
    expect(hasPermission('viewer', 'risks:analyze')).toBe(false);
  });

  it('viewer does not have members:invite', () => {
    expect(hasPermission('viewer', 'members:invite')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('returns true if user has at least one of the given permissions', () => {
    expect(hasAnyPermission('viewer', ['ai_systems:read', 'ai_systems:create'])).toBe(true);
  });

  it('returns false if user has none of the given permissions', () => {
    expect(hasAnyPermission('viewer', ['ai_systems:create', 'templates:manage'])).toBe(false);
  });

  it('returns false for empty permission list', () => {
    expect(hasAnyPermission('owner', [])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('returns true if user has all given permissions', () => {
    expect(hasAllPermissions('editor', ['ai_systems:read', 'ai_systems:create'])).toBe(true);
  });

  it('returns false if user is missing one permission', () => {
    expect(hasAllPermissions('editor', ['ai_systems:read', 'members:invite'])).toBe(false);
  });

  it('returns true for empty permission list', () => {
    expect(hasAllPermissions('viewer', [])).toBe(true);
  });
});

describe('canManageMembers', () => {
  it('owner can manage members', () => expect(canManageMembers('owner')).toBe(true));
  it('admin can manage members', () => expect(canManageMembers('admin')).toBe(true));
  it('editor cannot manage members', () => expect(canManageMembers('editor')).toBe(false));
  it('viewer cannot manage members', () => expect(canManageMembers('viewer')).toBe(false));
});

describe('canAnalyzeRisks', () => {
  it('owner can analyze risks', () => expect(canAnalyzeRisks('owner')).toBe(true));
  it('admin can analyze risks', () => expect(canAnalyzeRisks('admin')).toBe(true));
  it('editor can analyze risks', () => expect(canAnalyzeRisks('editor')).toBe(true));
  it('viewer cannot analyze risks', () => expect(canAnalyzeRisks('viewer')).toBe(false));
});

describe('isReadOnly', () => {
  it('viewer is read-only', () => expect(isReadOnly('viewer')).toBe(true));
  it('editor is not read-only', () => expect(isReadOnly('editor')).toBe(false));
  it('admin is not read-only', () => expect(isReadOnly('admin')).toBe(false));
  it('owner is not read-only', () => expect(isReadOnly('owner')).toBe(false));
});
