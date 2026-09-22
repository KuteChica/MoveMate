import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Form from "../../components/Form";
import useApi from "../../hooks/useApi";
import { loginRequest } from "../../services/authApi";

function Login() {
  const { login } = useAuth();
  const { loading, isError, errMessage, successMessage, execute } = useApi();
  const navigate = useNavigate();

  const handleSubmit = async (email, password) => {
    const response = await execute(() => loginRequest(email, password));
    if (!response) {
      return;
    }

    login(response);
    navigate(response.user.role === "driver" ? "/driver-dashboard" : response.user.role === "admin" || response.user.role === "representative" ? "/representative" : "/dashboard", { replace: true });
  };

  return (
    <div>
      <Form
        title="Log in"
        submitLabel="Log in"
        onSubmit={handleSubmit}
        error={isError ? errMessage : ""}
        loading={loading}
        successMessage={successMessage}
      />
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