import { storage } from "@/lib/storage"

export function useAuth() {
  const auth = storage.getAuth()

  return {
    isAuthenticated: !!auth?.access_token,
    user: auth?.user ?? null,
    permissions: auth?.permissions ?? [],
  }
}
