import { useState } from "react";

function PasswordField({
  label,
  id,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  inputClassName = "",
  labelClassName = "",
  wrapperClassName = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={wrapperClassName}>
      {label && (
        <label className={`mb-2 block text-sm font-medium text-slate-700 ${labelClassName}`} htmlFor={id}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`w-full rounded-md border border-slate-300 px-3 py-2 pr-12 text-slate-900 outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-100 ${inputClassName}`}
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-slate-600 transition hover:text-slate-900"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
