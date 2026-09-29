import { lazy, type ReactElement } from "react";

const About = lazy(() => import("../pages/About/About"));
const Contact = lazy(() => import("../pages/Contact/Contact"));
const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Login/Login"));
const Signup = lazy(() => import("../pages/Signup/Signup"));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Routes = lazy(() => import("../pages/Routes/Routes"));
const TrackShuttle = lazy(() => import("../pages/TrackShuttle/TrackShuttle"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const Profile = lazy(() => import("../pages/Profile/Profile"));
const Representative = lazy(() => import("../pages/Representative/Representative"));
const BusStatus = lazy(() => import("../pages/BusStatus/BusStatus"));
const DriverDashboard = lazy(() => import("../pages/DriverDashboard/DriverDashboard"));
const AIAssistant = lazy(() => import("../pages/AIAssistant/AIAssistant"));

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
  { path: "/track-shuttle", element: <TrackShuttle />, isProtected: true },
  { path: "/bus-status", element: <BusStatus />, isProtected: true },
  { path: "/driver-dashboard", element: <DriverDashboard />, isProtected: true },
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
  { path: "/ai-assistant", element: <AIAssistant />, isProtected: true },
  { path: "/routes", element: <Routes />, isProtected: true },
  { path: "/notifications", element: <Notifications />, isProtected: true },
  { path: "/profile", element: <Profile />, isProtected: true },
  { path: "/representative", element: <Representative />, isProtected: true },
];

export default routes;
