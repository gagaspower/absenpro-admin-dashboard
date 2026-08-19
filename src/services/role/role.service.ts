import { api } from "@/lib/axios"
import type { RoleAllDataResponse } from "@/types/roles/roles.types"

export async function fetchRole(): Promise<RoleAllDataResponse> {
  const { data } = await api.get<RoleAllDataResponse>("api/reference/role")
  return data
}
