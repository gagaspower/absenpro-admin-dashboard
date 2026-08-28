import { api } from "@/lib/axios"

import type {
  CreateJenisCutiPayload,
  JenisCutiAllResponse,
  JenisCutiListResponse,
  JenisCutiMutationResponse,
  UpdateJenisCutiPayload,
} from "@/types/jenis_cuti/jenis_cuti.types"

export type JenisCutiStatusFilter = "all" | "active" | "trashed"
export type KategoriCutiFilter = "all" | "cuti" | "izin"

export interface FetchJenisCutiParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: JenisCutiStatusFilter
  is_category?: KategoriCutiFilter
}

export async function fetchJenisCuti(
  params: FetchJenisCutiParams = {}
): Promise<JenisCutiListResponse> {
  const {
    limit = 10,
    offset = 0,
    search,
    is_trash = "active",
    is_category = "all",
  } = params

  const { data } = await api.get<JenisCutiListResponse>(
    "api/reference/jenis-cuti",
    {
      params: {
        limit,
        offset,
        is_trash,
        is_category,
        ...(search ? { search } : {}),
      },
    }
  )

  return data
}

export async function fetchAllJenisCuti(): Promise<JenisCutiAllResponse> {
  const { data } = await api.get<JenisCutiAllResponse>(
    "api/reference/jenis-cuti/show"
  )

  return data
}

export async function createJenisCuti(
  payload: CreateJenisCutiPayload
): Promise<JenisCutiMutationResponse> {
  const { data } = await api.post<JenisCutiMutationResponse>(
    "api/reference/jenis-cuti",
    payload
  )

  return data
}

export async function updateJenisCuti(
  id: string,
  payload: UpdateJenisCutiPayload
): Promise<JenisCutiMutationResponse> {
  const { data } = await api.put<JenisCutiMutationResponse>(
    `api/reference/jenis-cuti/${id}`,
    payload
  )

  return data
}

export async function deleteJenisCuti(id: string): Promise<void> {
  await api.delete(`api/reference/jenis-cuti/${id}`)
}

export async function restoreJenisCuti(id: string): Promise<void> {
  await api.post(`api/reference/jenis-cuti/restore/${id}`)
}

export async function forceDeleteJenisCuti(id: string): Promise<void> {
  await api.delete(`api/reference/jenis-cuti/force-delete/${id}`)
}

export async function restoreMultipleJenisCuti(ids: string[]): Promise<void> {
  await api.post("api/reference/jenis-cuti/restore-multiple", { ids })
}

export async function deleteMultipleJenisCuti(ids: string[]): Promise<void> {
  await api.delete("api/reference/jenis-cuti/multiple", {
    data: { ids },
  })
}

export async function forceDeleteMultipleJenisCuti(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/jenis-cuti/force-delete-multiple", {
    data: { ids },
  })
}
