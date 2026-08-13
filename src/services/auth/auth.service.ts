import { api } from "@/lib/axios"
import type { LoginCredentials, LoginResponse } from "@/types/auth/auth.types"

export async function loginRequest(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(
    "api/reference/auth/create-session",
    credentials
  )
  return data
}
