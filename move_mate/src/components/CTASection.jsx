import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="bg-[#006568] px-4 py-12 text-center text-white sm:px-6 lg:py-20" aria-labelledby="cta-title">
      <div className="mx-auto max-w-2xl">
        <h2 id="cta-title" className="text-2xl font-black tracking-[-0.03em] sm:text-3xl">Ready to Move?</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#c5e4e1]">Join students who rely on MoveMate to keep their campus commute clear and stress-free.</p>
        <p className="mt-2 text-sm font-bold text-white">Download MoveMate today.</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173c41] transition hover:bg-[#e7f4f2]">{isAuthenticated ? "Go to Dashboard" : "Get Started"}</Link>
          <Link to="/signup" className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#173c41] transition hover:bg-[#e7f4f2]"><span className="text-base"></span> App Store</Link>
          <Link to="/signup" className="flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#173c41] transition hover:bg-[#e7f4f2]"><span className="text-base">▸</span> Google Play</Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
