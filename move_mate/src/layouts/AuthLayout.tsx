import { Suspense } from "react";
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
        <Suspense fallback={<div className="flex min-h-48 items-center justify-center text-sm text-slate-600">Loading page...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </Wrapper>
  );
}

export default AuthLayout;
