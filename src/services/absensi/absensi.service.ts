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
 * Tentukan status izin/cuti berdasarkan `leave_type.category`.
 *
 * Backend cuma punya 2 kategori leave: "cuti" dan "izin". Kalau suatu saat
 * ada category lain (mis. "sakit") atau category yang belum dikenal FE,
 * semuanya digabung jadi badge "izin" — cuma "cuti" yang punya badge sendiri.
 */
function resolveLeaveStatus(
  leave: AbsensiCalendarEntry["leave"]
): AttendanceStatus {
  const category = leave?.leave_type?.category?.toLowerCase()
  return category === "cuti" ? "cuti" : "izin"
}

/**
 * Tentukan status tampilan berdasarkan entry calendar dari backend.
 *
 * Aturan:
 * - is_weekend -> "libur" (selalu, terlepas dari ada/tidaknya record)
 * - entry.type === "leave" -> lihat resolveLeaveStatus (berdasarkan category)
 * - entry.type === "attendance" & ada check_in/check_out -> "telat" kalau
 *   status backend "late", selain itu "hadir"
 * - entry.type === "attendance" tapi check_in & check_out kosong -> dianggap
 *   tidak ada bukti hadir, lanjut ke aturan "tidak ada data" di bawah
 * - entry null (atau attendance tanpa check_in/check_out) & bukan weekend &
 *   tanggal sudah lewat -> "alpha"
 * - entry null (atau attendance tanpa check_in/check_out) & bukan weekend &
 *   tanggal hari ini/masa depan -> "" (belum ada data)
 */
function resolveStatus(
  dateStr: string,
  isWeekend: boolean,
  entry: AbsensiCalendarEntry | null
): AttendanceStatus {
  if (isWeekend) return "libur"

  if (entry) {
    if (entry.type === "leave") {
      return resolveLeaveStatus(entry.leave)
    }

    if (entry.type === "attendance") {
      const hasCheckIn = Boolean(entry.attendance?.check_in_time)
      const hasCheckOut = Boolean(entry.attendance?.check_out_time)

      // Ada record attendance tapi tidak ada bukti masuk/pulang sama sekali
      // -> jangan langsung "hadir", turunkan ke logic alpha di bawah.
      if (hasCheckIn || hasCheckOut) {
        return entry.status === "late" ? "telat" : "hadir"
      }
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
              check_in: entry.attendance.check_in_time ?? undefined,
              check_out: entry.attendance.check_out_time ?? undefined,
            }
          : {}),
        ...(entry?.type === "leave"
          ? { leave_label: entry.label ?? entry.leave?.leave_type?.name }
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
