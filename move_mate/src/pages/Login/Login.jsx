import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Form from "../../components/Form";

function Login() {
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    setError("");

    if (!(await login(email, password))) {
      setError("Invalid email or password.");
      return;
    }

    navigate("/", { replace: true });
  };

  return (
    <div>
      <Form title="Log in" submitLabel="Log in" onSubmit={handleSubmit} error={error} />
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-6 pb-12">
        <p className="text-sm text-slate-600">Need an account?</p>
        <Link
          className="rounded-md border border-teal-700 px-4 py-2 font-medium text-teal-700 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-300"
          to="/signup"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default Login;