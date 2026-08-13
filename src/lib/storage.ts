import type { StoredAuth } from "@/types/auth/auth.types"

const AUTH_KEY = "absen_pro_auth"

/**
 * Encode/decode pakai btoa — bukan enkripsi, tapi obfuskasi sederhana
 * agar token tidak langsung terbaca di DevTools.
 * Untuk keamanan lebih, gunakan library seperti secure-ls atau encrypt di sisi server.
 */
function encode(value: string): string {
  return btoa(encodeURIComponent(value))
}

function decode(value: string): string {
  try {
    return decodeURIComponent(atob(value))
  } catch {
    return ""
  }
}

export const storage = {
  saveAuth(data: StoredAuth): void {
    const encoded = encode(JSON.stringify(data))
    localStorage.setItem(AUTH_KEY, encoded)
  },

  getAuth(): StoredAuth | null {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    try {
      const decoded = decode(raw)
      return JSON.parse(decoded) as StoredAuth
    } catch {
      return null
    }
  },

  getToken(): string | null {
    return this.getAuth()?.access_token ?? null
  },

  clearAuth(): void {
    localStorage.removeItem(AUTH_KEY)
  },
}
