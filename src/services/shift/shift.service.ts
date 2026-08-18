import { api } from "@/lib/axios"

import type {
  CreateShiftPayload,
  CreateShiftResponse,
  ShiftAllDataResponse,
  ShiftListResponse,
  UpdateShifthPayload,
  UpdateShiftResponse,
} from "@/types/shift/shift.types"

export type ShiftStatusFilter = "all" | "active" | "trashed"

export interface FetchShiftParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: ShiftStatusFilter
}

/**
 * Ambil shift / jadwal kerja dari backend.
 * Paginasi limit & offset. is_trash: all | active | trashed.
 */
export async function fetchShift(
  params: FetchShiftParams = {}
): Promise<ShiftListResponse> {
  const { limit = 10, offset = 0, search, is_trash = "active" } = params

  const { data } = await api.get<ShiftListResponse>(
    "api/reference/jadwal-kerja",
    {
      params: {
        limit,
        offset,
        is_trash,
        ...(search ? { search } : {}),
      },
    }
  )

  return data
}

export async function fetchAllShift(): Promise<ShiftAllDataResponse> {
  // FIX: sebelumnya manggil endpoint lokasi-kerja (branch), salah service.
  const { data } = await api.get<ShiftAllDataResponse>(
    `api/reference/jadwal-kerja/all-data`
  )
  return data
}

export async function createShift(
  payload: CreateShiftPayload
): Promise<CreateShiftResponse> {
  const { data } = await api.post<CreateShiftResponse>(
    "api/reference/jadwal-kerja",
    payload
  )

  return data
}

export async function updateShift(
  id: string,
  payload: UpdateShifthPayload
): Promise<UpdateShiftResponse> {
  const { data } = await api.put<UpdateShiftResponse>(
    `api/reference/jadwal-kerja/${id}`,
    payload
  )

  return data
}

export async function deleteShift(id: string): Promise<void> {
  await api.delete(`api/reference/jadwal-kerja/${id}`)
}

export async function restoreShift(id: string): Promise<void> {
  await api.post(`api/reference/jadwal-kerja/restore/${id}`)
}

export async function forceDeleteShift(id: string): Promise<void> {
  await api.delete(`api/reference/jadwal-kerja/force-delete/${id}`)
}

// ── Bulk actions (belum difungsikan di FE, menyusul) ──────────────────────

export async function restoreMultipleShift(ids: string[]): Promise<void> {
  await api.post("api/reference/jadwal-kerja/restore-multiple", { ids })
}

export async function deleteMultipleShift(ids: string[]): Promise<void> {
  await api.delete("api/reference/jadwal-kerja/multiple", { data: { ids } })
}

export async function forceDeleteMultipleShift(ids: string[]): Promise<void> {
  await api.delete("api/reference/jadwal-kerja/force-delete-multiple", {
    data: { ids },
  })
}
