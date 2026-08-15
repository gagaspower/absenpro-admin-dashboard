import { api } from "@/lib/axios"
import type { JabatanListResponse } from "@/types/jabatan/jabatan.types"

export type JabatanStatusFilter = "all" | "active" | "trashed"

export interface FetchJabatanParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: JabatanStatusFilter
  departemen_id?: string
}

export async function fetchJabatan(
  params: FetchJabatanParams = {}
): Promise<JabatanListResponse> {
  const {
    limit = 10,
    offset = 0,
    search,
    is_trash = "active",
    departemen_id = "all",
  } = params

  const { data } = await api.get<JabatanListResponse>("api/reference/jabatan", {
    params: {
      limit,
      offset,
      is_trash,
      departemen_id,
      ...(search ? { search } : {}),
    },
  })

  return data
}

// ── Belum ada endpoint backend, stub console.log dulu ────────────────────────

export async function createJabatan(payload: unknown): Promise<void> {
  console.log("[jabatan] create belum tersedia endpoint", payload)
}

export async function updateJabatan(
  id: string,
  payload: unknown
): Promise<void> {
  console.log("[jabatan] update belum tersedia endpoint", id, payload)
}

export async function deleteJabatan(id: string): Promise<void> {
  console.log("[jabatan] delete belum tersedia endpoint", id)
}

export async function restoreJabatan(id: string): Promise<void> {
  console.log("[jabatan] restore belum tersedia endpoint", id)
}

export async function forceDeleteJabatan(id: string): Promise<void> {
  console.log("[jabatan] force-delete belum tersedia endpoint", id)
}

export async function restoreMultipleJabatans(ids: string[]): Promise<void> {
  console.log("[jabatan] restore-multiple belum tersedia endpoint", ids)
}

export async function deleteMultipleJabatans(ids: string[]): Promise<void> {
  console.log("[jabatan] delete-multiple belum tersedia endpoint", ids)
}

export async function forceDeleteMultipleJabatans(
  ids: string[]
): Promise<void> {
  console.log("[jabatan] force-delete-multiple belum tersedia endpoint", ids)
}
