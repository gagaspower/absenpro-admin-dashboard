import { api } from "@/lib/axios"
import type {
  CreateJabatanPayload,
  JabatanAllDataResponse,
  JabatanListResponse,
  JabatanMutationResponse,
  UpdateJabatanPayload,
} from "@/types/jabatan/jabatan.types"

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

export async function fetchAllJabatan(
  id: string
): Promise<JabatanAllDataResponse> {
  const { data } = await api.get<JabatanAllDataResponse>(
    `api/reference/jabatan/search-departemen/${id}`
  )
  return data
}

export async function createJabatan(
  payload: CreateJabatanPayload
): Promise<JabatanMutationResponse> {
  const { data } = await api.post<JabatanMutationResponse>(
    "api/reference/jabatan",
    payload
  )
  return data
}

export async function updateJabatan(
  id: string,
  payload: UpdateJabatanPayload
): Promise<JabatanMutationResponse> {
  const { data } = await api.put<JabatanMutationResponse>(
    `api/reference/jabatan/${id}`,
    payload
  )
  return data
}

export async function deleteJabatan(id: string): Promise<void> {
  await api.delete(`api/reference/jabatan/${id}`)
}

export async function restoreJabatan(id: string): Promise<void> {
  await api.post(`api/reference/jabatan/restore/${id}`)
}

export async function forceDeleteJabatan(id: string): Promise<void> {
  await api.delete(`api/reference/jabatan/force-delete/${id}`)
}

export async function restoreMultipleJabatans(ids: string[]): Promise<void> {
  await api.post("api/reference/jabatan/restore-multiple", { ids })
}

export async function deleteMultipleJabatans(ids: string[]): Promise<void> {
  await api.delete("api/reference/jabatan/multiple", { data: { ids } })
}

export async function forceDeleteMultipleJabatans(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/jabatan/force-delete-multiple", {
    data: { ids },
  })
}
