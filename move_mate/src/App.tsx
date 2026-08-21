import { Route, Routes } from "react-router-dom";
import AppRoute from "./components/routes/AppRoute";
import AuthLayout from "./layouts/AuthLayout";
import UnauthLayout from "./layouts/UnauthLayout";
import routes from "./routes/routes";

function App() {
  const publicRoutes = routes.filter((route) => !route.isProtected);
  const protectedRoutes = routes.filter((route) => route.isProtected);

  return (
    <Routes>
      <Route element={<UnauthLayout />}>
        <Route element={<AppRoute isProtected={false} />}>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <AppRoute
                  isProtected={route.isProtected}
                  unauthenticatedOnly={route.unauthenticatedOnly}
                />
              }
            >
              <Route index element={route.element} />
            </Route>
          ))}
        </Route>
      </Route>
      <Route element={<AuthLayout />}>
        {protectedRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<AppRoute isProtected={route.isProtected} />}
          >
            <Route index element={route.element} />
          </Route>
        ))}
      </Route>
      <Route path="*" element={<AppRoute isProtected={false} />} />
    </Routes>
  );
}

export default App;
