import { api } from "@/lib/axios"
import type { BranchListResponse } from "@/types/branch/branch.types"

export type BranchStatusFilter = "all" | "active" | "trashed"

export interface FetchBranchesParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: BranchStatusFilter
}

/**
 * Ambil daftar branch / lokasi kerja dari backend.
 *
 * Paginasi pakai limit & offset (bukan page), sort & order sengaja
 * tidak dikirim dari FE — biarkan backend yang menentukan default-nya.
 *
 * is_trash sekarang berupa pilihan "all" | "active" | "trashed",
 * bukan boolean lagi.
 */
export async function fetchBranches(
  params: FetchBranchesParams = {}
): Promise<BranchListResponse> {
  const { limit = 10, offset = 0, search, is_trash = "active" } = params

  const { data } = await api.get<BranchListResponse>(
    "api/reference/lokasi-kerja",
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
