// src/services/absensi/absensi.service.ts
import { api } from "@/lib/axios"

import type {
  AbsensiCalendarEntry,
  AbsensiHistoryResponse,
  AbsensiListResponse,
  AbsensiRow,
  AttendanceStatus,
} from "@/types/absensi/absensi.types"

export interface FetchAbsensiParams {
  periode: string
  search?: string
}

/**
 * Tentukan status tampilan berdasarkan entry calendar dari backend.
 *
 * Aturan:
 * - is_weekend -> "libur" (selalu, terlepas dari ada/tidaknya record)
 * - entry.type === "attendance" -> "telat" kalau status backend "late",
 *   selain itu "hadir"
 * - entry.type === "leave" -> "sakit" kalau leave.type "sick", selain itu "izin"
 *   (TODO: sesuaikan kalau backend punya nilai leave.type lain, mis. "permit")
 * - entry null & bukan weekend & tanggal sudah lewat -> "alpha"
 * - entry null & bukan weekend & tanggal hari ini/masa depan -> "" (belum ada data)
 */
function resolveStatus(
  dateStr: string,
  isWeekend: boolean,
  entry: AbsensiCalendarEntry | null
): AttendanceStatus {
  if (isWeekend) return "libur"

  if (entry) {
    if (entry.type === "attendance") {
      return entry.status === "late" ? "telat" : "hadir"
    }
    if (entry.type === "leave") {
      return entry.leave?.type === "sick" ? "sakit" : "izin"
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)

  return target < today ? "alpha" : ""
}

export async function fetchAbsensi(
  params: FetchAbsensiParams
): Promise<AbsensiListResponse> {
  const { data } = await api.get<AbsensiHistoryResponse>(
    "api/reference/absen/history-web",
    { params: { periode: params.periode } }
  )

  let rows: AbsensiRow[] = data.rows.map((row, index) => ({
    id: row.employee.id || String(index + 1),
    employee_id: row.employee.id,
    employee_name: row.employee.name,
    days: data.dates.map((d) => {
      const entry = row.calendar[d.date] ?? null
      const status = resolveStatus(d.date, d.is_weekend, entry)

      return {
        date: d.day,
        status,
        ...(entry?.type === "attendance" && entry.attendance
          ? {
              check_in: entry.attendance.check_in_time,
              check_out: entry.attendance.check_out_time,
            }
          : {}),
      }
    }),
  }))

  // Backend hanya menerima param `periode`, jadi search difilter di FE.
  if (params.search) {
    const q = params.search.toLowerCase()
    rows = rows.filter((row) => row.employee_name.toLowerCase().includes(q))
  }

  return {
    total: rows.length,
    rows,
    days_in_month: data.periode.jumlah_hari,
  }
}
