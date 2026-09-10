import { useMemo } from "react"
import { storage } from "@/lib/storage"

export function useAuth() {
  const auth = storage.getAuth()

  const permissions = useMemo<string[]>(
    () => auth?.permissions ?? [],
    [auth?.permissions]
  )

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
  }

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((permission) =>
      permissions.includes(permission)
    )
  }

  return {
    isAuthenticated: !!auth?.access_token,
    user: auth?.user ?? null,
    permissions,

    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
  }
}
