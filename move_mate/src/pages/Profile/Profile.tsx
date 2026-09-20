import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/transitApi";

function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? "Student rider");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updatedUser = await updateProfile({ name });
      updateUser(updatedUser);
      setSaved(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-teal-700">Account</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Your profile</h1>
      <form className="mt-8 space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">Name<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 font-normal text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label className="block text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-normal text-slate-600" value={user?.email ?? "student@campus.edu"} readOnly /></label>
        <label className="flex items-center gap-3 text-sm text-slate-700"><input type="checkbox" defaultChecked className="h-4 w-4 accent-teal-700" /> Send shuttle alerts by email</label>
        <div className="flex flex-wrap items-center gap-4"><button className="rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800" type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>{saved && <span className="text-sm text-emerald-700">Profile updated.</span>}{error && <span className="text-sm text-red-700">{error}</span>}</div>
      </form>
      <button className="mt-6 rounded-md border border-rose-200 px-4 py-2.5 font-medium text-rose-700 hover:bg-rose-50" type="button" onClick={handleLogout}>Log out</button>
    </section>
  );
}

export default Profile;
