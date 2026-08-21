import { Link } from "react-router-dom";

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[390px]">
      <div className="absolute -right-4 top-10 h-28 w-28 rounded-full bg-[#d9ece9] opacity-80 blur-2xl" />
      <div className="relative mx-auto w-[220px] rotate-[5deg] rounded-[30px] border-[7px] border-[#173c41] bg-[#173c41] p-2 shadow-[0_22px_45px_rgba(23,60,65,0.22)] sm:w-[240px]">
        <div className="overflow-hidden rounded-[22px] bg-[#f4faf9]">
          <div className="flex items-center justify-between bg-white px-4 pb-3 pt-4 text-[8px] font-bold text-[#173c41]">
            <span>9:41</span>
            <span className="flex gap-1"><i className="h-1 w-1 rounded-full bg-[#173c41]" /><i className="h-1 w-1 rounded-full bg-[#173c41]" /><i className="h-1 w-1 rounded-full bg-[#173c41]" /></span>
          </div>
          <div className="px-3 pb-4 pt-2">
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-[8px] text-[#759093]">Good morning</p><p className="text-[12px] font-extrabold text-[#173c41]">Find your shuttle</p></div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#cce9e4] text-[10px]">🙂</div>
            </div>
            <div className="relative h-[142px] overflow-hidden rounded-xl bg-[#dceeed]">
              <div className="absolute left-[-15%] top-1/2 h-12 w-[140%] rotate-[-22deg] border-y-[10px] border-white/90 bg-[#badbd7]" />
              <div className="absolute left-[15%] top-[-20%] h-[150%] w-8 rotate-[25deg] bg-white/70" />
              <div className="absolute left-[64%] top-[30%] h-3 w-3 rounded-full border-2 border-white bg-[#ed9d36] shadow-[0_0_0_4px_rgba(237,157,54,0.25)]" />
              <div className="absolute left-[33%] top-[52%] flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#007d7b] text-[10px] text-white shadow-md">⌖</div>
              <div className="absolute bottom-3 left-3 rounded-md bg-white/90 px-2 py-1 text-[7px] font-bold text-[#173c41] shadow-sm">Campus Loop</div>
            </div>
            <div className="mt-3 rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between"><p className="text-[9px] font-bold text-[#173c41]">Shuttle 04</p><span className="rounded-full bg-[#dff4df] px-2 py-1 text-[7px] font-bold text-[#38805d]">On time</span></div>
              <div className="mt-2 flex items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-[#d8ebe8]"><div className="h-1.5 w-2/3 rounded-full bg-[#007d7b]" /></div><span className="text-[8px] font-bold text-[#007d7b]">5 min</span></div>
            </div>
          </div>
          <div className="flex justify-around border-t border-[#e5efed] bg-white py-3 text-[8px] text-[#789092]"><span className="font-bold text-[#007d7b]">⌖<br />Explore</span><span>◷<br />Schedules</span><span>♧<br />Alerts</span></div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="overflow-hidden bg-[#f2f8f8]" aria-labelledby="hero-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-12 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#007d7b]">Campus mobility, simplified</p>
          <h1 id="hero-title" className="max-w-lg text-4xl font-black leading-[1.08] tracking-[-0.04em] text-[#173c41] sm:text-5xl">Know where your shuttle is.<br />Know when to move.</h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-[#607a7c] sm:text-base">The smart campus mobility app for students. Track buses in real-time, get smart schedule alerts, and never wait in the cold again.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-lg bg-[#007d7b] px-5 py-3 text-xs font-bold text-white shadow-[0_8px_18px_rgba(0,125,123,0.2)] transition hover:bg-[#006966]">Download Now</Link>
            <a href="#how-it-works" className="rounded-lg border border-[#007d7b] bg-white px-5 py-3 text-xs font-bold text-[#007d7b] transition hover:bg-[#e8f5f3]">How It Works</a>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end"><PhoneMockup /></div>
      </div>
    </section>
  );
}

export default Hero;
