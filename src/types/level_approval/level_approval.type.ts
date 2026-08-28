export interface LevelApprovalItem {
  id: string
  leave_type_id: string
  nama_leave_type: string
  department_id: string
  nama_department: string
}

export interface GetLevelApprovalQueryParams {
  limit?: number
  offset?: number
  department_id?: string
  leave_type_id?: string
}

export interface LevelApprovalResponse {
  total: number
  rows: LevelApprovalItem[]
}

// ── Detail ───────────────────────────────────────────────────────────────

export interface LevelApprovalLevel {
  id: string
  role_id: string
  nama_role: string | null
  urutan: number
  nama_urutan: string
}

export interface LevelApprovalDetail {
  id: string
  leave_type_id: string
  nama_leave_type: string | null
  department_id: string
  nama_department: string | null
  levels: LevelApprovalLevel[]
}

export interface LevelApprovalDetailResponse {
  success: boolean
  data: LevelApprovalDetail
}

// ── Create ────────────────────────────────────────────────────────────────

/**
 * `id` di-generate di client (ULID) sebelum submit — bukan hasil dari server.
 * Urutan array `levels` = urutan approval (index 0 → urutan 1, dst).
 */
export interface CreateLevelApprovalLevelPayload {
  role_id: string
}

export interface CreateLevelApprovalPayload {
  leave_type_id: string
  department_id: string
  levels: CreateLevelApprovalLevelPayload[]
}

// ── Update ────────────────────────────────────────────────────────────────

/**
 * Payload update menggunakan struktur group yang sama dengan create.
 *
 * Urutan array `levels` menentukan urutan approval:
 * index 0 → urutan 1
 * index 1 → urutan 2
 * dst.
 */
export interface UpdateLevelApprovalLevelPayload {
  role_id: string
}

export interface UpdateLevelApprovalPayload {
  leave_type_id: string
  department_id: string
  levels: UpdateLevelApprovalLevelPayload[]
}

// ── Mutation Response ────────────────────────────────────────────────────

export interface LevelApprovalMutationResponse {
  success: boolean
  message: string
  data?: LevelApprovalDetail
}

export interface LevelApprovalFilterState {
  departmentId: string
  leaveTypeId: string
}

export const DEFAULT_LEVEL_APPROVAL_FILTER: LevelApprovalFilterState = {
  departmentId: "all",
  leaveTypeId: "all",
}
