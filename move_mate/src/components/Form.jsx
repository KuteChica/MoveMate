import { useState } from "react";

function Form({
  title,
  submitLabel,
  onSubmit,
  error = "",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(email, password);
  };

  return (
    <section className="mx-auto w-full max-w-md px-6 py-12">
      <h1 className="mb-8 text-3xl font-semibold text-slate-900">{title}</h1>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
            id="password"
            name="password"
            type="password"
            autoComplete={title.toLowerCase().includes("create") ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        <button
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300"
          type="submit"
        >
          {submitLabel}
        </button>
      </form>
    </section>
  );
}

export default Form;