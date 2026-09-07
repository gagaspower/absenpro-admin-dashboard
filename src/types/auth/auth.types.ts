// src/types/auth/auth.types.ts

// ==================================================
// ROLE
// ==================================================

export interface RolePermission {
  [key: string]: unknown
}

export interface RolePivot {
  user_id: string
  role_id: string
}

export interface Role {
  id: string
  nama_role: string
  pivot: RolePivot
  permissions: string[]
}

// ==================================================
// DEPARTMENT
// ==================================================

export interface Department {
  id: string
  name: string
}

// ==================================================
// POSITION
// ==================================================

export interface Position {
  id: string
  name: string
}

// ==================================================
// BRANCH
// ==================================================

export interface Branch {
  id: string
  name: string
}

// ==================================================
// SHIFT
// ==================================================

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

// ==================================================
// FACE PROFILE
// ==================================================

export interface FaceProfile {
  id: string
  employee_id: string
  reference_photo_path: string
  face_embedding: number[]
  model_name: string
  threshold: number
  is_active: boolean
}

// ==================================================
// TODAY ATTENDANCE
// ==================================================

export type TodayAttendance = unknown

// ==================================================
// EMPLOYEE
// ==================================================

export interface Employee {
  id: string
  user_id: string
  employee_code: string
  full_name: string
  phone: string | null
  gender: string
  birth_place: string
  birth_date: string
  address: string | null

  department_id: string
  position_id: string
  branch_id: string
  shift_id: string

  join_date: string
  employee_status: string

  deleted_at: string | null

  department: Department
  position: Position
  branch: Branch

  face_profile: FaceProfile | null
  today_attendance: TodayAttendance | null
}

// ==================================================
// AUTH USER
// ==================================================

export interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  email_verified_at: string | null
  perusahaan_id: string | null
  deleted_at: string | null

  roles: Role[]
  employee: Employee
}

// ==================================================
// WORK SCHEDULE
// ==================================================

export type WorkScheduleSource = "shift" | "branch_schedule"

export interface WorkSchedule {
  source: WorkScheduleSource

  shift_id: string | null
  assignment_id: string | null

  branch_schedule_id: string | null
  branch_schedule_day_id: string | null

  start_time: string
  end_time: string

  check_in_start: string
  check_in_end: string

  check_out_start: string
  check_out_end: string

  late_tolerance_minutes: number
}

// ==================================================
// AUTH DATA
// ==================================================

export interface AuthData {
  user: AuthUser
  permissions: string[]
  work_schedule: WorkSchedule
  access_token: string
}

// ==================================================
// LOGIN RESPONSE
// ==================================================

export interface LoginResponse {
  status: boolean
  message: string
  data: AuthData
}

// ==================================================
// LOGIN CREDENTIALS
// ==================================================

export interface LoginCredentials {
  username: string
  password: string
}

// ==================================================
// STORED AUTH
// ==================================================

export interface StoredAuth {
  access_token: string
  user: AuthUser
  permissions: string[]
  work_schedule: WorkSchedule
}

// ==================================================
// RESET PASSWORD
// ==================================================

export interface ResetPasswordPayload {
  password: string
  password_confirmation: string
}

export interface ResetPasswordResponse {
  status: boolean
  message?: string
}
