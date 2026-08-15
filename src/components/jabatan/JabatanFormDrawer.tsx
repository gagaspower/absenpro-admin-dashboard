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
import { useMobile } from "@/hooks/use-mobile"
import { DepartemenCombobox } from "@/components/jabatan/DepartemenCombobox"
import {
  createJabatan,
  updateJabatan,
} from "@/services/jabatan/jabatan.service"
import type {
  CreateJabatanPayload,
  JabatanRow,
} from "@/types/jabatan/jabatan.types"

type FormValues = {
  name: string
  description: string
  department_id: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const EMPTY_VALUES: FormValues = {
  name: "",
  description: "",
  department_id: "",
}

const jabatanSchema = yup.object({
  name: yup
    .string()
    .required("Nama Jabatan wajib diisi.")
    .max(255, "Nama Jabatan maksimal 255 karakter."),
  description: yup.string().optional(),
  department_id: yup.string().required("Departemen wajib dipilih."),
})

function initialValues(row: JabatanRow | null): FormValues {
  return row
    ? {
        name: row.name,
        description: row.desc ?? "",
        department_id: row.department_id,
      }
    : EMPTY_VALUES
}

interface JabatanFormDrawerProps {
  open: boolean
  jabatan: JabatanRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}

export function JabatanFormDrawer({
  open,
  jabatan,
  onOpenChange,
  onCreated,
}: JabatanFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = jabatan !== null
  const [values, setValues] = useState<FormValues>(() => initialValues(jabatan))
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    setValues(initialValues(jabatan))
    setErrors({})
    setSubmitError(null)
  }, [jabatan])

  function changeValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    try {
      await jabatanSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: CreateJabatanPayload = {
        name: values.name.trim(),
        department_id: values.department_id,
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
      }

      const res = isEdit
        ? await updateJabatan(jabatan.id, payload)
        : await createJabatan(payload)

      if (!res.success) {
        setSubmitError(res.message || "Gagal menyimpan jabatan.")
        return
      }

      onOpenChange(false)
      onCreated(
        res.message ||
          (isEdit
            ? "Jabatan berhasil diperbarui."
            : "Jabatan berhasil disimpan.")
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
        return
      }
      setSubmitError("Gagal menyimpan jabatan. Coba lagi.")
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
                {isEdit ? "Edit Jabatan" : "Tambah Jabatan"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit ? "Perbarui detail jabatan." : "Lengkapi data jabatan."}
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
            {submitError && (
              <div className="rounded-[5px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {submitError}
              </div>
            )}
            <Field label="Nama Jabatan" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Staff IT"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <Field label="Departemen" error={errors.department_id} required>
              <DepartemenCombobox
                value={values.department_id}
                onChange={(value) => changeValue("department_id", value)}
                error={Boolean(errors.department_id)}
              />
            </Field>
            <Field label="Deskripsi" error={errors.description}>
              <textarea
                value={values.description}
                onChange={(event) =>
                  changeValue("description", event.target.value)
                }
                placeholder="Deskripsi jabatan (opsional)"
                className="min-h-24 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 py-2 text-sm text-[#374957] outline-none placeholder:text-gray-400 focus:border-[#30CCD5] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
              />
            </Field>
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
              {isSubmitting ? "Menyimpan..." : isEdit ? "Perbarui" : "Simpan"}
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
