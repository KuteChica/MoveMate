import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Wrapper from "../components/Wrapper";

function UnauthLayout() {
  return (
    <Wrapper className="unauth-layout">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </Wrapper>
  );
}

export default UnauthLayout;
