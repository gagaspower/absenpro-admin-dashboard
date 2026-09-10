export interface LoginCredentials {
  username: string
  password: string
}

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

export interface EmployeeDepartment {
  id: string
  name: string
}

export interface EmployeePosition {
  id: string
  name: string
}

export interface EmployeeBranch {
  id: string
  name: string
}

export interface EmployeeFaceProfile {
  id: string
  employee_id: string
  reference_photo_path: string
  face_embedding?: number[]
  model_name?: string
  threshold?: number
  is_active?: boolean
}

export interface Employee {
  id: string
  user_id: string
  employee_code: string
  full_name: string
  phone: string
  gender: string
  birth_place: string
  birth_date: string
  address: string
  department_id: string | null
  position_id: string | null
  branch_id: string | null
  shift_id: string | null
  join_date: string
  employee_status: string
  deleted_at: string | null

  department: EmployeeDepartment | null
  position: EmployeePosition | null
  branch: EmployeeBranch | null
  face_profile: EmployeeFaceProfile | null
  today_attendance: unknown
}

export interface User {
  id: string
  nama: string
  email: string
  username?: string
  roles: Role[]
  employee?: Employee | null
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
  status: boolean
  message: string
  data: AuthData
}

export interface StoredAuth {
  user: User
  permissions: string[]
  work_schedule: WorkSchedule | null
  access_token: string
}

export interface ResetPasswordPayload {
  password: string
  password_confirmation: string
}

export interface ResetPasswordResponse {
  status: boolean
  message: string
}
