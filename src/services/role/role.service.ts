import { api } from "@/lib/axios"
import type {
  RoleAllDataResponse,
  RolePermissionDetailResponse,
  UpdateRolePermissionPayload,
} from "@/types/roles/roles.types"

export async function fetchRole(): Promise<RoleAllDataResponse> {
  const { data } = await api.get<RoleAllDataResponse>("api/reference/role")
  return data
}

export async function fetchRolePermissions(
  roleId: string
): Promise<RolePermissionDetailResponse> {
  const { data } = await api.get<RolePermissionDetailResponse>(
    `api/reference/roles/${roleId}/permissions`
  )
  return data
}

export async function updateRolePermissions(
  roleId: string,
  payload: UpdateRolePermissionPayload
): Promise<void> {
  await api.put(`api/reference/roles/${roleId}/permissions`, payload)
}
