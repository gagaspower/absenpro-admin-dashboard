import { Navigate, Outlet, useLocation } from "react-router-dom"
import { storage } from "@/lib/storage"
import { hasPermission } from "@/lib/permissions"

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = storage.getAuth()
  const location = useLocation()

  if (!auth?.access_token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}

interface PermissionRouteProps {
  permission: string
  children?: React.ReactNode
}

export function PermissionRoute({
  permission,
  children,
}: PermissionRouteProps) {
  const location = useLocation()

  if (!hasPermission(permission)) {
    return <Navigate to="/dashboard" replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}

export function GuestRoute({ children }: { children?: React.ReactNode }) {
  const auth = storage.getAuth()

  if (auth?.access_token) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}
