export interface JabatanRow {
  id: string
  name: string
  desc: string | null
  department_id: string
  department_name: string
  is_trashed: boolean
}

export interface JabatanListResponse {
  total: number
  rows: JabatanRow[]
}

export interface CreateJabatanPayload {
  name: string
  description?: string | null
  department_id: string
}

export type UpdateJabatanPayload = CreateJabatanPayload

export interface JabatanMutationResponse {
  success: boolean
  message: string
  data?: {
    id: string
    name: string
    description: string | null
    department_id: string
  }
}
