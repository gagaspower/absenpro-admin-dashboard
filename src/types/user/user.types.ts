export interface UserRow {
  id: string
  name: string
  username: string
  email: string | null
  password: string | null
  is_active: boolean
}
