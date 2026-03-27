import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Note: Middleware protection is a secondary layer for client-side components
// The main protection happens in RoleGuard components and the main layout.tsx

export async function middleware(request: NextRequest) {
  // For now, we're doing client-side route protection via RoleGuard and layout
  // Middleware is kept minimal to avoid overcomplicating auth flow
  
  // In the future, this could be enhanced to:
  // 1. Check session validity
  // 2. Verify role at request time
  // 3. Add additional security headers
  
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};
