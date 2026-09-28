import type { ReactElement } from "react";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import Dashboard from "../pages/Dashboard/Dashboard";
import Routes from "../pages/Routes/Routes";
import TrackShuttle from "../pages/TrackShuttle/TrackShuttle";
import Notifications from "../pages/Notifications/Notifications";
import Profile from "../pages/Profile/Profile";
import Representative from "../pages/Representative/Representative";
import BusStatus from "../pages/BusStatus/BusStatus";
import DriverDashboard from "../pages/DriverDashboard/DriverDashboard";
import AIAssistant from "../pages/AIAssistant/AIAssistant";

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
