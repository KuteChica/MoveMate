import mockUser from "../api/json/user.json";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  username: string;
  profile: {
    avatar: string;
    bio: string;
  };
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
};

const accessTokenKey = "movemate-access-token";
const refreshTokenKey = "movemate-refresh-token";
const userStorageKey = "movemate-auth-user";

const mockResponse = mockUser as AuthResponse & {
  data: AuthResponse["data"] & { user: AuthUser & { firstName: string; lastName: string; password: string } };
};

const toAuthUser = (user: typeof mockResponse.data.user): AuthUser => ({
  id: user.id,
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  role: user.role,
  username: user.username,
  profile: user.profile,
});

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  const user = mockResponse.data.user;
  if (email.trim().toLowerCase() !== user.email || password !== user.password) {
    throw new Error("Invalid email or password.");
  }

  return {
    ...mockResponse,
    data: { ...mockResponse.data, user: toAuthUser(user) },
  };
}

export async function signupRequest(name: string, email: string, password: string) {
  if (!name.trim() || !email.trim() || !password) {
    throw new Error("Complete all fields to create an account.");
  }

  return { success: true, message: "Account created successfully." };
}

export async function getCurrentUser(): Promise<AuthUser> {
  if (localStorage.getItem(accessTokenKey) !== mockResponse.data.tokens.accessToken) {
    throw new Error("No active session.");
  }

  const currentUser = toAuthUser(mockResponse.data.user);
  localStorage.setItem(userStorageKey, JSON.stringify(currentUser));
  return currentUser;
}

export async function logoutRequest() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
  localStorage.removeItem(userStorageKey);
}

export function storeAuthSession(user: AuthUser, tokens: AuthTokens) {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
  localStorage.setItem(userStorageKey, JSON.stringify(user));
}
