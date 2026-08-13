export interface Role {
  id: string
  nama_role: string
  pivot: {
    user_id: string
    role_id: string
  }
  permissions: string[]
}

export interface Department {
  id: string
  name: string
}

export interface Position {
  id: string
  name: string
}

export interface Branch {
  id: string
  name: string
}

export interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  check_in_start: string
  check_in_end: string
  check_out_start: string
  check_out_end: string
  late_tolerance_minutes: number
  deleted_at: string | null
}

export interface FaceProfile {
  id: string
  employee_id: string
  reference_photo_path: string
  face_embedding: number[]
  threshold: number
}

export interface Employee {
  id: string
  user_id: string
  employee_code: string
  full_name: string
  address: string
  department_id: string
  position_id: string
  branch_id: string
  shift_id: string
  photo_path: string | null
  department: Department
  position: Position
  branch: Branch
  shift: Shift
  face_profile: FaceProfile | null
  today_attendance: unknown | null
}

export interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  email_verified_at: string | null
  is_active: number
  deleted_at: string | null
  roles: Role[]
  employee: Employee
}

export interface AuthData {
  user: AuthUser
  permissions: string[]
  access_token: string
}

export interface LoginResponse {
  status: boolean
  message: string
  data: AuthData
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface StoredAuth {
  access_token: string
  user: AuthUser
  permissions: string[]
}
