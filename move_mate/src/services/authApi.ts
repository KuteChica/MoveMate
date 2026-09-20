export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
};

type AuthApiResponse = {
  message: string;
  user: AuthUser;
  token: string;
};

const authApiUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth`;
const tokenStorageKey = "movemate-auth-token";
const userStorageKey = "movemate-auth-user";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${authApiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.message || "The request could not be completed.");
  }

  return body as T;
}

function saveSession(session: AuthSession) {
  localStorage.setItem(tokenStorageKey, session.token);
  localStorage.setItem(userStorageKey, JSON.stringify(session.user));
}

export async function loginRequest(email: string, password: string): Promise<AuthSession> {
  const response = await request<AuthApiResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { user: response.user, token: response.token };
}

export async function signupRequest(name: string, email: string, password: string): Promise<AuthSession> {
  const response = await request<AuthApiResponse>("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return { user: response.user, token: response.token };
}

export async function getCurrentUser(): Promise<AuthSession> {
  const token = localStorage.getItem(tokenStorageKey);
  if (!token) {
    throw new Error("No active session.");
  }

  try {
    const response = await request<{ user: AuthUser }>("/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = { user: response.user, token };
    saveSession(session);
    return session;
  } catch (error) {
    clearAuthSession();
    throw error;
  }
}

function clearAuthSession() {
  localStorage.removeItem(tokenStorageKey);
  localStorage.removeItem(userStorageKey);
}

export function logoutRequest() {
  clearAuthSession();
}

export function storeAuthSession(session: AuthSession) {
  saveSession(session);
}
