import { api } from "@/lib/axios"

import type {
  CreateLevelApprovalPayload,
  GetLevelApprovalQueryParams,
  LevelApprovalDetailResponse,
  LevelApprovalMutationResponse,
  LevelApprovalResponse,
  UpdateLevelApprovalPayload,
} from "@/types/level_approval/level_approval.type"

const BASE_URL = "api/reference/level-approval"

/**
 * Get level approval list.
 */
export async function getLevelApprovalList(
  params: GetLevelApprovalQueryParams = {}
): Promise<LevelApprovalResponse> {
  const { data } = await api.get<LevelApprovalResponse>(BASE_URL, {
    params,
  })

  return data
}

/**
 * Get level approval detail/group.
 *
 * GET api/reference/level-approval/{id}
 */
export async function getLevelApprovalById(
  id: string
): Promise<LevelApprovalDetailResponse> {
  const { data } = await api.get<LevelApprovalDetailResponse>(
    `${BASE_URL}/${id}`
  )

  return data
}

/**
 * Create level approval group.
 *
 * POST api/reference/level-approval
 */
export async function createLevelApproval(
  payload: CreateLevelApprovalPayload
): Promise<LevelApprovalMutationResponse> {
  const { data } = await api.post<LevelApprovalMutationResponse>(
    BASE_URL,
    payload
  )

  return data
}

/**
 * Update level approval group.
 *
 * PUT api/reference/level-approval/{id}
 */
export async function updateLevelApproval(
  id: string,
  payload: UpdateLevelApprovalPayload
): Promise<LevelApprovalMutationResponse> {
  const { data } = await api.put<LevelApprovalMutationResponse>(
    `${BASE_URL}/${id}`,
    payload
  )

  return data
}

/**
 * Delete level approval group.
 *
 * DELETE api/reference/level-approval/{id}
 */
export async function deleteLevelApproval(id: string): Promise<void> {
  await api.delete(`${BASE_URL}/${id}`)
}
