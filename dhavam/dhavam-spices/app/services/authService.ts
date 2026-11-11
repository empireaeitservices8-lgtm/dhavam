const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).trim().replace(/\/+$/, "");

export type RegisterPayload = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        (typeof data === "string" ? data : "Registration failed")
    );
  }

  return data;
}

export type LoginPayload = {
  email?: string;
  username?: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || data?.error || "Login failed."
    );
  }

  if (!data?.token) {
    throw new Error("Login succeeded, but no token was returned.");
  }

  sessionStorage.setItem("token", data.token);

  if (data.user) {
    sessionStorage.setItem("user", JSON.stringify(data.user));
    if (data.user.username) {
      sessionStorage.setItem("username", data.user.username);
    }
    if (data.user.role) {
      sessionStorage.setItem("role", data.user.role);
    }
  }

  return data;
}
