import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

/** Hanya bisa diakses jika sudah login. Jika belum, redirect ke /login */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

/** Hanya bisa diakses jika belum login (guest). Jika sudah login, redirect ke /dashboard */
export function GuestRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}