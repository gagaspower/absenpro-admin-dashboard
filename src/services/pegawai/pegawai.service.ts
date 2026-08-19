import { api } from "@/lib/axios"
import type {
  CreatePegawaiPayload,
  CreatePegawaiResponse,
  PegawaiListResponse,
  PegawaiStatus,
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

/**
 * Ambil daftar pegawai dari backend.
 *
 * Paginasi pakai limit & offset. search, department_id, position_id,
 * branch_id, shift_id, status opsional — hanya dikirim kalau ada nilainya.
 * is_trash default "all" sesuai dokumentasi endpoint.
 */
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

/**
 * Create pegawai — sekalian create data user (username/password/role) di
 * satu endpoint yang sama.
 */
export async function createPegawai(
  payload: CreatePegawaiPayload
): Promise<CreatePegawaiResponse> {
  const { data } = await api.post<CreatePegawaiResponse>(
    "api/reference/pegawai",
    payload
  )
  return data
}
