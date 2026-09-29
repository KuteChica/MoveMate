import { Navigate, Route, Routes } from "react-router-dom";
import AppRoute from "./components/routes/AppRoute";
import ProtectedRoute from "./components/routes/ProtectedRoute";
import AuthLayout from "./layouts/AuthLayout";
import UnauthLayout from "./layouts/UnauthLayout";
import routes from "./routes/routes";

function App() {
  const publicRoutes = routes.filter((route) => !route.isProtected);
  const protectedRoutes = routes.filter((route) => route.isProtected);

  return (
    <Routes>
      <Route element={<UnauthLayout />}>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.unauthenticatedOnly ? <AppRoute isProtected={false} unauthenticatedOnly /> : route.element}>
            {route.unauthenticatedOnly && <Route index element={route.element} />}
          </Route>
        ))}
      </Route>
      <Route element={<AuthLayout />}>
        <Route element={<ProtectedRoute />}>
          {protectedRoutes.map((route) => <Route key={route.path} path={route.path} element={route.element} />)}
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
