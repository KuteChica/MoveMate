import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  signup: (email: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const authStorageKey = "movemate-authenticated";

function AuthProvider({ children }: PropsWithChildren) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(authStorageKey) === "true",
  );

  const authenticate = (email: string, password: string) => {
    const validCredentials = email.trim().length > 0 && password.length > 0;

    if (validCredentials) {
      localStorage.setItem(authStorageKey, "true");
      setIsAuthenticated(true);
    }

    return validCredentials;
  };

  const logout = () => {
    localStorage.removeItem(authStorageKey);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login: authenticate,
        signup: authenticate,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
