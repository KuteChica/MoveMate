import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Form from "../../components/Form";

function Signup() {
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (email, password) => {
    setError("");
    if (!signup(email, password)) {
      setError("Enter an email and password to continue.");
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return (
    <div>
      <Form title="Create an account" submitLabel="Create account" onSubmit={handleSubmit} error={error} />
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