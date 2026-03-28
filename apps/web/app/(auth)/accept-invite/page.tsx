/**
 * Accept Invitation Page
 * 
 * 🎯 Following PDF Best Practices:
 * - Server Component for initial validation (no 'use client')
 * - Server-side validation endpoint for security
 * - Client-side only handles UI state after server validates
 */

import { Metadata } from 'next';
import AcceptInviteClient from './accept-invite-client';

export const metadata: Metadata = {
  title: 'Accept Invitation | CumplIA',
  description: 'Accept your invitation to join an organization',
};

/**
 * Server Component - Just renders the client component
 * Real validation happens server-side via /api/v1/invitations/validate
 */
export default async function AcceptInvitePage() {
  return <AcceptInviteClient />;
}
