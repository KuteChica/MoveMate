import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "Student rider");
  const [saved, setSaved] = useState(false);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Account</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Your profile</h1>
      <form className="mt-8 space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
        <label className="block text-sm font-medium text-slate-700">Name<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-normal text-slate-600" value={user?.email ?? "student@campus.edu"} readOnly /></label>
        <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked className="h-4 w-4 accent-teal-700" /> Send shuttle alerts by email</label>
        <div className="flex flex-wrap items-center gap-4"><button className="rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800" type="submit">Save changes</button>{saved && <span className="text-sm text-emerald-700">Profile updated.</span>}</div>
      </form>
      <button className="mt-6 rounded-md border border-rose-200 px-4 py-2.5 font-medium text-rose-700 hover:bg-rose-50" type="button" onClick={logout}>Log out</button>
    </section>
  );
}

export default Profile;
