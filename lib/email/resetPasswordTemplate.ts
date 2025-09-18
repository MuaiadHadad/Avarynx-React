/*
 * Reset Password Email Template
 * --------------------------------------------------
 * For usage on the server side (ex: FastAPI / Node) ou para pré-visualização no front.
 * Exporta função que gera subject, html e texto simples a partir dos parâmetros fornecidos.
 */

export interface ResetPasswordEmailParams {
  frontendBaseUrl: string;          // e.g. https://app.example.com
  token: string;                    // raw reset token
  ttlHours: number;                 // validade em horas
  brandName?: string;               // nome da marca (default: 'Avarynx')
  supportEmail?: string;            // email de suporte opcional
  userDisplayName?: string | null;  // nome para saudação
  locale?: 'pt' | 'en';             // idioma simples (pode expandir)
}

export interface ResetPasswordEmailResult {
  subject: string;
  html: string;
  text: string;
  resetUrl: string;
  preheader: string;
}

function buildResetUrl(frontendBaseUrl: string, token: string): string {
  const base = (frontendBaseUrl || '').trim().replace(/\/$/, '');
  return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

// Utilitário simples para escapar texto em atributos/HTML base
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildResetPasswordEmail(params: ResetPasswordEmailParams): ResetPasswordEmailResult {
  const {
    frontendBaseUrl,
    token,
    ttlHours,
    brandName = 'Avarynx',
    supportEmail,
    userDisplayName,
    locale = 'pt',
  } = params;

  if (!frontendBaseUrl) throw new Error('frontendBaseUrl obrigatório');
  if (!token) throw new Error('token obrigatório');
  if (!ttlHours || ttlHours <= 0) throw new Error('ttlHours inválido');

  const resetUrl = buildResetUrl(frontendBaseUrl, token);

  const greeting = userDisplayName
    ? locale === 'en'
      ? `Hello ${userDisplayName},`
      : `Olá ${userDisplayName},`
    : locale === 'en'
      ? 'Hello,'
      : 'Olá,';

  const subject = locale === 'en' ? 'Reset your password' : 'Redefina a sua palavra-passe';

  const preheader = locale === 'en'
    ? 'Password reset link inside (valid for limited time).'
    : 'Link para redefinir a palavra-passe (válido por tempo limitado).';

  const expl = locale === 'en'
    ? `You (or someone) requested to reset your ${brandName} account password.`
    : `Foi feito um pedido para redefinir a palavra-passe da sua conta ${brandName}.`;

  const actionText = locale === 'en' ? 'Reset password' : 'Redefinir palavra-passe';

  const ignore = locale === 'en'
    ? 'If you did not request this, you can safely ignore this email.'
    : 'Se não fez este pedido, pode ignorar este email em segurança.';

  const expires = locale === 'en'
    ? `This link expires in ${ttlHours} hour${ttlHours > 1 ? 's' : ''} and can be used only once.`
    : `Este link expira em ${ttlHours} hora${ttlHours > 1 ? 's' : ''} e só pode ser usado uma vez.`;

  const supportLine = supportEmail
    ? (locale === 'en'
        ? `Need help? Contact us: ${supportEmail}`
        : `Precisa de ajuda? Contacte-nos: ${supportEmail}`)
    : '';

  // Texto simples (fallback)
  const text = [
    greeting,
    '',
    expl,
    `${actionText}: ${resetUrl}`,
    expires,
    ignore,
    supportLine,
    '',
    brandName,
  ].filter(Boolean).join('\n');

  // HTML (layout simples com suporte a dark mode & mobile)
  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
<meta charSet="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${escapeHtml(subject)}</title>
<meta name="description" content="${escapeHtml(preheader)}" />
<style>
  body { margin:0; padding:0; background:#0f1222; color:#e6e9f5; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,'Helvetica Neue',Arial,sans-serif; }
  a { color:#4dabff; text-decoration:none; }
  a:hover { text-decoration:underline; }
  .wrapper { width:100%; background:linear-gradient(135deg,#121736,#0d112b); padding:32px 12px; }
  .container { max-width:560px; margin:0 auto; background:#1b2140; border:1px solid rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; box-shadow:0 8px 32px -8px rgba(0,0,0,0.55),0 2px 6px -2px rgba(0,0,0,0.4); }
  .brand-bar { background:linear-gradient(90deg,#5d34ff,#7a5cff,#4dabff); height:4px; }
  .inner { padding:32px 36px 40px; }
  h1 { font-size:20px; margin:0 0 12px; font-weight:600; letter-spacing:.5px; }
  p { line-height:1.55; font-size:15px; margin:0 0 16px; }
  .btn-wrap { text-align:center; margin:32px 0 40px; }
  .btn-primary { display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; background:linear-gradient(135deg,#6b46ff,#4dabff); color:#ffffff !important; border-radius:14px; box-shadow:0 4px 18px -4px rgba(109,90,255,.45),0 2px 8px -2px rgba(24,144,255,.4); letter-spacing:.3px; }
  .btn-primary:active { transform:translateY(1px); }
  .small { font-size:12px; color:#a8afc7; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.08); }
  @media (max-width:580px) {
    .inner { padding:28px 22px 36px; }
    h1 { font-size:19px; }
  }
  @media (prefers-color-scheme: light) {
    body { background:#f1f5fb; color:#1b2540; }
    .wrapper { background:linear-gradient(135deg,#ffffff,#f1f5fb); }
    .container { background:#ffffff; border:1px solid #e5e9f2; }
    .small { color:#586079; }
    .btn-primary { box-shadow:0 4px 18px -4px rgba(109,90,255,.35),0 2px 8px -2px rgba(24,144,255,.3); }
  }
</style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <div class="wrapper">
    <div class="container">
      <div class="brand-bar"></div>
      <div class="inner">
        <h1>${escapeHtml(subject)}</h1>
        <p>${escapeHtml(greeting)}</p>
        <p>${escapeHtml(expl)}</p>
        <div class="btn-wrap">
          <a class="btn-primary" href="${resetUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(actionText)}</a>
        </div>
        <p style="word-break:break-all; font-size:12px; opacity:.85;">
          ${escapeHtml(resetUrl)}
        </p>
        <p>${escapeHtml(expires)}</p>
        <p>${escapeHtml(ignore)}</p>
        ${supportLine ? `<p>${escapeHtml(supportLine)}</p>` : ''}
        <div class="footer small">
          <p style="margin:0;">&copy; ${new Date().getFullYear()} ${escapeHtml(brandName)}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, html, text, resetUrl, preheader };
}

export default buildResetPasswordEmail;

