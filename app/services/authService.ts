const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).trim().replace(/\/+$/, "");

export type RegisterPayload = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const url = `${API_URL}/api/register`;
  const response = await fetch(url, {
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
  const url = `${API_URL}/api/login`;
  const response = await fetch(url, {
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
