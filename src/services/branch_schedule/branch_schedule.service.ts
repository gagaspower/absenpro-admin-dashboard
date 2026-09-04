// src/services/branch_schedule/branch_schedule.service.ts

import { api } from "@/lib/axios"
import type {
  BranchScheduleResponse,
  BranchSchedulePayload,
  BranchScheduleMutationResponse,
} from "@/types/branch_schedule/branch_schedule.types"
export type BranchScheduleStatusFilter = "all" | "active" | "trashed"

export interface FetchBranchSchedulesParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: BranchScheduleStatusFilter
  branch_id?: string
}

// ── List ─────────────────────────────────────────────────────────────────────

export async function fetchBranchSchedules(
  params: FetchBranchSchedulesParams = {}
): Promise<BranchScheduleResponse> {
  const {
    limit = 10,
    offset = 0,
    search,
    is_trash = "active",
    branch_id,
  } = params

  const { data } = await api.get<BranchScheduleResponse>(
    "api/reference/jadwal-cabang",
    {
      params: {
        limit,
        offset,
        is_trash,
        ...(search ? { search } : {}),
        ...(branch_id ? { branch_id } : {}),
      },
    }
  )

  return data
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createBranchSchedule(
  payload: BranchSchedulePayload
): Promise<BranchScheduleMutationResponse> {
  const { data } = await api.post<BranchScheduleMutationResponse>(
    "api/reference/jadwal-cabang",
    payload
  )

  return data
}

// ── Update ───────────────────────────────────────────────────────────────────

export async function updateBranchSchedule(
  id: string,
  payload: BranchSchedulePayload
): Promise<BranchScheduleMutationResponse> {
  const { data } = await api.put<BranchScheduleMutationResponse>(
    `api/reference/jadwal-cabang/${id}`,
    payload
  )

  return data
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteBranchSchedule(id: string): Promise<void> {
  await api.delete(`api/reference/jadwal-cabang/${id}`)
}

// ── Restore ──────────────────────────────────────────────────────────────────

export async function restoreBranchSchedule(id: string): Promise<void> {
  await api.post(`api/reference/jadwal-cabang/restore/${id}`)
}

// ── Force Delete ─────────────────────────────────────────────────────────────

export async function forceDeleteBranchSchedule(id: string): Promise<void> {
  await api.delete(`api/reference/jadwal-cabang/force-delete/${id}`)
}

// ── Bulk actions ─────────────────────────────────────────────────────────────

export async function restoreMultipleBranchSchedules(
  ids: string[]
): Promise<void> {
  await api.post("api/reference/jadwal-cabang/restore-multiple", { ids })
}

export async function deleteMultipleBranchSchedules(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/jadwal-cabang/multiple", {
    data: { ids },
  })
}

export async function forceDeleteMultipleBranchSchedules(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/jadwal-cabang/force-delete-multiple", {
    data: { ids },
  })
}
