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
