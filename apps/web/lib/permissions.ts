import { Role, User } from './types'; // Assuming you have these types defined elsewhere

// Define the permissions matrix as described in the design doc
const PERMISSIONS: Record<Role, Record<string, boolean>> = {
  'owner': {
    'read:organization': true,
    'update:organization': true,
    'delete:organization': true,
    'read:members': true,
    'invite:member': true,
    'update:member:role': true,
    'delete:member': true,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'delete:ai_system': true,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': true,
    'read:reports': true,
    'export:reports': true,
  },
  'admin': {
    'read:organization': true,
    'update:organization': true,
    'read:members': true,
    'invite:member': true,
    'update:member:role': true,
    'delete:member': true,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': true,
    'read:reports': true,
    'export:reports': true,
  },
  'editor': {
    'read:organization': true,
    'read:members': true,
    'read:ai_systems': true,
    'create:ai_system': true,
    'update:ai_system': true,
    'read:risks': true,
    'create:risk': true,
    'update:risk': true,
    'read:documents': true,
    'generate:document': true,
    'read:reports': true,
  },
  'viewer': {
    'read:organization': true,
    'read:members': true,
    'read:ai_systems': true,
    'read:risks': true,
    'read:documents': true,
    'read:reports': true,
  },
};

// Helper to check if a user has a specific permission within an organization context
export const hasPermission = (role: Role | null | undefined, action: string): boolean => {
  if (!role) return false;
  return PERMISSIONS[role]?.[action] || false;
};

// Helper function to get the current user's context (assuming you have a way to get this)
// This is a placeholder and needs to be implemented based on your auth system
// It should return the user's ID, their role in the current organization, and the organization ID
export const getCurrentContext = async (request: Request): Promise<{ user: User | null; organizationId: string | null; role: Role | null }> => {
  // Replace with your actual authentication logic (e.g., using Supabase auth, JWT, etc.)
  // For Next.js API routes, you might get user info from headers or cookies
  // const supabase = await createClient(request); // Assuming createClient is adapted for API routes
  // const { data: { user } } = await supabase.auth.getUser();
  
  // Placeholder values - REPLACE with actual implementation
  const user: User = { id: 'user-123', email: 'test@example.com', name: 'Test User' }; // Example user object
  const organizationId = request.headers.get('X-Organization-Id') || null; // Example: Get org ID from header
  let role: Role | null = null;

  if (organizationId && user) {
    // Fetch the user's role in the specific organization from your database
    // const { data, error } = await supabase.from('organization_members').select('role').eq('organization_id', organizationId).eq('user_id', user.id).single();
    // if (!error && data) {
    //   role = data.role;
    // }
    // Placeholder role - REPLACE with actual logic
    role = 'owner'; 
  } else if (user) {
      // If no organization context is present, maybe a default role or null
      role = null; // Or a default role if applicable for actions not tied to an org
  }
  
  return { user, organizationId, role };
};