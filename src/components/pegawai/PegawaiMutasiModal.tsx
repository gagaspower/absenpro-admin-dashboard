import { useEffect, useState } from "react"
import * as yup from "yup"
import { Info, LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { DatePicker } from "@/components/ui/date-picker"

import { DepartemenFormCombobox } from "@/components/pegawai/DepartemenFormCombobox"
import { JabatanFormCombobox } from "@/components/pegawai/JabatanFormCombobox"
import { BranchFormCombobox } from "@/components/pegawai/BranchFormCombobox"

import { mutasiPegawai } from "@/services/pegawai/pegawai.service"
import type {
  MutasiPegawaiPayload,
  PegawaiRow,
} from "@/types/pegawai/pegawai.types"

type FormValues = {
  department_id: string
  position_id: string
  branch_id: string
  effective_from: string
  effective_until: string
  reason: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

type ComboboxLoadingState = {
  departemen: boolean
  jabatan: boolean
  branch: boolean
}

const INITIAL_LOADING_STATE: ComboboxLoadingState = {
  departemen: true,
  jabatan: false,
  branch: true,
}

// Sesuai validasi yang diminta: hanya effective_until & reason yang nullable.
const mutasiSchema = yup.object({
  department_id: yup.string().required("Departemen wajib dipilih."),
  position_id: yup.string().required("Jabatan wajib dipilih."),
  branch_id: yup.string().required("Cabang wajib dipilih."),
  effective_from: yup.string().required("Tanggal efektif mutasi wajib diisi."),
  effective_until: yup.string().optional(),
  reason: yup.string().max(500, "Alasan maksimal 500 karakter.").optional(),
})

function buildInitialValues(pegawai: PegawaiRow | null): FormValues {
  return {
    department_id: pegawai?.department?.id ?? "",
    position_id: pegawai?.position?.id ?? "",
    branch_id: pegawai?.branch.id ?? "",
    effective_from: "",
    effective_until: "",
    reason: "",
  }
}

interface PegawaiMutasiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pegawai: PegawaiRow | null
  onSuccess: (message: string) => void
  onError?: (message: string) => void
}

export function PegawaiMutasiModal({
  open,
  onOpenChange,
  pegawai,
  onSuccess,
  onError,
}: PegawaiMutasiModalProps) {
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(pegawai)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataLoading, setDataLoading] = useState<ComboboxLoadingState>(
    INITIAL_LOADING_STATE
  )

  const isReferenceDataLoading =
    dataLoading.departemen || dataLoading.jabatan || dataLoading.branch

  function setLoadingFor(key: keyof ComboboxLoadingState) {
    return (isLoading: boolean) =>
      setDataLoading((current) => ({ ...current, [key]: isLoading }))
  }

  useEffect(() => {
    if (!open) return
    setDataLoading(INITIAL_LOADING_STATE)
    setValues(buildInitialValues(pegawai))
    setErrors({})
  }, [open, pegawai])

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

  function resetForm() {
    setValues(buildInitialValues(pegawai))
    setErrors({})
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!pegawai) return

    try {
      await mutasiSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: MutasiPegawaiPayload = {
        department_id: values.department_id,
        position_id: values.position_id,
        branch_id: values.branch_id,
        effective_from: values.effective_from,
        effective_until: values.effective_until || null,
        reason: values.reason.trim() || null,
      }

      const res = await mutasiPegawai(pegawai.id, payload)

      onOpenChange(false)
      resetForm()
      onSuccess(res.message || "Mutasi pegawai berhasil disimpan.")
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
        onError?.("Gagal menyimpan mutasi pegawai.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) resetForm()
      }}
    >
      <DialogContent className="flex max-w-lg flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <div className="border-b border-[#EAEAEA] px-5 py-4">
          <DialogTitle className="text-lg font-semibold text-[#374957]">
            Mutasi Pegawai
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#71808B]">
            {pegawai
              ? `Pindahkan penempatan ${pegawai.name} ke departemen, jabatan, atau cabang baru.`
              : "Pindahkan penempatan pegawai ke departemen, jabatan, atau cabang baru."}
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Departemen" error={errors.department_id} required>
                <DepartemenFormCombobox
                  value={values.department_id}
                  onChange={changeDepartemen}
                  error={Boolean(errors.department_id)}
                  onLoadingChange={setLoadingFor("departemen")}
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
                  onLoadingChange={setLoadingFor("jabatan")}
                />
              </Field>
              <Field
                label="Cabang / Lokasi Kerja"
                error={errors.branch_id}
                required
              >
                <BranchFormCombobox
                  value={values.branch_id}
                  onChange={(value: string) => changeValue("branch_id", value)}
                  error={Boolean(errors.branch_id)}
                  onLoadingChange={setLoadingFor("branch")}
                />
              </Field>
              <div className="hidden sm:block" />
              <Field
                label="Efektif Dari"
                error={errors.effective_from}
                required
              >
                <DatePicker
                  value={values.effective_from}
                  onChange={(value) => changeValue("effective_from", value)}
                  error={Boolean(errors.effective_from)}
                />
              </Field>
              <Field label="Efektif Sampai" error={errors.effective_until}>
                <DatePicker
                  value={values.effective_until}
                  onChange={(value) => changeValue("effective_until", value)}
                  error={Boolean(errors.effective_until)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Alasan Mutasi" error={errors.reason}>
                  <textarea
                    value={values.reason}
                    onChange={(e) => changeValue("reason", e.target.value)}
                    placeholder="Contoh: Mutasi ke departemen operasional (opsional)"
                    maxLength={500}
                    className="min-h-20 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 py-2 text-sm text-[#374957] outline-none placeholder:text-gray-400 focus:border-[#30CCD5]"
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-[5px] bg-[#F3F8FA] px-3 py-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-[#71808B]" />
              <p className="text-xs leading-relaxed text-[#71808B]">
                Kosongkan{" "}
                <span className="font-medium text-[#374957]">
                  Efektif Sampai
                </span>{" "}
                jika penempatan baru berlaku tanpa batas waktu akhir.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-[#EAEAEA] bg-white px-5 py-4">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 flex-1 rounded-[5px] border-[#DDE3E6]"
                />
              }
            >
              Batal
            </DialogClose>
            {isReferenceDataLoading && (
              <span className="self-center text-xs text-gray-400">
                Memuat data referensi...
              </span>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isReferenceDataLoading}
              className="h-10 flex-1 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              Simpan Mutasi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
