import { useState } from "react"
import * as yup from "yup"
import { LoaderCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { BranchFormCombobox } from "@/components/branch_schedule/BranchFormCombobox"
import {
  createBranchSchedule,
  updateBranchSchedule,
} from "@/services/branch_schedule/branch_schedule.service"
import type {
  BranchSchedule,
  BranchScheduleDayPayload,
  BranchSchedulePayload,
  Weekday,
} from "@/types/branch_schedule/branch_schedule.types"
import { WEEKDAY_LABELS } from "@/constants/weekday"
import { DatePicker } from "@/components/ui/date-picker"

type DayFormValues = {
  weekday: Weekday
  is_working_day: boolean
  start_time: string
  end_time: string
  check_in_start: string
  check_in_end: string
  check_out_start: string
  check_out_end: string
  late_tolerance_minutes: string
}

type FormValues = {
  branch_id: string
  name: string
  effective_from: string
  effective_until: string
  days: DayFormValues[]
}

type DayFormErrors = Partial<
  Record<keyof Omit<DayFormValues, "weekday" | "is_working_day">, string>
>

type FormErrors = Partial<
  Record<"branch_id" | "name" | "effective_from" | "effective_until", string>
> & {
  days?: Record<number, DayFormErrors>
}

const WEEKDAYS: Weekday[] = [1, 2, 3, 4, 5, 6, 7]

function emptyDay(weekday: Weekday): DayFormValues {
  return {
    weekday,
    is_working_day: false,
    start_time: "",
    end_time: "",
    check_in_start: "",
    check_in_end: "",
    check_out_start: "",
    check_out_end: "",
    late_tolerance_minutes: "0",
  }
}

function defaultDays(): DayFormValues[] {
  return WEEKDAYS.map((w) => emptyDay(w))
}

function daysFromRow(row: BranchSchedule): DayFormValues[] {
  return WEEKDAYS.map((weekday) => {
    const found = row.days.find((d) => d.weekday === weekday)
    if (!found) return emptyDay(weekday)
    return {
      weekday,
      is_working_day: found.is_working_day,
      start_time: found.start_time ?? "",
      end_time: found.end_time ?? "",
      check_in_start: found.check_in_start ?? "",
      check_in_end: found.check_in_end ?? "",
      check_out_start: found.check_out_start ?? "",
      check_out_end: found.check_out_end ?? "",
      late_tolerance_minutes: String(found.late_tolerance_minutes ?? 0),
    }
  })
}

function initialValues(row: BranchSchedule | null): FormValues {
  if (!row) {
    return {
      branch_id: "",
      name: "",
      effective_from: "",
      effective_until: "",
      days: defaultDays(),
    }
  }
  return {
    branch_id: "", // resolved via BranchFormCombobox.initialBranchName
    name: row.name,
    effective_from: row.effective_from,
    effective_until: row.effective_until ?? "",
    days: daysFromRow(row),
  }
}

const daySchema = yup.object({
  weekday: yup.number().required(),
  is_working_day: yup.boolean().required(),
  start_time: yup.string().when("is_working_day", {
    is: true,
    then: (s) => s.required("Jam mulai wajib diisi."),
  }),
  end_time: yup.string().when("is_working_day", {
    is: true,
    then: (s) => s.required("Jam selesai wajib diisi."),
  }),
  check_in_start: yup.string().optional(),
  check_in_end: yup.string().optional(),
  check_out_start: yup.string().optional(),
  check_out_end: yup.string().optional(),
  late_tolerance_minutes: yup
    .number()
    .typeError("Toleransi harus berupa angka.")
    .min(0, "Toleransi minimal 0 menit.")
    .required("Toleransi wajib diisi."),
})

const scheduleSchema = yup.object({
  branch_id: yup.string().required("Cabang wajib dipilih."),
  name: yup
    .string()
    .required("Nama jadwal wajib diisi.")
    .max(255, "Nama jadwal maksimal 255 karakter."),
  effective_from: yup.string().required("Tanggal efektif wajib diisi."),
  effective_until: yup
    .string()
    .optional()
    .test(
      "is-after-effective-from",
      "Berlaku sampai tidak boleh sebelum tanggal efektif.",
      function (value) {
        const { effective_from } = this.parent
        if (!value || !effective_from) return true
        return new Date(value) >= new Date(effective_from)
      }
    ),
  days: yup.array().of(daySchema).length(7),
})

interface BranchScheduleFormProps {
  mode: "create" | "edit"
  initialRow: BranchSchedule | null
  scheduleId?: string
}

export function BranchScheduleForm({
  mode,
  initialRow,
  scheduleId,
}: BranchScheduleFormProps) {
  const navigate = useNavigate()
  const isEdit = mode === "edit"

  const [values, setValues] = useState<FormValues>(() =>
    initialValues(initialRow)
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function changeField(
    field: "branch_id" | "name" | "effective_from" | "effective_until",
    value: string
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function changeDay(weekday: Weekday, patch: Partial<DayFormValues>) {
    setValues((current) => ({
      ...current,
      days: current.days.map((d) =>
        d.weekday === weekday ? { ...d, ...patch } : d
      ),
    }))
    setErrors((current) => {
      if (!current.days?.[weekday]) return current
      const nextDays = { ...current.days }
      delete nextDays[weekday]
      return { ...current, days: nextDays }
    })
  }

  function toggleWorkingDay(weekday: Weekday, checked: boolean) {
    if (checked) {
      changeDay(weekday, { is_working_day: true })
    } else {
      changeDay(weekday, {
        is_working_day: false,
        start_time: "",
        end_time: "",
        check_in_start: "",
        check_in_end: "",
        check_out_start: "",
        check_out_end: "",
        late_tolerance_minutes: "0",
      })
    }
  }

  function buildPayload(): BranchSchedulePayload {
    const days: BranchScheduleDayPayload[] = values.days.map((d) => ({
      weekday: d.weekday,
      is_working_day: d.is_working_day,
      start_time: d.is_working_day ? d.start_time || null : null,
      end_time: d.is_working_day ? d.end_time || null : null,
      check_in_start: d.is_working_day ? d.check_in_start || null : null,
      check_in_end: d.is_working_day ? d.check_in_end || null : null,
      check_out_start: d.is_working_day ? d.check_out_start || null : null,
      check_out_end: d.is_working_day ? d.check_out_end || null : null,
      late_tolerance_minutes: d.is_working_day
        ? Number(d.late_tolerance_minutes || 0)
        : 0,
    }))

    return {
      branch_id: values.branch_id,
      name: values.name.trim(),
      effective_from: values.effective_from,
      effective_until: values.effective_until || null,
      days,
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    try {
      await scheduleSchema.validate(values, { abortEarly: false })
      setErrors({})
      setIsSubmitting(true)

      const payload = buildPayload()
      const res =
        isEdit && scheduleId
          ? await updateBranchSchedule(scheduleId, payload)
          : await createBranchSchedule(payload)

      navigate("/dashboard/jadwal-cabang", {
        state: {
          alert: {
            type: "success",
            message:
              res.message ||
              (isEdit
                ? "Jadwal cabang berhasil diperbarui."
                : "Jadwal cabang berhasil disimpan."),
          },
        },
      })
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const nextErrors: FormErrors = { days: {} }
        error.inner.forEach((item) => {
          if (!item.path) return
          const dayMatch = item.path.match(/^days\[(\d+)\]\.(.+)$/)
          if (dayMatch) {
            const idx = Number(dayMatch[1])
            const weekday = values.days[idx]?.weekday
            const field = dayMatch[2] as keyof DayFormErrors
            if (weekday && !nextErrors.days![weekday])
              nextErrors.days![weekday] = {}
            if (weekday && !nextErrors.days![weekday][field]) {
              nextErrors.days![weekday][field] = item.message
            }
            return
          }
          const key = item.path as keyof FormErrors
          if (key !== "days" && !nextErrors[key]) {
            ;(nextErrors as Record<string, string>)[key] = item.message
          }
        })
        setErrors(nextErrors)
      } else {
        setSubmitError(
          isEdit
            ? "Gagal memperbarui jadwal cabang."
            : "Gagal menyimpan jadwal cabang."
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageCard>
      <PageCardHeader
        title={isEdit ? "Edit Jadwal Cabang" : "Tambah Jadwal Cabang"}
      />

      <form onSubmit={handleSubmit} className="mt-4 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Cabang" error={errors.branch_id} required>
            <BranchFormCombobox
              value={values.branch_id}
              onChange={(value) => changeField("branch_id", value)}
              error={Boolean(errors.branch_id)}
              initialBranchName={initialRow?.branch_name}
            />
          </Field>
          <Field label="Nama Jadwal" error={errors.name} required>
            <Input
              value={values.name}
              onChange={(e) => changeField("name", e.target.value)}
              placeholder="Contoh: Jadwal Kerja Senin - Sabtu"
              maxLength={255}
              aria-invalid={Boolean(errors.name)}
              className="h-10 rounded-[5px] border-[#DDE3E6]"
            />
          </Field>
          <Field label="Tanggal Efektif" error={errors.effective_from} required>
            <DatePicker
              value={values.effective_from}
              onChange={(value) => changeField("effective_from", value)}
              error={Boolean(errors.effective_from)}
            />
          </Field>
          <Field label="Berlaku Sampai" error={errors.effective_until}>
            <DatePicker
              value={values.effective_until}
              onChange={(value) => changeField("effective_until", value)}
              error={Boolean(errors.effective_until)}
            />
            <span className="mt-1 block text-xs text-[#71808B]">
              Kosongkan jika jadwal berlaku tanpa batas akhir.
            </span>
          </Field>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[#374957]">Hari Kerja</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {values.days.map((day) => (
              <DayCard
                key={day.weekday}
                day={day}
                errors={errors.days?.[day.weekday]}
                onToggle={(checked) => toggleWorkingDay(day.weekday, checked)}
                onChange={(patch) => changeDay(day.weekday, patch)}
              />
            ))}
          </div>
        </div>

        {submitError && <p className="text-sm text-red-500">{submitError}</p>}

        <div className="flex gap-3 border-t border-[#EAEAEA] pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 flex-1 rounded-[5px] border-[#DDE3E6] md:flex-none md:px-8"
            onClick={() => navigate("/dashboard/jadwal-cabang")}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-10 flex-1 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0] md:flex-none md:px-8"
          >
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
            {isEdit ? "Perbarui" : "Simpan"}
          </Button>
        </div>
      </form>
    </PageCard>
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

function TimeInput({
  label,
  value,
  error,
  onChange,
}: {
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-[#71808B]">{label}</span>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className="h-9 rounded-[5px] border-[#DDE3E6] text-sm"
      />
      {error && <span className="block text-xs text-red-500">{error}</span>}
    </label>
  )
}

function DayCard({
  day,
  errors,
  onToggle,
  onChange,
}: {
  day: DayFormValues
  errors?: DayFormErrors
  onToggle: (checked: boolean) => void
  onChange: (patch: Partial<DayFormValues>) => void
}) {
  return (
    <div className="space-y-3 rounded-[5px] border border-[#DDE3E6] p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-[#374957]">
          {WEEKDAY_LABELS[day.weekday]}
        </span>
        <label className="flex items-center gap-2 text-sm text-[#374957]">
          <Checkbox
            checked={day.is_working_day}
            onCheckedChange={(checked) => onToggle(checked === true)}
          />
          Hari Kerja
        </label>
      </div>

      {day.is_working_day && (
        <div className="grid grid-cols-2 gap-3">
          <TimeInput
            label="Jam Mulai"
            value={day.start_time}
            error={errors?.start_time}
            onChange={(v) => onChange({ start_time: v })}
          />
          <TimeInput
            label="Jam Selesai"
            value={day.end_time}
            error={errors?.end_time}
            onChange={(v) => onChange({ end_time: v })}
          />
          <TimeInput
            label="Check-in Mulai"
            value={day.check_in_start}
            onChange={(v) => onChange({ check_in_start: v })}
          />
          <TimeInput
            label="Check-in Selesai"
            value={day.check_in_end}
            onChange={(v) => onChange({ check_in_end: v })}
          />
          <TimeInput
            label="Check-out Mulai"
            value={day.check_out_start}
            onChange={(v) => onChange({ check_out_start: v })}
          />
          <TimeInput
            label="Check-out Selesai"
            value={day.check_out_end}
            onChange={(v) => onChange({ check_out_end: v })}
          />
          <label className="col-span-2 block space-y-1">
            <span className="text-xs text-[#71808B]">
              Toleransi Terlambat (menit)
            </span>
            <Input
              type="number"
              min={0}
              value={day.late_tolerance_minutes}
              onChange={(e) =>
                onChange({ late_tolerance_minutes: e.target.value })
              }
              aria-invalid={Boolean(errors?.late_tolerance_minutes)}
              className="h-9 rounded-[5px] border-[#DDE3E6] text-sm"
            />
            {errors?.late_tolerance_minutes && (
              <span className="block text-xs text-red-500">
                {errors.late_tolerance_minutes}
              </span>
            )}
          </label>
        </div>
      )}
    </div>
  )
}
