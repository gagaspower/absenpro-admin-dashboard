import type { FaceProfile } from "@/types/face_profile/face_profile.types"
import type { DepartemenRow } from "@/types/departemen/departemen.types"
import type { JabatanRow } from "@/types/jabatan/jabatan.types"
import type { BranchRow } from "@/types/branch/branch.types"
import type { UserRow } from "@/types/user/user.types"
import type { RoleOption } from "../roles/roles.types"

export type PegawaiPosition = Pick<JabatanRow, "id" | "name" | "department_id">

export type PegawaiDepartment = Pick<DepartemenRow, "id" | "name">

export type PegawaiBranch = Pick<BranchRow, "id" | "name">

export interface PegawaiRole extends RoleOption {
  pivot?: {
    user_id: string
    role_id: string
  }
}

export interface PegawaiShift {
  id: string
  name: string
  start_time: string
  end_time: string
  check_in_start: string
  check_in_end: string
  check_out_start: string
  check_out_end: string
  late_tolerance_minutes: number
}

export type PegawaiStatus = "permanent" | "contract" | "intern" | "resign"

export type PegawaiGender = "L" | "P"

export interface PegawaiRow {
  id: string
  code: string
  name: string
  gender: PegawaiGender
  phone: string
  birth_place: string
  birth_date: string
  address: string
  position: PegawaiPosition
  department: PegawaiDepartment
  branch: PegawaiBranch
  face_profile: FaceProfile | null
  join_date: string
  shift: PegawaiShift
  status: PegawaiStatus
  is_trashed: boolean
  user: UserRow | null
  role: PegawaiRole | null
}

export interface PegawaiListResponse {
  total: number
  rows: PegawaiRow[]
}

export type PegawaiStatusFilterValue = PegawaiStatus | "all"
export type PegawaiTrashFilterValue = "all" | "active" | "trashed"

export interface PegawaiFilterState {
  departemenId: string
  jabatanId: string
  branchId: string
  shiftId: string
  status: PegawaiStatusFilterValue
  isTrash: PegawaiTrashFilterValue
}

export const DEFAULT_PEGAWAI_FILTER: PegawaiFilterState = {
  departemenId: "all",
  jabatanId: "all",
  branchId: "all",
  shiftId: "all",
  status: "all",
  isTrash: "active",
}

export type PegawaiCreateEmployeeStatus =
  "permanent" | "contract" | "intern" | "resigned"

export interface CreatePegawaiPayload {
  full_name: string
  username: string
  email: string
  password: string
  password_confirmation: string

  role_id: string

  employee_code: string
  phone?: string
  gender: PegawaiGender
  birth_place?: string
  birth_date: string
  address?: string

  department_id: string
  position_id: string
  branch_id: string
  shift_id?: string

  join_date: string
  employee_status: PegawaiCreateEmployeeStatus
}

export interface CreatePegawaiResponse {
  message?: string
}

export type PegawaiUpdateEmployeeStatus =
  "permanent" | "contract" | "intern" | "resigned"

export interface UpdatePegawaiPayload {
  full_name: string
  username: string
  email: string

  password?: string

  role_id: string

  employee_code: string
  phone?: string
  gender: PegawaiGender
  birth_place?: string
  birth_date: string
  address?: string

  department_id: string
  position_id: string
  branch_id: string
  shift_id?: string

  join_date: string
  employee_status: PegawaiUpdateEmployeeStatus
}

export interface UpdatePegawaiResponse {
  success: boolean
  message: string
  data: unknown
}
