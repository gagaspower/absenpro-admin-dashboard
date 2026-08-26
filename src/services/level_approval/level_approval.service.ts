import { api } from "@/lib/axios"
import type {
  GetLevelApprovalQueryParams,
  LevelApprovalResponse,
} from "@/types/level_approval/level_approval.type"

/**
 * GET /api/reference/level-approval
 * department_id & leave_type_id hanya dikirim jika terisi.
 */
export async function getLevelApprovalList(
  params: GetLevelApprovalQueryParams = {}
): Promise<LevelApprovalResponse> {
  const { limit, offset, department_id, leave_type_id } = params

  const query: Record<string, string | number> = {}
  if (limit !== undefined) query.limit = limit
  if (offset !== undefined) query.offset = offset
  if (department_id) query.department_id = department_id
  if (leave_type_id) query.leave_type_id = leave_type_id

  const { data } = await api.get<LevelApprovalResponse>(
    "/api/reference/level-approval",
    { params: query }
  )

  return data
}
