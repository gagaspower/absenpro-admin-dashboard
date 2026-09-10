import { useEffect, useMemo, useState } from "react"
import { storage } from "@/lib/storage"
import { PERMISSIONS_CHANGED_EVENT } from "@/lib/permissions"

export function useAuth() {
  const [authVersion, setAuthVersion] = useState(0)

  useEffect(() => {
    const handlePermissionsChanged = () => {
      setAuthVersion((prev) => prev + 1)
    }

    window.addEventListener(PERMISSIONS_CHANGED_EVENT, handlePermissionsChanged)

    return () => {
      window.removeEventListener(
        PERMISSIONS_CHANGED_EVENT,
        handlePermissionsChanged
      )
    }
  }, [])

  const auth = storage.getAuth()

  const permissions = useMemo<string[]>(
    () => auth?.permissions ?? [],
    // authVersion sengaja digunakan agar membaca ulang storage
    [auth?.permissions, authVersion]
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
