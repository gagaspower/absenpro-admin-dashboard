// ─────────────────────────────────────────────────────────────────────────
// Status permohonan (hardcode sesuai spesifikasi, backend tidak punya
// endpoint master data untuk ini)
// ─────────────────────────────────────────────────────────────────────────

export const FILTER_ALL_STATUS = "all" as const
export const FILTER_ALL_DEPARTEMEN = "all" as const

export type LeaveRequestStatus =
  "draft" | "pending" | "approve" | "rejected" | "cancelled"

export interface LeaveRequestStatusOption {
  value: LeaveRequestStatus
  label: string
}

export const LEAVE_REQUEST_STATUS_OPTIONS: LeaveRequestStatusOption[] = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Menunggu Persetujuan" },
  { value: "approve", label: "Disetujui" },
  { value: "rejected", label: "Ditolak" },
  { value: "cancelled", label: "Dibatalkan" },
]

export function getLeaveRequestStatusLabel(status: string): string {
  return (
    LEAVE_REQUEST_STATUS_OPTIONS.find((option) => option.value === status)
      ?.label ?? status
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Nested shapes (mengikuti persis response `show()` di LeaveRequestController)
// ─────────────────────────────────────────────────────────────────────────

export interface LeaveRequestLeaveType {
  id: string
  name: string
  code: string
  category: string
  unit: string
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
}

export interface LeaveRequestDepartemen {
  id: string
  name: string
}

export interface LeaveRequestEmployee {
  id: string
  employee_code: string
  full_name: string
  /**
   * Sudah dikirim backend (update terbaru). Tetap dibuat optional/nullable
   * untuk jaga-jaga kalau ada pegawai yang belum di-assign ke departemen
   * manapun — UI akan menampilkan "-" untuk kasus itu.
   */
  department?: LeaveRequestDepartemen | null
}

export interface LeaveRequestActor {
  id: string
  name: string
  username?: string
}

export interface LeaveRequestRole {
  id: string
  nama_role: string
}

export interface LeaveRequestApproval {
  id: string
  urutan: number
  status: string
  note: string | null
  acted_at: string | null
  role: LeaveRequestRole | null
  approver: LeaveRequestActor | null
}

export type LeaveRequestTimelineStatus =
  "completed" | "current" | "pending" | "rejected"

export interface LeaveRequestTimelineItem {
  type: "submitted" | "approval"
  status: LeaveRequestTimelineStatus
  level?: number
  role?: LeaveRequestRole | null
  approver?: LeaveRequestActor | null
  title: string
  description: string
  note?: string | null
  actor?: { id: string; name: string } | null
  acted_at: string | null
}

export interface LeaveRequestAttachment {
  id: string
  file_name: string
  file_path: string
  file_type: string
  created_at: string
}

export interface LeaveRequestLog {
  id: string
  action: string
  note: string | null
  created_at: string
  actor: { id: string; name: string } | null
}

// ─────────────────────────────────────────────────────────────────────────
// Row & response
// ─────────────────────────────────────────────────────────────────────────

export interface PermohonanCutiRow {
  id: string
  request_number: string
  leave_type: LeaveRequestLeaveType | null
  employee: LeaveRequestEmployee | null
  start_date: string
  end_date: string
  total_days: string
  reason: string
  address_during_leave: string | null
  phone_during_leave: string | null
  status: LeaveRequestStatus
  applied_at: string | null
  decided_at: string | null
  rejected_reason: string | null
  current_approver: LeaveRequestActor | null
  approvals: LeaveRequestApproval[]
  timeline: LeaveRequestTimelineItem[]
  attachments: LeaveRequestAttachment[]
  logs: LeaveRequestLog[]
  created_at: string
  updated_at: string
}

export interface PermohonanCutiListResponse {
  success: boolean
  total: number
  rows: PermohonanCutiRow[]
}
