import { api } from "@/lib/axios"
import type {
  CreatePegawaiPayload,
  CreatePegawaiResponse,
  PegawaiListResponse,
  PegawaiStatus,
  UpdatePegawaiPayload,
  UpdatePegawaiResponse,
} from "@/types/pegawai/pegawai.types"

export type PegawaiStatusFilter = "all" | "active" | "trashed"

export interface FetchPegawaiParams {
  limit?: number
  offset?: number
  search?: string
  department_id?: string
  position_id?: string
  branch_id?: string
  shift_id?: string
  status?: PegawaiStatus
  is_trash?: PegawaiStatusFilter
}

export async function fetchPegawai(
  params: FetchPegawaiParams = {}
): Promise<PegawaiListResponse> {
  const {
    limit = 10,
    offset = 0,
    search,
    department_id,
    position_id,
    branch_id,
    shift_id,
    status,
    is_trash = "all",
  } = params

  const { data } = await api.get<PegawaiListResponse>("api/reference/pegawai", {
    params: {
      limit,
      offset,
      is_trash,
      ...(search ? { search } : {}),
      ...(department_id ? { department_id } : {}),
      ...(position_id ? { position_id } : {}),
      ...(branch_id ? { branch_id } : {}),
      ...(shift_id ? { shift_id } : {}),
      ...(status ? { status } : {}),
    },
  })

  return data
}

export async function createPegawai(
  payload: CreatePegawaiPayload
): Promise<CreatePegawaiResponse> {
  const { data } = await api.post<CreatePegawaiResponse>(
    "api/reference/pegawai",
    payload
  )
  return data
}

export async function updatePegawai(
  id: string,
  payload: UpdatePegawaiPayload
): Promise<UpdatePegawaiResponse> {
  const { data } = await api.put<UpdatePegawaiResponse>(
    `api/reference/pegawai/${id}`,
    payload
  )

  return data
}

export async function deletePegawai(id: string): Promise<void> {
  await api.delete(`api/reference/pegawai/${id}`)
}

export async function restorePegawai(id: string): Promise<void> {
  await api.post(`api/reference/pegawai/restore/${id}`)
}

export async function forceDeletePegawai(id: string): Promise<void> {
  await api.delete(`api/reference/pegawai/force-delete/${id}`)
}

export async function restoreMultiplePegawai(ids: string[]): Promise<void> {
  await api.post("api/reference/pegawai/restore-multiple", { ids })
}

export async function deleteMultiplePegawai(ids: string[]): Promise<void> {
  await api.delete("api/reference/pegawai/multiple", { data: { ids } })
}

export async function forceDeleteMultiplePegawai(ids: string[]): Promise<void> {
  await api.delete("api/reference/pegawai/force-delete-multiple", {
    data: { ids },
  })
}
