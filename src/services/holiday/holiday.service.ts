import { api } from "@/lib/axios"

import type {
  CreateHolidayPayload,
  HolidayMutationResponse,
  HolidayListResponse,
  UpdateHolidayPayload,
} from "@/types/holiday/holiday.types"

export type HolidayStatusFilter = "all" | "active" | "trashed"

export interface FetchHolidayParams {
  limit?: number
  offset?: number
  search?: string
  periode?: string
  is_trash?: HolidayStatusFilter
}

export async function fetchHoliday(
  params: FetchHolidayParams = {}
): Promise<HolidayListResponse> {
  const {
    limit = 10,
    offset = 0,
    periode,
    search,
    is_trash = "active",
  } = params

  const { data } = await api.get<HolidayListResponse>(
    "api/reference/hari-libur",
    {
      params: {
        limit,
        offset,
        is_trash,
        ...(periode ? { periode } : {}),
        ...(search ? { search } : {}),
      },
    }
  )

  return data
}

export async function createHoliday(
  payload: CreateHolidayPayload
): Promise<HolidayMutationResponse> {
  const { data } = await api.post<HolidayMutationResponse>(
    "api/reference/hari-libur",
    payload
  )
  return data
}

export async function updateHoliday(
  id: string,
  payload: UpdateHolidayPayload
): Promise<HolidayMutationResponse> {
  const { data } = await api.put<HolidayMutationResponse>(
    `api/reference/hari-libur/${id}`,
    payload
  )
  return data
}

export async function deleteHoliday(id: string): Promise<void> {
  await api.delete(`api/reference/hari-libur/${id}`)
}

export async function restoreHoliday(id: string): Promise<void> {
  await api.post(`api/reference/hari-libur/restore/${id}`)
}

export async function forceDeleteHoliday(id: string): Promise<void> {
  await api.delete(`api/reference/hari-libur/force-delete/${id}`)
}

// ── Bulk actions ─────────────────────────────────────────────────────────────

export async function restoreMultipleHolidays(ids: string[]): Promise<void> {
  await api.post("api/reference/hari-libur/restore-multiple", { ids })
}

export async function deleteMultipleHolidays(ids: string[]): Promise<void> {
  await api.delete("api/reference/hari-libur/multiple", { data: { ids } })
}

export async function forceDeleteMultipleHolidays(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/hari-libur/force-delete-multiple", {
    data: { ids },
  })
}
