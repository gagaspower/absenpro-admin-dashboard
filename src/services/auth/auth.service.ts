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

export async function logoutRequest(): Promise<{
  status: boolean
  message?: string
}> {
  const { data } = await api.post<{ status: boolean; message?: string }>(
    "api/reference/auth/revoke-session"
  )
  return data
}
