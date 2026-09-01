export type AttendanceStatus =
  "hadir" | "telat" | "sakit" | "izin" | "alpha" | "libur" | ""

// ---------------------------------------------------------------------------
// Bentuk response asli dari backend:
// GET api/reference/absen/history-web
// ---------------------------------------------------------------------------

export interface AbsensiPeriodeResponse {
  bulan: number
  tahun: number
  jumlah_hari: number
}

export interface AbsensiDateColumn {
  date: string // "2026-09-01"
  day: number
  is_weekend: boolean
}

export interface AbsensiAttendanceDetail {
  id: string
  check_in_time: string
  check_out_time: string
  late_minutes: number
}

// Detail leave belum diketahui pasti bentuknya dari contoh JSON (selalu null
// di sample). Longgarkan dulu, sesuaikan field-nya begitu backend kirim
// contoh nyata (mis. leave.type: "sick" | "permit").
export interface AbsensiLeaveDetail {
  id?: string
  type?: string
  [key: string]: unknown
}

export interface AbsensiCalendarEntry {
  type: "attendance" | "leave"
  status: string
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
