export interface DepartemenRow {
  id: string
  name: string
  desc: string | null
  is_trashed: boolean
}

export interface DepartemenListResponse {
  total: number
  rows: DepartemenRow[]
}

export interface CreateDepartemenPayload {
  name: string
  description?: string
}

export type UpdateDepartemenPayload = CreateDepartemenPayload

export interface DepartemenMutationResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    description: string | null
  }
}

// Untuk filter departemen (dari endpoint departemen/all-data)
export interface DepartemenOption {
  id: string
  name: string
  description: string | null
  deleted_at: string | null
}

export interface DepartemenAllDataResponse {
  rows: DepartemenOption[]
}
