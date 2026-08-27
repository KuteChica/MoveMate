import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function CTASection() {
  const { isAuthenticated } = useAuth();
  return (
    <section className="bg-[#006568] px-6 py-16 text-center text-white sm:px-10 lg:py-20" aria-labelledby="cta-title">
      <div className="mx-auto max-w-2xl">
        <h2 id="cta-title" className="text-3xl font-black tracking-[-0.03em]">Ready to Move?</h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#c5e4e1]">Join thousands of students who have simplified their campus commute.</p>
        <p className="mt-1 text-sm font-bold text-white">Download MoveMate today.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="rounded-lg bg-white px-5 py-3 text-xs font-bold text-[#173c41] transition hover:bg-[#e7f4f2]">{isAuthenticated ? "Go to Dashboard" : "Get Started"}</Link>
          <Link to="/signup" className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-bold text-[#173c41] transition hover:bg-[#e7f4f2]"><span className="text-base"></span> App Store</Link>
          <Link to="/signup" className="flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-xs font-bold text-[#173c41] transition hover:bg-[#e7f4f2]"><span className="text-base">▸</span> Google Play</Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
