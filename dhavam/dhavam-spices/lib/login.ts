
import {
  login,
  type LoginPayload,
} from "@/app/services/authService";

export async function loginUser(payload: LoginPayload) {
  return login(payload);
}
