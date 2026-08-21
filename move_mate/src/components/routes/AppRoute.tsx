import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

type AppRouteProps = {
  isProtected: boolean;
  unauthenticatedOnly?: boolean;
};

function AppRoute({ isProtected, unauthenticatedOnly = false }: AppRouteProps) {
  const { isAuthenticated } = useAuth();

  if (isProtected && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (unauthenticatedOnly && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default AppRoute;
