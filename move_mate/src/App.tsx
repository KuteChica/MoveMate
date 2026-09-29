import { Suspense } from "react";
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
    <Suspense fallback={<div className="flex min-h-48 items-center justify-center text-sm text-slate-600">Loading page...</div>}>
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
    </Suspense>
  );
}

export default App;
