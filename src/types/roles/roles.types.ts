export interface RoleOption {
  id: string
  nama_role: string
}

export interface RoleAllDataResponse {
  rows: RoleOption[]
}

export interface RolePermissionItem {
  id: string
  permission_name: string
  is_checked: boolean
}

export interface RolePermissionParent {
  id: string
  nama_parent: string | null
  is_checked: boolean
  permissions: RolePermissionItem[]
}

export interface RolePermissionMenu {
  id: string
  nama_menu: string
  permission_parents: RolePermissionParent[]
}

export interface RolePermissionDetail {
  role_id: string
  nama_role: string
  menus: RolePermissionMenu[]
}

export interface RolePermissionDetailResponse {
  success: boolean
  message: string
  data: RolePermissionDetail
}

/**
 * Payload for PUT api/reference/roles/{id}/permissions.
 * Assumption: backend accepts a flat list of the permission IDs that
 * should end up checked. Adjust if the API expects the full nested shape.
 */
export interface UpdateRolePermissionPayload {
  permission_ids: string[]
}
