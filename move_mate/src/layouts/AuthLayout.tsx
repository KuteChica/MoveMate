import { Outlet } from "react-router-dom";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";

function AuthLayout() {
  return (
    <Wrapper className="auth-layout">
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </Wrapper>
  );
}

export default AuthLayout;
