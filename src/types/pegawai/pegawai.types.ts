import type { FaceProfile } from "@/types/face_profile/face_profile.types"
import type { DepartemenRow } from "@/types/departemen/departemen.types"
import type { JabatanRow } from "@/types/jabatan/jabatan.types"
import type { BranchRow } from "@/types/branch/branch.types"

// Derive dari type existing pakai Pick, biar tetap 1 sumber kebenaran
// (field nested response ini emang cuma subset dari row type aslinya).
export type PegawaiPosition = Pick<JabatanRow, "id" | "name" | "department_id">

export type PegawaiDepartment = Pick<DepartemenRow, "id" | "name">

export type PegawaiBranch = Pick<BranchRow, "id" | "name">

// ShiftRow (types/shift/shift.types.ts) pakai nama field beda total
// (jam_kerja, jam_absen_masuk, dst), bukan cuma subset — jadi gak bisa
// di-derive pakai Pick dari ShiftRow. Type baru di bawah ini ngikut
// field asli yang dikirim backend di response pegawai.
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
}

export interface PegawaiListResponse {
  total: number
  rows: PegawaiRow[]
}
