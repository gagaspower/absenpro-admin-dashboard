export type AttendanceStatus =
  "hadir" | "telat" | "sakit" | "izin" | "cuti" | "alpha" | "libur" | ""

// ---------------------------------------------------------------------------
// Bentuk response asli dari backend:
// GET api/reference/absen/history-web
// ---------------------------------------------------------------------------

export interface AbsensiPeriodeResponse {
  bulan: number
  tahun: number
  jumlah_hari: number
}

export interface AbsensiHolidayInfo {
  id: string
  name: string
  start_date: string
  end_date: string
  description: string
  is_recurring: boolean
}

export interface AbsensiDateColumn {
  date: string // "2026-09-01"
  day: number
  is_weekend: boolean
  is_holiday: boolean
  /** Detail hari libur (nama, rentang tanggal, dst). Null kalau bukan hari libur. */
  holiday: AbsensiHolidayInfo | null
}

export interface AbsensiAttendanceDetail {
  id: string
  check_in_time: string | null
  check_out_time: string | null
  late_minutes: number
}

// `category` bersifat dinamis dari backend (mis. "cuti", "izin", "sakit",
// dan kemungkinan kategori lain di kemudian hari). Nama & kode jenisnya pun
// bermacam-macam (Cuti Tahunan, Izin Terlambat, dst), jadi jangan hardcode
// daftar jenisnya di FE — cukup map berdasarkan `category`.
export interface AbsensiLeaveTypeDetail {
  id: string
  name: string
  code: string
  category: string
  unit: string
  is_paid: boolean
  deduct_quota: boolean
}

export interface AbsensiLeaveDetail {
  id: string
  request_number: string
  start_date: string
  end_date: string
  status: string
  reason: string
  leave_type: AbsensiLeaveTypeDetail
}

export interface AbsensiCalendarEntry {
  type: "attendance" | "leave"
  status: string
  /** Nama jenis izin/cuti, mis. "Cuti Tahunan" (hanya ada saat type "leave") */
  label?: string
  /** Kode jenis izin/cuti, mis. "SMS/CT" (hanya ada saat type "leave") */
  code?: string
  attendance: AbsensiAttendanceDetail | null
  leave: AbsensiLeaveDetail | null
}

export type AbsensiCalendar = Record<string, AbsensiCalendarEntry | null>

export interface AbsensiEmployeeResponse {
  id: string
  name: string
}

export interface AbsensiRowResponse {
  employee: AbsensiEmployeeResponse
  calendar: AbsensiCalendar
}

export interface AbsensiHistoryResponse {
  periode: AbsensiPeriodeResponse
  dates: AbsensiDateColumn[]
  rows: AbsensiRowResponse[]
}

// ---------------------------------------------------------------------------
// Model hasil transform, dipakai oleh komponen (Table, StatusCell, dst)
// ---------------------------------------------------------------------------

export interface AbsensiDayRecord {
  /** Tanggal (1-31) */
  date: number
  status: AttendanceStatus
  check_in?: string
  check_out?: string
  /** Nama jenis izin/cuti (mis. "Cuti Tahunan"), untuk tooltip badge */
  leave_label?: string
  /** Nama hari libur (mis. "Cuti Bersama Maulid Nabi"), untuk tooltip saat status "libur" */
  holiday_label?: string
}

export interface AbsensiRow {
  id: string
  employee_id: string
  employee_name: string
  days: AbsensiDayRecord[]
}

export interface AbsensiListResponse {
  total: number
  rows: AbsensiRow[]
  days_in_month: number
}

export const ABSENSI_STATUS_META: Record<
  Exclude<AttendanceStatus, "">,
  { label: string; short: string }
> = {
  hadir: { label: "Hadir", short: "H" },
  telat: { label: "Telat", short: "T" },
  sakit: { label: "Sakit", short: "S" },
  izin: { label: "Izin", short: "I" },
  cuti: { label: "Cuti", short: "C" },
  alpha: { label: "Alpha", short: "A" },
  libur: { label: "Libur", short: "" },
}

export function parsePeriodeValue(value: string): {
  month: number
  year: number
} {
  const [monthStr, yearStr] = value.split("-").map((s) => s.trim())
  const month = Number(monthStr)
  const year = Number(yearStr)

  const now = new Date()
  return {
    month: Number.isFinite(month) && month > 0 ? month : now.getMonth() + 1,
    year: Number.isFinite(year) && year > 0 ? year : now.getFullYear(),
  }
}
