import { useEffect, useState } from "react"
import * as yup from "yup"
import { LoaderCircle, X } from "lucide-react"

import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
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
import {
  createDepartemen,
  updateDepartemen,
} from "@/services/departemen/departemen.service"
import type {
  CreateDepartemenPayload,
  DepartemenRow,
} from "@/types/departemen/departemen.types"

type FormValues = {
  name: string
  description: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

interface SubmitAlert {
  type: AlertModalType
  message: string
}

const EMPTY_VALUES: FormValues = {
  name: "",
  description: "",
}

const departemenSchema = yup.object({
  name: yup
    .string()
    .required("Nama Unit/Departemen wajib diisi.")
    .max(255, "Nama Unit/Departemen maksimal 255 karakter."),
  description: yup.string().optional(),
})

function initialValues(row: DepartemenRow | null): FormValues {
  return row
    ? {
        name: row.name,
        description: row.desc ?? "",
      }
    : EMPTY_VALUES
}

interface DepartemenFormDrawerProps {
  open: boolean
  departemen: DepartemenRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}

export function DepartemenFormDrawer({
  open,
  departemen,
  onOpenChange,
  onCreated,
}: DepartemenFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = departemen !== null
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(departemen)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAlert, setSubmitAlert] = useState<SubmitAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues(departemen))
    setErrors({})
    setSubmitAlert(null)
  }, [departemen])

  function changeValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitAlert(null)
    try {
      await departemenSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: CreateDepartemenPayload = {
        name: values.name.trim(),
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
      }

      const response = isEdit
        ? await updateDepartemen(departemen!.id, payload)
        : await createDepartemen(payload)

      if (!response.success) throw new Error(response.message)

      onOpenChange(false)
      onCreated(response.message || "Departemen berhasil disimpan.")
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
        setSubmitAlert({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "Gagal menyimpan departemen. Coba lagi.",
        })
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
                {isEdit ? "Edit Departemen" : "Tambah Departemen"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui detail unit/departemen."
                  : "Lengkapi data unit/departemen kerja."}
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
            <Field label="Nama Unit/Departemen" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Human Resources"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <Field label="Deskripsi" error={errors.description}>
              <textarea
                value={values.description}
                onChange={(event) =>
                  changeValue("description", event.target.value)
                }
                placeholder="Deskripsi departemen (opsional)"
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
              {isEdit ? "Perbarui" : "Simpan"}
            </Button>
          </div>
        </form>
      </DrawerContent>
      {submitAlert && (
        <AlertModal
          open
          type={submitAlert.type}
          message={submitAlert.message}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setSubmitAlert(null)
          }}
        />
      )}
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
