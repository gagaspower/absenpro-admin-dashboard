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
