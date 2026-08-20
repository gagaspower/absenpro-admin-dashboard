import { useEffect, useState } from "react"
import * as yup from "yup"
import { LoaderCircle, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { useMobile } from "@/hooks/use-mobile"

import { DepartemenFormCombobox } from "@/components/pegawai/DepartemenFormCombobox"

import { createPegawai } from "@/services/pegawai/pegawai.service"
import type {
  CreatePegawaiPayload,
  PegawaiCreateEmployeeStatus,
  PegawaiGender,
  PegawaiRow,
  PegawaiStatus,
} from "@/types/pegawai/pegawai.types"
import { DatePicker } from "../ui/date-picker"
import { RoleFormCombobox } from "./RoleFormCombobox"
import { JabatanFormCombobox } from "./JabatanFormCombobox"
import { BranchFormCombobox } from "./BranchFormCombobox"
import { ShiftFormCombobox } from "./ShiftFormCombobox"

export type PegawaiFormMode = "create" | "edit"

type FormValues = {
  full_name: string
  username: string
  email: string
  password: string
  password_confirmation: string
  is_active: boolean

  role_id: string

  employee_code: string
  phone: string
  gender: PegawaiGender | ""
  birth_place: string
  birth_date: string
  address: string

  department_id: string
  position_id: string
  branch_id: string
  shift_id: string

  join_date: string
  employee_status: PegawaiCreateEmployeeStatus | ""
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_VALUES: FormValues = {
  full_name: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
  is_active: true,

  role_id: "",

  employee_code: "",
  phone: "",
  gender: "",
  birth_place: "",
  birth_date: "",
  address: "",

  department_id: "",
  position_id: "",
  branch_id: "",
  shift_id: "",

  join_date: "",
  employee_status: "",
}

const GENDER_OPTIONS: { value: PegawaiGender; label: string }[] = [
  { value: "L", label: "Laki-laki" },
  { value: "P", label: "Perempuan" },
]

const STATUS_OPTIONS: { value: PegawaiCreateEmployeeStatus; label: string }[] =
  [
    { value: "permanent", label: "Tetap" },
    { value: "contract", label: "Kontrak" },
    { value: "intern", label: "Magang" },
    { value: "resigned", label: "Resign" },
  ]

// Backend read pakai 'resign', create/edit form pakai 'resigned' —
// samain di sini pas prefill dari data row.
function mapRowStatusToFormStatus(
  status: PegawaiStatus
): PegawaiCreateEmployeeStatus {
  return status === "resign" ? "resigned" : status
}

function toDateInputValue(raw: string | null | undefined): string {
  if (!raw) return ""
  const match = raw.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : ""
}

// Field data pribadi/penempatan/kepegawaian dipakai bareng di create & edit.
const dataPribadiPenempatanSchema = {
  employee_code: yup
    .string()
    .required("NIK wajib diisi.")
    .matches(/^\d{16}$/, "NIK harus terdiri dari 16 digit."),
  full_name: yup
    .string()
    .required("Nama pegawai wajib diisi.")
    .max(255, "Nama pegawai maksimal 255 karakter."),
  phone: yup.string().max(20, "Nomor telepon maksimal 20 karakter.").optional(),
  gender: yup
    .string()
    .oneOf(["L", "P"], "Jenis kelamin tidak valid.")
    .required("Jenis kelamin wajib dipilih."),
  birth_place: yup
    .string()
    .max(100, "Tempat lahir maksimal 100 karakter.")
    .optional(),
  birth_date: yup.string().required("Tanggal lahir wajib diisi."),
  address: yup.string().optional(),

  department_id: yup.string().required("Departemen wajib dipilih."),
  position_id: yup.string().required("Jabatan wajib dipilih."),
  branch_id: yup.string().required("Cabang wajib dipilih."),
  shift_id: yup.string().optional(),

  join_date: yup.string().required("Tanggal bergabung wajib diisi."),
  employee_status: yup
    .string()
    .oneOf(
      ["permanent", "contract", "intern", "resigned"],
      "Status pegawai tidak valid."
    )
    .required("Status pegawai wajib dipilih."),
}

// Sinkron dgn Request::rules() backend — bagian yg bisa dicek di client aja
// (unique/exists tetap divalidasi server, gak bisa dicek Yup).
const pegawaiCreateSchema = yup.object({
  username: yup
    .string()
    .required("Username wajib diisi.")
    .min(3, "Username minimal 3 karakter.")
    .max(50, "Username maksimal 50 karakter."),
  email: yup
    .string()
    .required("Email wajib diisi.")
    .email("Format email tidak valid."),
  password: yup
    .string()
    .required("Password wajib diisi.")
    .min(6, "Password minimal 6 karakter.")
    .max(25, "Password maksimal 25 karakter.")
    .matches(
      /^[A-Za-z0-9]+$/,
      "Password hanya boleh berisi huruf dan angka tanpa spasi atau karakter khusus."
    ),
  password_confirmation: yup
    .string()
    .required("Konfirmasi password wajib diisi.")
    .oneOf([yup.ref("password")], "Konfirmasi password tidak sesuai."),
  is_active: yup.boolean().required(),
  role_id: yup.string().required("Role user wajib dipilih."),

  ...dataPribadiPenempatanSchema,
})

// Mode edit gak nyentuh akun login (data itu gak ikut dikirim di response
// list pegawai, dan endpoint update-nya sendiri belum ada dari backend).
const pegawaiEditSchema = yup.object({
  ...dataPribadiPenempatanSchema,
})

interface PegawaiFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: PegawaiFormMode
  pegawai?: PegawaiRow | null
  onCreated: (message: string) => void
  onError?: (message: string) => void
}

export function PegawaiFormDrawer({
  open,
  onOpenChange,
  mode = "create",
  pegawai = null,
  onCreated,
  onError,
}: PegawaiFormDrawerProps) {
  const isMobile = useMobile()
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = mode === "edit"

  function resetForm() {
    setValues(EMPTY_VALUES)
    setErrors({})
  }

  // Isi ulang form tiap drawer dibuka: kosong buat create, ke-prefill dari
  // row buat edit. Field akun login (username/email/password/role) gak ada
  // di data row, jadi dibiarin kosong & section-nya disembunyiin di edit.
  useEffect(() => {
    if (!open) return

    if (isEdit && pegawai) {
      setValues({
        ...EMPTY_VALUES,
        full_name: pegawai.name,
        employee_code: pegawai.code,
        phone: pegawai.phone ?? "",
        gender: pegawai.gender,
        birth_place: pegawai.birth_place ?? "",
        birth_date: toDateInputValue(pegawai.birth_date),
        address: pegawai.address ?? "",

        department_id: pegawai.department.id,
        position_id: pegawai.position.id,
        branch_id: pegawai.branch.id,
        shift_id: pegawai.shift?.id ?? "",

        join_date: toDateInputValue(pegawai.join_date),
        employee_status: mapRowStatusToFormStatus(pegawai.status),
      })
    } else {
      setValues(EMPTY_VALUES)
    }
    setErrors({})
  }, [open, isEdit, pegawai])

  function changeValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function changeDepartemen(value: string) {
    // Jabatan bertingkat dengan departemen — reset kalau departemen ganti.
    setValues((current) => ({
      ...current,
      department_id: value,
      position_id: "",
    }))
    setErrors((current) => ({
      ...current,
      department_id: undefined,
      position_id: undefined,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      const schema = isEdit ? pegawaiEditSchema : pegawaiCreateSchema
      await schema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      if (isEdit) {
        // TODO: sambungin ke updatePegawai() begitu endpoint edit pegawai
        // ready dari backend. Form udah siap & ke-prefill, tinggal ganti
        // blok ini jadi service call beneran.
        onError?.("Fitur edit pegawai masih menyusul, endpoint belum tersedia.")
        return
      }

      const payload: CreatePegawaiPayload = {
        full_name: values.full_name.trim(),
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
        is_active: values.is_active,

        role_id: values.role_id,

        employee_code: values.employee_code.trim(),
        gender: values.gender as PegawaiGender,
        birth_date: values.birth_date,
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        ...(values.birth_place.trim()
          ? { birth_place: values.birth_place.trim() }
          : {}),
        ...(values.address.trim() ? { address: values.address.trim() } : {}),

        department_id: values.department_id,
        position_id: values.position_id,
        branch_id: values.branch_id,
        ...(values.shift_id ? { shift_id: values.shift_id } : {}),

        join_date: values.join_date,
        employee_status: values.employee_status as PegawaiCreateEmployeeStatus,
      }

      const res = await createPegawai(payload)

      onOpenChange(false)
      resetForm()
      onCreated(res.message || "Pegawai berhasil disimpan.")
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const nextErrors: FormErrors = {}
        error.inner.forEach((item) => {
          if (item.path && !(item.path in nextErrors)) {
            nextErrors[item.path as keyof FormValues] = item.message
          }
        })
        setErrors(nextErrors)
      } else {
        onError?.(
          isEdit ? "Gagal memperbarui pegawai." : "Gagal menyimpan pegawai."
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
      swipeDirection="right"
      showSwipeHandle={isMobile}
    >
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:44rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui data pegawai."
                  : "Lengkapi data pegawai. Akun login pegawai dibuat sekalian."}
              </DrawerDescription>
            </div>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon" aria-label="Tutup drawer" />
              }
            >
              <X className="size-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {!isEdit && (
              <FormSection title="Akun Login">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Username" error={errors.username} required>
                    <Input
                      value={values.username}
                      onChange={(e) => changeValue("username", e.target.value)}
                      placeholder="budi.santoso"
                      maxLength={50}
                      aria-invalid={Boolean(errors.username)}
                      className="h-10 rounded-[5px] border-[#DDE3E6]"
                    />
                  </Field>
                  <Field label="Email" error={errors.email} required>
                    <Input
                      type="email"
                      value={values.email}
                      onChange={(e) => changeValue("email", e.target.value)}
                      placeholder="budi.santoso@example.com"
                      aria-invalid={Boolean(errors.email)}
                      className="h-10 rounded-[5px] border-[#DDE3E6]"
                    />
                  </Field>
                  <Field label="Password" error={errors.password} required>
                    <Input
                      type="password"
                      value={values.password}
                      onChange={(e) => changeValue("password", e.target.value)}
                      placeholder="Minimal 6 karakter"
                      maxLength={25}
                      aria-invalid={Boolean(errors.password)}
                      className="h-10 rounded-[5px] border-[#DDE3E6]"
                    />
                  </Field>
                  <Field
                    label="Konfirmasi Password"
                    error={errors.password_confirmation}
                    required
                  >
                    <Input
                      type="password"
                      value={values.password_confirmation}
                      onChange={(e) =>
                        changeValue("password_confirmation", e.target.value)
                      }
                      placeholder="Ulangi password"
                      maxLength={25}
                      aria-invalid={Boolean(errors.password_confirmation)}
                      className="h-10 rounded-[5px] border-[#DDE3E6]"
                    />
                  </Field>
                  <Field label="Role" error={errors.role_id} required>
                    <RoleFormCombobox
                      value={values.role_id}
                      onChange={(value: string) =>
                        changeValue("role_id", value)
                      }
                      error={Boolean(errors.role_id)}
                    />
                  </Field>
                  <label className="flex items-center gap-2 pt-6">
                    <Checkbox
                      checked={values.is_active}
                      onCheckedChange={(checked) =>
                        changeValue("is_active", checked === true)
                      }
                    />
                    <span className="text-sm text-[#374957]">
                      Aktifkan akun
                    </span>
                  </label>
                </div>
              </FormSection>
            )}

            <FormSection title="Data Pribadi">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nama Lengkap" error={errors.full_name} required>
                  <Input
                    value={values.full_name}
                    onChange={(e) => changeValue("full_name", e.target.value)}
                    placeholder="Budi Santoso"
                    maxLength={255}
                    aria-invalid={Boolean(errors.full_name)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field label="NIK" error={errors.employee_code} required>
                  <Input
                    value={values.employee_code}
                    onChange={(e) =>
                      changeValue(
                        "employee_code",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    placeholder="16 digit NIK"
                    maxLength={16}
                    inputMode="numeric"
                    aria-invalid={Boolean(errors.employee_code)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field label="Jenis Kelamin" error={errors.gender} required>
                  <OptionPills
                    options={GENDER_OPTIONS}
                    value={values.gender}
                    onChange={(value) => changeValue("gender", value)}
                  />
                </Field>
                <Field label="No. Telepon" error={errors.phone}>
                  <Input
                    value={values.phone}
                    onChange={(e) => changeValue("phone", e.target.value)}
                    placeholder="081234567890"
                    maxLength={20}
                    aria-invalid={Boolean(errors.phone)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field label="Tempat Lahir" error={errors.birth_place}>
                  <Input
                    value={values.birth_place}
                    onChange={(e) => changeValue("birth_place", e.target.value)}
                    placeholder="Semarang"
                    maxLength={100}
                    aria-invalid={Boolean(errors.birth_place)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field label="Tanggal Lahir" error={errors.birth_date} required>
                  <DatePicker
                    value={values.birth_date}
                    onChange={(value) => changeValue("birth_date", value)}
                    error={Boolean(errors.birth_date)}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Alamat" error={errors.address}>
                    <textarea
                      value={values.address}
                      onChange={(e) => changeValue("address", e.target.value)}
                      placeholder="Alamat lengkap (opsional)"
                      className="min-h-20 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 py-2 text-sm text-[#374957] outline-none placeholder:text-gray-400 focus:border-[#30CCD5]"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection title="Penempatan">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Departemen" error={errors.department_id} required>
                  <DepartemenFormCombobox
                    value={values.department_id}
                    onChange={changeDepartemen}
                    error={Boolean(errors.department_id)}
                  />
                </Field>
                <Field label="Jabatan" error={errors.position_id} required>
                  <JabatanFormCombobox
                    value={values.position_id}
                    onChange={(value: string) =>
                      changeValue("position_id", value)
                    }
                    departemenId={values.department_id}
                    error={Boolean(errors.position_id)}
                  />
                </Field>
                <Field
                  label="Cabang / Lokasi Kerja"
                  error={errors.branch_id}
                  required
                >
                  <BranchFormCombobox
                    value={values.branch_id}
                    onChange={(value: string) =>
                      changeValue("branch_id", value)
                    }
                    error={Boolean(errors.branch_id)}
                  />
                </Field>
                <Field label="Shift" error={errors.shift_id}>
                  <ShiftFormCombobox
                    value={values.shift_id}
                    onChange={(value: string) => changeValue("shift_id", value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Kepegawaian">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Tanggal Bergabung"
                  error={errors.join_date}
                  required
                >
                  <DatePicker
                    value={values.join_date}
                    onChange={(value) => changeValue("join_date", value)}
                    error={Boolean(errors.join_date)}
                  />
                </Field>
                <Field
                  label="Status Pegawai"
                  error={errors.employee_status}
                  required
                >
                  <OptionPills
                    options={STATUS_OPTIONS}
                    value={values.employee_status}
                    onChange={(value) => changeValue("employee_status", value)}
                  />
                </Field>
              </div>
            </FormSection>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-[#EAEAEA] bg-white px-5 py-4">
            <DrawerClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 rounded-[5px] border-[#DDE3E6]"
                />
              }
            >
              Batal
            </DrawerClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 flex-1 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0]"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#374957]">{title}</h3>
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  required = false,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[#374957]">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="block text-xs text-red-500">{error}</span>}
    </label>
  )
}

function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T | ""
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-[#30CCD5] bg-[#E7FAFB] text-[#1FA0A8]"
                : "border-[#DDE3E6] text-[#71808B] hover:border-[#30CCD5]"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
