export type AuthUser = {
  name: string;
  email: string;
  role: "student" | "representative";
};

// DEMO DEVELOPMENT AUTH: remove this block when the real backend is connected.
const demoEmail = "me@13.com";
const demoPassword = "Bridget";
const demoAuthStorageKey = "movemate-demo-authenticated";
const demoUser: AuthUser = { name: "Bridget", email: demoEmail, role: "student" };

export async function loginRequest(email: string, password: string) {
  if (email.trim() !== demoEmail || password !== demoPassword) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem(demoAuthStorageKey, "true");
  return demoUser;
}

export async function signupRequest(name: string, email: string, password: string) {
  if (!name.trim() || !email.trim() || !password) {
    throw new Error("Complete all fields to create an account.");
  }
}

export async function getCurrentUser() {
  if (localStorage.getItem(demoAuthStorageKey) !== "true") {
    throw new Error("No active demo session.");
  }

  return demoUser;
}

export async function logoutRequest() {
  localStorage.removeItem(demoAuthStorageKey);
}

export { demoEmail, demoPassword };
