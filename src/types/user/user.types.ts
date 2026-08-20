export interface UserRoleItem {
  id: string
  nama_role: string
  pivot: {
    user_id: string
    role_id: string
  }
}

export interface UserRow {
  id: string
  name: string
  username: string
  email: string | null
  email_verified_at: string | null
  is_active: number | boolean
  deleted_at: string | null
  roles: UserRoleItem[]
}
