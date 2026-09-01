export type AttendanceStatus =
  "hadir" | "sakit" | "izin" | "alpha" | "libur" | ""

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
  employee_code: string
  employee_name: string
  position_name: string
  department_name: string
  days: AbsensiDayRecord[]
}

export interface AbsensiListResponse {
  total: number
  rows: AbsensiRow[]
  days_in_month: number
}

export interface AbsensiFilterState {
  month: number
  year: number
  search: string
  departemenId: string
  branchId: string
}

export const DEFAULT_ABSENSI_FILTER: AbsensiFilterState = {
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  search: "",
  departemenId: "all",
  branchId: "all",
}

export const ABSENSI_STATUS_META: Record<
  Exclude<AttendanceStatus, "">,
  { label: string; short: string }
> = {
  hadir: { label: "Hadir", short: "H" },
  sakit: { label: "Sakit", short: "S" },
  izin: { label: "Izin", short: "I" },
  alpha: { label: "Alpha", short: "A" },
  libur: { label: "Libur", short: "" },
}

export const MONTH_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
]
