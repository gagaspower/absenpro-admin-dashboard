import { api } from "@/lib/axios"
import {
  FILTER_ALL_STATUS,
  FILTER_ALL_DEPARTEMEN,
  type LeaveRequestStatus,
  type PermohonanCutiListResponse,
} from "@/types/permohonan_cuti/permohonan_cuti.types"

export interface FetchPermohonanCutiParams {
  limit?: number
  offset?: number
  search?: string
  periode?: string
  status?: LeaveRequestStatus | typeof FILTER_ALL_STATUS
  departemen_id?: string
}

export async function fetchPermohonanCuti(
  params: FetchPermohonanCutiParams = {}
): Promise<PermohonanCutiListResponse> {
  const {
    limit = 10,
    offset = 0,
    search,
    periode,
    status,
    departemen_id,
  } = params

  const { data } = await api.get<PermohonanCutiListResponse>(
    "api/reference/permohonan/cuti",
    {
      params: {
        limit,
        offset,

        ...(search ? { search } : {}),

        // Default periode bulan/tahun berjalan tetap dikirim.
        ...(periode ? { periode } : {}),

        // Semua Status = jangan kirim parameter status.
        ...(status && status !== FILTER_ALL_STATUS ? { status } : {}),

        // Semua Departemen = jangan kirim parameter departemen_id.
        ...(departemen_id && departemen_id !== FILTER_ALL_DEPARTEMEN
          ? { departemen_id }
          : {}),
      },
    }
  )

  console.log("Data permohonan : ", data)

  return data
}
