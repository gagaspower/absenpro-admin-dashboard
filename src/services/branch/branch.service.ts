import { api } from "@/lib/axios"
import type {
  BranchAllDataResponse,
  BranchListResponse,
  CreateBranchPayload,
  CreateBranchResponse,
  UpdateBranchPayload,
  UpdateBranchResponse,
} from "@/types/branch/branch.types"

export type BranchStatusFilter = "all" | "active" | "trashed"

export interface FetchBranchesParams {
  limit?: number
  offset?: number
  search?: string
  is_trash?: BranchStatusFilter
}

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

export async function fetchBranchAllData(): Promise<BranchAllDataResponse> {
  const { data } = await api.get<BranchAllDataResponse>(
    "api/reference/lokasi-kerja/all-data"
  )
  return data
}

export async function createBranch(
  payload: CreateBranchPayload
): Promise<CreateBranchResponse> {
  const { data } = await api.post<CreateBranchResponse>(
    "api/reference/lokasi-kerja",
    payload
  )

  return data
}

export async function updateBranch(
  id: string,
  payload: UpdateBranchPayload
): Promise<UpdateBranchResponse> {
  const { data } = await api.put<UpdateBranchResponse>(
    `api/reference/lokasi-kerja/${id}`,
    payload
  )

  return data
}

export async function deleteBranch(id: string): Promise<void> {
  await api.delete(`api/reference/lokasi-kerja/${id}`)
}

export async function restoreBranch(id: string): Promise<void> {
  await api.post(`api/reference/lokasi-kerja/restore/${id}`)
}

export async function forceDeleteBranch(id: string): Promise<void> {
  await api.delete(`api/reference/lokasi-kerja/force-delete/${id}`)
}

// ── Bulk actions ─────────────────────────────────────────────────────────────

export async function restoreMultipleBranches(ids: string[]): Promise<void> {
  await api.post("api/reference/lokasi-kerja/restore-multiple", { ids })
}

export async function deleteMultipleBranches(ids: string[]): Promise<void> {
  await api.delete("api/reference/lokasi-kerja/multiple", { data: { ids } })
}

export async function forceDeleteMultipleBranches(
  ids: string[]
): Promise<void> {
  await api.delete("api/reference/lokasi-kerja/force-delete-multiple", {
    data: { ids },
  })
}
