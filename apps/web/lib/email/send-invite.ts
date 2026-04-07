import { Resend } from 'resend';
import { InviteEmailTemplate } from './invite-template';

interface SendInviteEmailParams {
  email: string;
  name?: string;
  organizationName: string;
  inviterName: string;
  inviteToken: string;
  role: 'admin' | 'editor' | 'viewer';
  appUrl: string;
}

export async function sendInviteEmail({
  email,
  name,
  organizationName,
  inviterName,
  inviteToken,
  role,
  appUrl,
}: SendInviteEmailParams) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Build invite link with properly encoded token AND email for verification
    const inviteLink = `${appUrl}/accept-invite?token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`;

    // Generate HTML from template
    const html = InviteEmailTemplate({
      invitedUserName: name,
      organizationName,
      inviterName,
      inviteLink,
      role,
    });

    // Send email via Resend
    // Using onboarding@resend.dev for development (free tier without domain verification)
    // TODO: Change to 'invitaciones@cumplia.app' when custom domain is verified
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `Te invitan a unirte a ${organizationName} en CumplIA`,
      html,
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      throw new Error(`Failed to send email: ${response.error.message}`);
    }

    console.log('Invite email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending invite email:', error);
    throw error;
  }
}
