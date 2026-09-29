import { Outlet } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import LocationPrompt from "../components/LocationPrompt";

function AuthLayout() {
  return (
    <Wrapper className="auth-layout">
      <Sidebar />
      <LocationPrompt />
      <main>
        <Outlet />
      </main>
    </Wrapper>
  );
}

export default AuthLayout;
