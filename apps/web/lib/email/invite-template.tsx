export function InviteEmailTemplate({
  invitedUserName,
  organizationName,
  inviterName,
  inviteLink,
  role,
}: {
  invitedUserName?: string;
  organizationName: string;
  inviterName: string;
  inviteLink: string;
  role: string;
}) {
  const roleInSpanish = {
    admin: 'Administrador',
    editor: 'Editor',
    viewer: 'Visualizador',
  }[role] || role;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        background-color: #f9fafb;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        padding: 32px;
        text-align: center;
        color: white;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
      }
      .content {
        padding: 32px;
      }
      .greeting {
        font-size: 16px;
        color: #1f2937;
        margin: 0 0 16px;
      }
      .message {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin: 16px 0;
      }
      .role-badge {
        display: inline-block;
        background-color: #dbeafe;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        margin: 8px 0;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
        color: white;
        padding: 12px 28px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        margin: 24px 0;
        text-align: center;
      }
      .cta-section {
        text-align: center;
        margin: 32px 0;
      }
      .link-text {
        font-size: 12px;
        color: #9ca3af;
        word-break: break-all;
        margin: 16px 0;
        background-color: #f9fafb;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #dbeafe;
      }
      .details {
        background-color: #f3f4f6;
        padding: 16px;
        border-radius: 6px;
        margin: 24px 0;
        font-size: 14px;
      }
      .details-item {
        margin: 8px 0;
        color: #4b5563;
      }
      .details-label {
        font-weight: 600;
        color: #1f2937;
      }
      .footer {
        border-top: 1px solid #e5e7eb;
        padding: 24px 32px;
        background-color: #fafbfc;
        text-align: center;
        font-size: 12px;
        color: #6b7280;
      }
      .footer-link {
        color: #0ea5e9;
        text-decoration: none;
      }
      .expiration-warning {
        background-color: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 12px;
        margin: 16px 0;
        font-size: 12px;
        color: #78350f;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 ¡Te invitan a CumplIA!</h1>
      </div>
      
      <div class="content">
        <p class="greeting">
          Hola${invitedUserName ? ` ${invitedUserName}` : ''},
        </p>
        
        <p class="message">
          <strong>${inviterName}</strong> te ha invitado a unirte a <strong>${organizationName}</strong> en <strong>CumplIA</strong>, la plataforma de cumplimiento del AI Act.
        </p>

        <div class="details">
          <div class="details-item">
            <span class="details-label">Organización:</span> ${organizationName}
          </div>
          <div class="details-item">
            <span class="details-label">Tu rol:</span>
            <span class="role-badge">${roleInSpanish}</span>
          </div>
        </div>

        <p class="message">
          Con este rol, podrás:
        </p>
        
        ${role === 'admin' ? `
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Gestionar miembros del equipo</li>
            <li>Configurar opciones de la organización</li>
            <li>Crear y editar sistemas de IA</li>
            <li>Acceder a todos los datos de cumplimiento</li>
          </ul>
        ` : role === 'editor' ? `
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Crear y editar sistemas de IA</li>
            <li>Gestionar obligaciones y riesgos</li>
            <li>Ver información de cumplimiento</li>
          </ul>
        ` : `
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Ver información de cumplimiento</li>
            <li>Acceder a reportes y análisis</li>
          </ul>
        `}

        <div class="cta-section">
          <a href="${inviteLink}" class="cta-button">Aceptar Invitación</a>
        </div>

        <div class="expiration-warning">
          ⏰ Esta invitación expirará en 7 días. Asegúrate de aceptarla antes de esa fecha.
        </div>

        <p class="message">
          Si el enlace anterior no funciona, copia y pega esta URL en tu navegador:
        </p>

        <div class="link-text">${inviteLink}</div>

        <p class="message" style="color: #9ca3af; font-size: 13px;">
          Si no esperabas esta invitación, puedes ignorarla de forma segura. No tendrás acceso a nada hasta que aceptes la invitación.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 8px;">
          © ${new Date().getFullYear()} CumplIA. Todos los derechos reservados.
        </p>
        <p style="margin: 0; color: #9ca3af; font-size: 11px;">
          Plataforma de cumplimiento del AI Act para empresas
        </p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
