import { useEffect, useState } from "react"
import * as yup from "yup"
import { LoaderCircle, X } from "lucide-react"

import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
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
import { DatePicker } from "@/components/ui/date-picker"
import { useMobile } from "@/hooks/use-mobile"
import {
  createHoliday,
  updateHoliday,
} from "@/services/holiday/holiday.service"
import type {
  CreateHolidayPayload,
  HolidayRow,
} from "@/types/holiday/holiday.types"

type FormValues = {
  name: string
  start_date: string
  end_date: string
  description: string
  is_recurring: boolean
}

type FormErrors = Partial<Record<keyof FormValues, string>>

interface SubmitAlert {
  type: AlertModalType
  message: string
}

const EMPTY_VALUES: FormValues = {
  name: "",
  start_date: "",
  end_date: "",
  description: "",
  is_recurring: false,
}

const holidaySchema = yup.object({
  name: yup
    .string()
    .required("Nama hari libur wajib diisi.")
    .max(255, "Nama hari libur maksimal 255 karakter."),
  start_date: yup.string().required("Tanggal mulai wajib diisi."),
  end_date: yup
    .string()
    .required("Tanggal selesai wajib diisi.")
    .test(
      "is-after-start",
      "Tanggal selesai tidak boleh sebelum tanggal mulai.",
      function (value) {
        const { start_date } = this.parent
        if (!value || !start_date) return true
        return new Date(value) >= new Date(start_date)
      }
    ),
  description: yup.string().optional(),
  is_recurring: yup.boolean().default(false),
})

function toDateOnly(value: string): string {
  return value.split("T")[0] ?? value
}

function initialValues(row: HolidayRow | null): FormValues {
  return row
    ? {
        name: row.name,
        start_date: toDateOnly(row.start_date),
        end_date: toDateOnly(row.end_date),
        description: row.desc ?? "",
        is_recurring: row.is_recurring,
      }
    : { ...EMPTY_VALUES }
}

interface HolidayFormDrawerProps {
  open: boolean
  holiday: HolidayRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}

export function HolidayFormDrawer({
  open,
  holiday,
  onOpenChange,
  onCreated,
}: HolidayFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = holiday !== null
  const [values, setValues] = useState<FormValues>(() => initialValues(holiday))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAlert, setSubmitAlert] = useState<SubmitAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return

    setValues(initialValues(holiday))
    setErrors({})
    setSubmitAlert(null)
  }, [open, holiday])

  function changeValue<K extends keyof FormValues>(
    field: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitAlert(null)
    try {
      await holidaySchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: CreateHolidayPayload = {
        name: values.name.trim(),
        start_date: values.start_date,
        end_date: values.end_date,
        is_recurring: values.is_recurring,
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
      }

      const response = isEdit
        ? await updateHoliday(holiday!.id, payload)
        : await createHoliday(payload)

      if (!response.success) throw new Error(response.message)

      onOpenChange(false)
      onCreated(response.message || "Hari libur berhasil disimpan.")
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
              : "Gagal menyimpan hari libur. Coba lagi.",
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
                {isEdit ? "Edit Hari Libur" : "Tambah Hari Libur"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui detail hari libur."
                  : "Lengkapi data hari libur baru."}
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
            <Field label="Nama Hari Libur" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Hari Kemerdekaan"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tanggal Mulai" error={errors.start_date} required>
                <DatePicker
                  value={values.start_date}
                  onChange={(value) => changeValue("start_date", value)}
                  error={Boolean(errors.start_date)}
                />
              </Field>
              <Field label="Tanggal Selesai" error={errors.end_date} required>
                <DatePicker
                  value={values.end_date}
                  onChange={(value) => changeValue("end_date", value)}
                  error={Boolean(errors.end_date)}
                />
              </Field>
            </div>

            <Field label="Deskripsi" error={errors.description}>
              <textarea
                value={values.description}
                onChange={(event) =>
                  changeValue("description", event.target.value)
                }
                placeholder="Deskripsi hari libur (opsional)"
                className="min-h-24 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 py-2 text-sm text-[#374957] outline-none placeholder:text-gray-400 focus:border-[#30CCD5] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
              />
            </Field>

            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={values.is_recurring}
                onCheckedChange={(checked) =>
                  changeValue("is_recurring", checked === true)
                }
              />
              <span className="text-sm text-[#374957]">
                Berulang setiap tahun
              </span>
            </label>
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
