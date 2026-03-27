import { Resend } from 'resend';
import { InviteEmailTemplate } from './invite-template';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  try {
    // Build invite link
    const inviteLink = `${appUrl}/accept-invite?token=${inviteToken}`;

    // Generate HTML from template
    const html = InviteEmailTemplate({
      invitedUserName: name,
      organizationName,
      inviterName,
      inviteLink,
      role,
    });

    // Send email via Resend
    const response = await resend.emails.send({
      from: 'CumplIA <invitaciones@cumplia.app>',
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
