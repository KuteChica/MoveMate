import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useApi from "../../hooks/useApi";

function Signup() {
  const [name, setName] = useState("");
  const [validationError, setValidationError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { loading, isError, errMessage, isSuccess, successMessage, execute } = useApi();
  const handleSubmit = async (email, password) => {
    const response = await execute(() => signup(name, email, password));
    if (!response) {
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div>
      <section className="mx-auto w-full max-w-md px-6 py-12">
        <h1 className="mb-8 text-3xl font-semibold text-slate-900">Create an account</h1>
        <form className="space-y-5" onSubmit={async (event) => { event.preventDefault(); setValidationError(""); if (event.currentTarget.password.value !== event.currentTarget.confirmPassword.value) { setValidationError("Passwords must match."); return; } await handleSubmit(event.currentTarget.email.value, event.currentTarget.password.value); }}>
          <label className="block text-sm font-medium text-slate-700">Full Name<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900" name="name" value={name} onChange={(event) => setName(event.target.value)} required /></label>
          <label className="block text-sm font-medium text-slate-700">Email<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900" name="email" type="email" required /></label>
          <label className="block text-sm font-medium text-slate-700">Password<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900" name="password" type="password" required /></label>
          <label className="block text-sm font-medium text-slate-700">Confirm Password<input className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900" name="confirmPassword" type="password" required /></label>
          {(validationError || isError) && <p className="text-sm text-red-700" role="alert">{validationError || errMessage}</p>}
          {isSuccess && <p className="text-sm text-teal-700" role="status">{successMessage}</p>}
          <button className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white hover:bg-teal-800" type="submit" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
        </form>
      </section>
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 pb-12">
        <p className="text-sm text-slate-600">Already have an account?</p>
        <Link
          className="rounded-md border border-teal-700 px-4 py-2 font-medium text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
          to="/login"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default Signup;