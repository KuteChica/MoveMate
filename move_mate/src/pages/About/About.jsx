function About() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Our mission</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Campus travel, made clearer.</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">What Move Mate is</h2><p className="mt-3 text-sm leading-6 text-slate-600">Move Mate is a campus shuttle tracking system that brings locations, routes, ETAs, and service updates into one simple place.</p></article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">The problem</h2><p className="mt-3 text-sm leading-6 text-slate-600">Students should not have to guess when a shuttle will arrive or walk to a stop only to find a changed schedule.</p></article>
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-slate-900">Our purpose</h2><p className="mt-3 text-sm leading-6 text-slate-600">We make campus movement more predictable for students and easier to coordinate for school transport teams.</p></article>
      </div>
    </section>
  );
}

export default About;