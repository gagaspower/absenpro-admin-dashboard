import { useEffect, useState } from "react"
import * as yup from "yup"
import { LoaderCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useMobile } from "@/hooks/use-mobile"
import { CategoryCutiFormCombobox } from "@/components/jenis_cuti/CategoryCutiFormCombobox"
import {
  createJenisCuti,
  updateJenisCuti,
} from "@/services/jenis_cuti/jenis_cuti.service"
import type {
  CreateJenisCutiPayload,
  JenisCutiRow,
  KategoriCuti,
  UnitCuti,
} from "@/types/jenis_cuti/jenis_cuti.types"

type FormValues = {
  name: string
  code: string
  category: KategoriCuti | ""
  unit: UnitCuti
  is_paid: boolean
  deduct_quota: boolean
  requires_attachment: boolean
  max_days_per_year: string
  min_days_notice: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_VALUES: FormValues = {
  name: "",
  code: "",
  category: "",
  unit: "day",
  is_paid: false,
  deduct_quota: false,
  requires_attachment: false,
  max_days_per_year: "",
  min_days_notice: "",
}

const jenisCutiSchema = yup.object({
  name: yup
    .string()
    .required("Nama jenis cuti wajib diisi.")
    .max(255, "Nama maksimal 255 karakter."),
  code: yup
    .string()
    .required("Kode wajib diisi.")
    .max(20, "Kode maksimal 20 karakter."),
  category: yup
    .mixed<KategoriCuti>()
    .oneOf(["cuti", "izin"], "Kategori wajib dipilih.")
    .required("Kategori wajib dipilih."),
  unit: yup.mixed<UnitCuti>().oneOf(["day", "hour"]).required(),
  is_paid: yup.boolean().default(false),
  deduct_quota: yup.boolean().default(false),
  requires_attachment: yup.boolean().default(false),
  max_days_per_year: yup
    .string()
    .optional()
    .test(
      "is-positive",
      "Maksimal hari/tahun harus angka positif.",
      (v) => !v || Number(v) >= 0
    ),
  min_days_notice: yup
    .string()
    .optional()
    .test(
      "is-positive",
      "Minimal hari notice harus angka positif.",
      (v) => !v || Number(v) >= 0
    ),
})

function initialValues(row: JenisCutiRow | null): FormValues {
  return row
    ? {
        name: row.name,
        code: row.code,
        category: row.category,
        unit: row.unit,
        is_paid: row.is_paid,
        deduct_quota: row.deduct_quota,
        requires_attachment: row.requires_attachment,
        max_days_per_year:
          row.max_days_per_year === null ? "" : String(row.max_days_per_year),
        min_days_notice:
          row.min_days_notice === null ? "" : String(row.min_days_notice),
      }
    : EMPTY_VALUES
}

interface JenisCutiFormDrawerProps {
  open: boolean
  jenisCuti: JenisCutiRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
  onError?: (message: string) => void
}

export function JenisCutiFormDrawer({
  open,
  jenisCuti,
  onOpenChange,
  onCreated,
  onError,
}: JenisCutiFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = jenisCuti !== null
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(jenisCuti)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues(jenisCuti))
    setErrors({})
  }, [jenisCuti])

  function changeValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      await jenisCutiSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: CreateJenisCutiPayload = {
        name: values.name.trim(),
        code: values.code.trim(),
        category: values.category as KategoriCuti,
        unit: values.unit,
        is_paid: values.is_paid,
        deduct_quota: values.deduct_quota,
        requires_attachment: values.requires_attachment,
        max_days_per_year:
          values.max_days_per_year === ""
            ? null
            : Number(values.max_days_per_year),
        min_days_notice:
          values.min_days_notice === "" ? null : Number(values.min_days_notice),
      }

      const res = isEdit
        ? await updateJenisCuti(jenisCuti!.id, payload)
        : await createJenisCuti(payload)

      onOpenChange(false)
      onCreated(
        res.message ||
          (isEdit
            ? "Jenis cuti berhasil diperbarui."
            : "Jenis cuti berhasil disimpan.")
      )
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
          isEdit
            ? "Gagal memperbarui jenis cuti."
            : "Gagal menyimpan jenis cuti."
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle={isMobile}
    >
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:28rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                {isEdit ? "Edit Jenis Cuti" : "Tambah Jenis Cuti"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui detail jenis cuti."
                  : "Lengkapi data jenis cuti."}
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
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <Field label="Nama Jenis Cuti" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Cuti Tahunan"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <Field label="Kode" error={errors.code} required>
              <Input
                value={values.code}
                onChange={(event) => changeValue("code", event.target.value)}
                placeholder="Contoh: CT"
                maxLength={20}
                aria-invalid={Boolean(errors.code)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <Field label="Kategori" error={errors.category} required>
              <CategoryCutiFormCombobox
                value={values.category}
                onChange={(value) => changeValue("category", value)}
                error={Boolean(errors.category)}
              />
            </Field>
            <Field label="Unit" error={errors.unit} required>
              <select
                value={values.unit}
                onChange={(event) =>
                  changeValue("unit", event.target.value as UnitCuti)
                }
                className="h-10 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 text-sm text-[#374957] outline-none focus:border-[#30CCD5]"
              >
                <option value="day">Hari</option>
                <option value="hour">Jam</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Maks Hari/Tahun" error={errors.max_days_per_year}>
                <Input
                  type="number"
                  min={0}
                  value={values.max_days_per_year}
                  onChange={(event) =>
                    changeValue("max_days_per_year", event.target.value)
                  }
                  placeholder="Opsional"
                  aria-invalid={Boolean(errors.max_days_per_year)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
              <Field label="Min Hari Notice" error={errors.min_days_notice}>
                <Input
                  type="number"
                  min={0}
                  value={values.min_days_notice}
                  onChange={(event) =>
                    changeValue("min_days_notice", event.target.value)
                  }
                  placeholder="Opsional"
                  aria-invalid={Boolean(errors.min_days_notice)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
            </div>
            <div className="space-y-3 pt-1">
              <CheckboxField
                label="Tetap dibayar"
                checked={values.is_paid}
                onCheckedChange={(checked) => changeValue("is_paid", checked)}
              />
              <CheckboxField
                label="Potong Kuota"
                checked={values.deduct_quota}
                onCheckedChange={(checked) =>
                  changeValue("deduct_quota", checked)
                }
              />
              <CheckboxField
                label="Wajib Lampiran"
                checked={values.requires_attachment}
                onCheckedChange={(checked) =>
                  changeValue("requires_attachment", checked)
                }
              />
            </div>
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
              {isEdit ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
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

function CheckboxField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#374957]">
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      {label}
    </label>
  )
}
