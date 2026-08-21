import type { ReactElement } from "react";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";

export type AppRouteDefinition = {
  path: string;
  element: ReactElement;
  isProtected: boolean;
  unauthenticatedOnly?: boolean;
};

const routes: AppRouteDefinition[] = [
  { path: "/", element: <Home />, isProtected: false },
  { path: "/about", element: <About />, isProtected: false },
  { path: "/contact", element: <Contact />, isProtected: false },
  {
    path: "/login",
    element: <Login />,
    isProtected: false,
    unauthenticatedOnly: true,
  },
  {
    path: "/signup",
    element: <Signup />,
    isProtected: false,
    unauthenticatedOnly: true,
  },
  { path: "/dashboard", element: <Dashboard />, isProtected: true },
];

export default routes;
