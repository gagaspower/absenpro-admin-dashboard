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

export interface LevelApprovalMutationResponse {
  success: boolean
  message: string
  data?: LevelApprovalItem[]
}
