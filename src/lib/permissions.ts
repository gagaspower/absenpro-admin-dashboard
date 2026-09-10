import { storage } from "@/lib/storage"

export function getPermissions(): string[] {
  return storage.getAuth()?.permissions ?? []
}

export function hasPermission(permission: string): boolean {
  return getPermissions().includes(permission)
}

export function hasAnyPermission(permissions: string[]): boolean {
  const userPermissions = getPermissions()

  return permissions.some((permission) => userPermissions.includes(permission))
}

export function hasAllPermissions(permissions: string[]): boolean {
  const userPermissions = getPermissions()

  return permissions.every((permission) => userPermissions.includes(permission))
}
