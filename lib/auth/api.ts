// lib/auth/api.ts
// ============================================================================
// Camada de acesso à API de autenticação do backend (FastAPI).
// Centraliza todas as chamadas HTTP relacionadas a auth para manter o código
// organizado, reutilizável e fácil de testar.
// ============================================================================

// Base da API vem de variável de ambiente para facilitar trocar entre dev/prod.
// Exemplo em .env.local => NEXT_PUBLIC_API_BASE="https://api.avarynx.mywire.org"
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE).replace(/\/$/, '');

if (!API_BASE) {
  // Aviso em dev somente. Em produção prefira logs de observabilidade.
  // eslint-disable-next-line no-console
  console.warn('[auth/api] Variável NEXT_PUBLIC_API_BASE não definida.');
}

// Tipos simples para respostas do backend
export interface AuthUserDTO {
  id: string;
  email: string;
  username: string | null;
  email_verified: boolean;
}

export interface LoginResponseDTO {
  access_token: string;
  token_type: string; // Deve ser 'Bearer'
}

// Utilidade: checar status e parsing de JSON com tratamento de erro padronizado
async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    // Sempre incluir credentials porque o refresh_token é cookie HttpOnly
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  let data: any = null;
  const isJson = res.headers.get('content-type')?.includes('application/json');
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    // Ignora erro de parse
  }

  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText;
    throw new Error(message || 'Erro de requisição');
  }
  return data as T;
}

// ----------------------- ROTAS DE AUTENTICAÇÃO ------------------------------

export async function apiRegister(params: { email: string; password: string; username?: string }) {
  return http<{ ok: boolean; message: string }>(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      username: params.username?.trim() || undefined,
    }),
  });
}

export async function apiLogin(params: { identifier: string; password: string }) {
  return http<LoginResponseDTO>(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ identifier: params.identifier, password: params.password }),
  });
}

export async function apiLogout() {
  return http<{ ok: boolean }>(`${API_BASE}/api/auth/logout`, { method: 'POST' });
}

export async function apiRefresh() {
  return http<LoginResponseDTO>(`${API_BASE}/api/auth/refresh`, { method: 'POST' });
}

export async function apiMe(accessToken: string) {
  return http<AuthUserDTO>(`${API_BASE}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// URL para iniciar OAuth com Google (redirect window.location)
export function buildGoogleOAuthUrl() {
  return `${API_BASE}/api/auth/google/login`;
}

// Pequena função para decodificar payload de JWT sem validar assinatura (uso client-side)
export function decodeJwt<T = any>(token: string): (T & { exp?: number; iat?: number }) | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Helper para avaliar se token expirou (com leve margem de segurança de 10s)
export function isExpired(token?: string | null) {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  const now = Date.now() / 1000;
  return decoded.exp - 10 < now; // 10 segundos de margem
}

export const AuthAPI = {
  register: apiRegister,
  login: apiLogin,
  logout: apiLogout,
  refresh: apiRefresh,
  me: apiMe,
  googleUrl: buildGoogleOAuthUrl,
  decodeJwt,
  isExpired,
  API_BASE,
};

export default AuthAPI;
