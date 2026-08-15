import { api } from "@/lib/axios"
import type {
  CreateDepartemenPayload,
  DepartemenListResponse,
  DepartemenMutationResponse,
  UpdateDepartemenPayload,
} from "@/types/departemen/departemen.types"

export interface FetchDepartemenParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: boolean
}

export async function fetchDepartemen(
  params: FetchDepartemenParams = {}
): Promise<DepartemenListResponse> {
  const { limit = 10, offset = 0, search, is_trash = false } = params

  const { data } = await api.get<DepartemenListResponse>(
    "api/reference/departemen",
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

export async function createDepartemen(
  payload: CreateDepartemenPayload
): Promise<DepartemenMutationResponse> {
  const { data } = await api.post<DepartemenMutationResponse>(
    "api/reference/departemen",
    payload
  )
  return data
}

export async function updateDepartemen(
  id: string,
  payload: UpdateDepartemenPayload
): Promise<DepartemenMutationResponse> {
  const { data } = await api.put<DepartemenMutationResponse>(
    `api/reference/departemen/${id}`,
    payload
  )
  return data
}

export async function deleteDepartemen(id: string): Promise<void> {
  await api.delete(`api/reference/departemen/${id}`)
}

export async function restoreDepartemen(id: string): Promise<void> {
  await api.post(`api/reference/departemen/restore/${id}`)
}

export async function forceDeleteDepartemen(id: string): Promise<void> {
  await api.delete(`api/reference/departemen/force-delete/${id}`)
}
