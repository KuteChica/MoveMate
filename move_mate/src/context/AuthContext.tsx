import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  getCurrentUser,
  logoutRequest,
  storeAuthSession,
  signupRequest,
  type AuthTokens,
  type AuthUser,
} from "../services/authApi";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (user: AuthUser, tokens: AuthTokens) => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((authenticatedUser: AuthUser, tokens: AuthTokens) => {
    storeAuthSession(authenticatedUser, tokens);
    setUser(authenticatedUser);
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      await signupRequest(name, email, password);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: user !== null,
    isLoading,
    user,
    login,
    signup,
    logout,
  }), [isLoading, user, login, signup, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside an AuthProvider");
  return context;
}

export { AuthProvider, useAuth };
