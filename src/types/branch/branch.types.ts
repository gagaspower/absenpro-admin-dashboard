export interface BranchRow {
  id: string
  name: string
  address: string
  latitude: string
  longitude: string
  radius_meter: number
  is_trashed: boolean
}

export interface BranchListResponse {
  total: number
  rows: BranchRow[]
}

export interface CreateBranchPayload {
  name: string
  address?: string
  latitude: string
  longitude: string
  radius_meter: number
}

export type UpdateBranchPayload = CreateBranchPayload

export interface CreateBranchResponse {
  success: boolean
  message: string
  data: BranchRow
}

export type UpdateBranchResponse = CreateBranchResponse

export type BulkActionValue = "restore" | "delete" | "delete_permanent"

export interface BranchFilterState {
  showAll: boolean
  showDeleted: boolean
}
