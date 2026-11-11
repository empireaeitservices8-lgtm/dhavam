import {
  register,
  login,
  type RegisterPayload,
} from "@/app/services/authService";

export async function registerUser(payload: RegisterPayload) {
  const result = await register(payload);

  try {
    const loginData = await login({
      email: payload.email,
      password: payload.password,
    });

    if (typeof window !== "undefined") {
      sessionStorage.setItem("token", loginData.token);
      sessionStorage.setItem(
        "username",
        loginData.user?.username ?? payload.username
      );
      sessionStorage.setItem(
        "role",
        loginData.user?.role ?? "user"
      );
      window.dispatchEvent(new Event("authChanged"));
    }
  } catch (error) {
    console.warn("Auto-login after registration could not complete:", error);
  }

  return result;
}
