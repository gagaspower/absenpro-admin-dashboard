// src/services/absensi/absensi.service.ts
import { api } from "@/lib/axios"
import type { AbsensiCalendarEntry, AbsensiHistoryResponse, AbsensiListResponse, AbsensiRow, AttendanceStatus } from "@/types/absensi/absensi.types"

export interface FetchAbsensiParams { periode: string; search?: string }

function resolveLeaveStatus(leave: AbsensiCalendarEntry["leave"]): AttendanceStatus {
  return leave?.leave_type?.category?.toLowerCase() === "cuti" ? "cuti" : "izin"
}

function resolveStatus(dateStr: string, isWeekend: boolean, isHoliday: boolean, entry: AbsensiCalendarEntry | null): AttendanceStatus {
  if (isWeekend || isHoliday) return "libur"
  if (entry?.type === "leave") return resolveLeaveStatus(entry.leave)
  if (entry?.type === "attendance") {
    const hasCheckIn = Boolean(entry.attendance?.check_in_time)
    const hasCheckOut = Boolean(entry.attendance?.check_out_time)
    if (hasCheckIn || hasCheckOut) return entry.status === "late" ? "telat" : "hadir"
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return target < today ? "alpha" : ""
}

export async function fetchAbsensi(params: FetchAbsensiParams): Promise<AbsensiListResponse> {
  const { data } = await api.get<AbsensiHistoryResponse>("api/reference/absen/history-web", { params: { periode: params.periode } })
  const dates = data.dates.map((d) => ({ day: d.day, date: d.date, is_weekend: d.is_weekend, is_holiday: d.is_holiday, holiday: d.holiday }))
  let rows: AbsensiRow[] = data.rows.map((row, index) => ({
    id: row.employee.id || String(index + 1), employee_id: row.employee.id, employee_name: row.employee.name,
    days: data.dates.map((d) => {
      const entry = row.calendar[d.date] ?? null
      return {
        date: d.day, status: resolveStatus(d.date, d.is_weekend, d.is_holiday, entry), is_holiday: d.is_holiday,
        ...(d.holiday ? { holiday_label: d.holiday.name, holiday_description: d.holiday.description || undefined } : {}),
        ...(entry?.type === "attendance" && entry.attendance ? { check_in: entry.attendance.check_in_time ?? undefined, check_out: entry.attendance.check_out_time ?? undefined } : {}),
        ...(entry?.type === "leave" ? { leave_label: entry.label ?? entry.leave?.leave_type?.name } : {}),
      }
    }),
  }))
  if (params.search) { const q = params.search.toLowerCase(); rows = rows.filter((row) => row.employee_name.toLowerCase().includes(q)) }
  return { total: rows.length, rows, days_in_month: data.periode.jumlah_hari, dates }
}
