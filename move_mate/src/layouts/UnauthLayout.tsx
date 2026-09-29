import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Wrapper from "../components/Wrapper";

function UnauthLayout() {
  return (
    <Wrapper className="unauth-layout">
      <Navbar />
      <main>
        <Suspense fallback={<div className="flex min-h-48 items-center justify-center text-sm text-slate-600">Loading page...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </Wrapper>
  );
}

export default UnauthLayout;
