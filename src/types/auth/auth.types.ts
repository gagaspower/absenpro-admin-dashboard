export interface RolePermission {
  id: string
  permission_name: string
  permission_parents_id: string | null
  pivot: {
    role_id: string
    permission_id: string
  }
}

export interface RolePivot {
  model_type: string
  model_id: string
  role_id: string
}

export interface Role {
  id: string
  nama_role: string
  pivot: RolePivot
  permissions: RolePermission[]
}

export interface User {
  id: string
  nama: string
  email: string
  username?: string
  roles: Role[]
  [key: string]: unknown
}

export interface WorkSchedule {
  [key: string]: unknown
}

export interface AuthData {
  user: User
  permissions: string[]
  work_schedule: WorkSchedule | null
  access_token: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: AuthData
}

export interface StoredAuth {
  user: User
  permissions: string[]
  work_schedule: WorkSchedule | null
  access_token: string
}
