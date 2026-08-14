import { api } from "@/lib/axios"
import type { DepartemenListResponse } from "@/types/departemen/departemen.types"

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
