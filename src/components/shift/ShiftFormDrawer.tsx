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
import { createShift, updateShift } from "@/services/shift/shift.service"
import type { CreateShiftPayload, ShiftRow } from "@/types/shift/shift.types"

type FormValues = {
  name: string
  start_time: string
  end_time: string
  check_in_start: string
  check_in_end: string
  check_out_start: string
  check_out_end: string
  late_tolerance_minutes: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

interface SubmitAlert {
  type: AlertModalType
  message: string
}

const EMPTY_VALUES: FormValues = {
  name: "",
  start_time: "",
  end_time: "",
  check_in_start: "",
  check_in_end: "",
  check_out_start: "",
  check_out_end: "",
  late_tolerance_minutes: "",
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/
const TIME_FORMAT_MSG = "Format jam harus HH:MM."

function timePair(
  startField: keyof FormValues,
  endField: keyof FormValues,
  labels: {
    startRequired: string
    endRequired: string
    startFormat: string
    endFormat: string
    sameError: string
  }
) {
  return {
    start: yup
      .string()
      .test("required-with-end", labels.startRequired, function (value) {
        const end = (this.parent as FormValues)[endField]
        if (!end) return true
        return Boolean(value)
      })
      .test(
        "format",
        labels.startFormat,
        (value) => !value || TIME_REGEX.test(value)
      ),
    end: yup
      .string()
      .test("required-with-start", labels.endRequired, function (value) {
        const start = (this.parent as FormValues)[startField]
        if (!start) return true
        return Boolean(value)
      })
      .test(
        "format",
        labels.endFormat,
        (value) => !value || TIME_REGEX.test(value)
      )
      .test("different", labels.sameError, function (value) {
        const start = (this.parent as FormValues)[startField]
        if (!start || !value) return true
        return start !== value
      }),
  }
}

const checkIn = timePair("check_in_start", "check_in_end", {
  startRequired:
    "Batas awal check-in wajib diisi ketika batas akhir check-in diisi.",
  endRequired:
    "Batas akhir check-in wajib diisi ketika batas awal check-in diisi.",
  startFormat: TIME_FORMAT_MSG,
  endFormat: TIME_FORMAT_MSG,
  sameError:
    "Batas akhir check-in tidak boleh sama dengan batas awal check-in.",
})

const checkOut = timePair("check_out_start", "check_out_end", {
  startRequired:
    "Batas awal check-out wajib diisi ketika batas akhir check-out diisi.",
  endRequired:
    "Batas akhir check-out wajib diisi ketika batas awal check-out diisi.",
  startFormat: TIME_FORMAT_MSG,
  endFormat: TIME_FORMAT_MSG,
  sameError:
    "Batas akhir check-out tidak boleh sama dengan batas awal check-out.",
})

const shiftSchema = yup.object({
  name: yup
    .string()
    .required("Nama shift wajib diisi.")
    .max(255, "Nama shift maksimal 255 karakter."),
  start_time: yup
    .string()
    .required("Jam mulai kerja wajib diisi.")
    .matches(TIME_REGEX, "Format jam mulai kerja harus HH:MM."),
  end_time: yup
    .string()
    .required("Jam selesai kerja wajib diisi.")
    .matches(TIME_REGEX, "Format jam selesai kerja harus HH:MM.")
    .test(
      "different-start",
      "Jam selesai kerja tidak boleh sama dengan jam mulai kerja.",
      function (value) {
        if (!value) return true
        return value !== this.parent.start_time
      }
    ),
  check_in_start: checkIn.start,
  check_in_end: checkIn.end,
  check_out_start: checkOut.start,
  check_out_end: checkOut.end,
  late_tolerance_minutes: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("Toleransi keterlambatan harus berupa angka bulat.")
    .required("Toleransi keterlambatan wajib diisi.")
    .integer("Toleransi keterlambatan harus berupa angka bulat.")
    .min(0, "Toleransi keterlambatan minimal 0 menit.")
    .max(1440, "Toleransi keterlambatan maksimal 1440 menit."),
})

function initialValues(shift: ShiftRow | null): FormValues {
  return shift
    ? {
        name: shift.name,
        start_time: shift.start_time,
        end_time: shift.end_time,
        check_in_start: shift.check_in_start ?? "",
        check_in_end: shift.check_in_end ?? "",
        check_out_start: shift.check_out_start ?? "",
        check_out_end: shift.check_out_end ?? "",
        late_tolerance_minutes: String(shift.late_tolerance_minutes),
      }
    : EMPTY_VALUES
}

interface ShiftFormDrawerProps {
  open: boolean
  shift: ShiftRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}

export function ShiftFormDrawer({
  open,
  shift,
  onOpenChange,
  onCreated,
}: ShiftFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = shift !== null
  const [values, setValues] = useState<FormValues>(() => initialValues(shift))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAlert, setSubmitAlert] = useState<SubmitAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues(shift))
    setErrors({})
    setSubmitAlert(null)
  }, [shift])

  function changeValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitAlert(null)
    try {
      await shiftSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload: CreateShiftPayload = {
        name: values.name.trim(),
        start_time: values.start_time,
        end_time: values.end_time,
        late_tolerance_minutes: Number(values.late_tolerance_minutes),
        ...(values.check_in_start
          ? { check_in_start: values.check_in_start }
          : {}),
        ...(values.check_in_end ? { check_in_end: values.check_in_end } : {}),
        ...(values.check_out_start
          ? { check_out_start: values.check_out_start }
          : {}),
        ...(values.check_out_end
          ? { check_out_end: values.check_out_end }
          : {}),
      }

      const response = isEdit
        ? await updateShift(shift!.id, payload)
        : await createShift(payload)

      if (!response.success) throw new Error(response.message)

      onOpenChange(false)
      onCreated(response.message || "Shift kerja berhasil disimpan.")
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
              : "Gagal menyimpan shift kerja. Coba lagi.",
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
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:34rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                {isEdit ? "Edit Shift Kerja" : "Tambah Shift Kerja"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui detail jadwal shift kerja."
                  : "Lengkapi data shift dan jam absensi."}
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
            <Field label="Nama Shift" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Shift Siang"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jam Mulai Kerja" error={errors.start_time} required>
                <Input
                  type="time"
                  value={values.start_time}
                  onChange={(event) =>
                    changeValue("start_time", event.target.value)
                  }
                  aria-invalid={Boolean(errors.start_time)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
              <Field label="Jam Selesai Kerja" error={errors.end_time} required>
                <Input
                  type="time"
                  value={values.end_time}
                  onChange={(event) =>
                    changeValue("end_time", event.target.value)
                  }
                  aria-invalid={Boolean(errors.end_time)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#374957]">
                Jam Absen Masuk
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Batas Awal Check-in"
                  error={errors.check_in_start}
                >
                  <Input
                    type="time"
                    value={values.check_in_start}
                    onChange={(event) =>
                      changeValue("check_in_start", event.target.value)
                    }
                    aria-invalid={Boolean(errors.check_in_start)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field label="Batas Akhir Check-in" error={errors.check_in_end}>
                  <Input
                    type="time"
                    value={values.check_in_end}
                    onChange={(event) =>
                      changeValue("check_in_end", event.target.value)
                    }
                    aria-invalid={Boolean(errors.check_in_end)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-[#374957]">
                Jam Absen Pulang
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Batas Awal Check-out"
                  error={errors.check_out_start}
                >
                  <Input
                    type="time"
                    value={values.check_out_start}
                    onChange={(event) =>
                      changeValue("check_out_start", event.target.value)
                    }
                    aria-invalid={Boolean(errors.check_out_start)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
                <Field
                  label="Batas Akhir Check-out"
                  error={errors.check_out_end}
                >
                  <Input
                    type="time"
                    value={values.check_out_end}
                    onChange={(event) =>
                      changeValue("check_out_end", event.target.value)
                    }
                    aria-invalid={Boolean(errors.check_out_end)}
                    className="h-10 rounded-[5px] border-[#DDE3E6]"
                  />
                </Field>
              </div>
            </div>

            <Field
              label="Toleransi Keterlambatan (menit)"
              error={errors.late_tolerance_minutes}
              required
            >
              <Input
                value={values.late_tolerance_minutes}
                onChange={(event) =>
                  changeValue("late_tolerance_minutes", event.target.value)
                }
                inputMode="numeric"
                placeholder="Contoh: 15"
                aria-invalid={Boolean(errors.late_tolerance_minutes)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
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
