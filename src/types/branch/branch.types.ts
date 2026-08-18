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

// id ditambahkan — dipakai sebagai branch_id saat filter pegawai.
// Tanpa id, hasil endpoint all-data ini gak bisa dipakai utk filter.
export interface BranchOption {
  id: string
  name: string
  address?: string
  latitude: string
  longitude: string
  radius_meter: number
}

export interface BranchAllDataResponse {
  rows: BranchOption[]
}
