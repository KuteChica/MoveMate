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
  type AuthSession,
  type AuthUser,
} from "../services/authApi";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (session: AuthSession) => void;
    updateUser: (user: AuthUser) => void;
  signup: (name: string, email: string, password: string) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then((session) => {
        setUser(session.user);
        setToken(session.token);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((session: AuthSession) => {
    storeAuthSession(session);
    setUser(session.user);
    setToken(session.token);
  }, []);

    const updateUser = useCallback((updatedUser: AuthUser) => {
      const currentToken = localStorage.getItem("movemate-auth-token");
      if (currentToken) storeAuthSession({ user: updatedUser, token: currentToken });
      setUser(updatedUser);
    }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const session = await signupRequest(name, email, password);
    login(session);
    return session;
  }, [login]);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({
    isAuthenticated: user !== null,
    isLoading,
    user,
    token,
    login,
      updateUser,
    signup,
    logout,
  }), [isLoading, user, token, login, updateUser, signup, logout]);

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
