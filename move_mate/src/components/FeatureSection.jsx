const features = [
  {
    icon: "⌖",
    title: "Live Tracking",
    description: "Watch your shuttle move on the map. No more guessing if your ride is minutes away or if it is running late.",
  },
  {
    icon: "◷",
    title: "Estimated Arrival Time",
    description: "View daily routes tailored to your classes. Filter by destination and never hunt for transit tables again.",
  },
  {
    icon: "♧",
    title: "Shuttle Routes",
    description: "Get instant push notifications for delays, route changes, or when your bus is 5 minutes away.",
  },
  {
    icon: "!",
    title: "Notifications",
    description: "Stay informed about shuttle delays, service changes, and important campus updates.",
  },
];

function FeatureSection() {
  return (
    <section id="features" className="bg-white px-6 py-16 sm:px-10 lg:px-12 lg:py-20" aria-labelledby="features-title">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#007d7b]">Everything in one place</p>
          <h2 id="features-title" className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#173c41]">Built for Campus Life</h2>
          <p className="mt-4 text-sm leading-6 text-[#718789]">Everything you need to navigate the university effortlessly, designed with a focus on speed and clarity.</p>
        </div>
        <div id="how-it-works" className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="group min-h-[190px] rounded-xl border border-[#e1eceb] bg-white p-6 shadow-[0_4px_14px_rgba(23,60,65,0.05)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(23,60,65,0.1)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d9f1ed] text-lg font-bold text-[#007d7b] transition group-hover:bg-[#007d7b] group-hover:text-white">{feature.icon}</div>
              <h3 className="mt-5 text-sm font-extrabold text-[#173c41]">{feature.title}</h3>
              <p className="mt-3 text-xs leading-5 text-[#718789]">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeatureSection;
