import { useEffect, useState } from "react"
import * as yup from "yup"
import { LoaderCircle, X } from "lucide-react"

import { BranchMapPreview } from "@/components/branch/BranchMapPreview"
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
import { createBranch, updateBranch } from "@/services/branch/branch.service"
import type {
  BranchRow,
  CreateBranchPayload,
} from "@/types/branch/branch.types"

type FormValues = {
  name: string
  address: string
  latitude: string
  longitude: string
  radius_meter: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

interface SubmitAlert {
  type: AlertModalType
  message: string
}

const EMPTY_VALUES: FormValues = {
  name: "",
  address: "",
  latitude: "",
  longitude: "",
  radius_meter: "",
}

const branchSchema = yup.object({
  name: yup
    .string()
    .required("Nama cabang wajib diisi.")
    .max(255, "Nama cabang maksimal 255 karakter."),
  address: yup.string().optional(),
  latitude: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("Latitude harus berupa angka.")
    .required("Latitude wajib diisi.")
    .min(-90, "Latitude harus berada di antara -90 sampai 90.")
    .max(90, "Latitude harus berada di antara -90 sampai 90."),
  longitude: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("Longitude harus berupa angka.")
    .required("Longitude wajib diisi.")
    .min(-180, "Longitude harus berada di antara -180 sampai 180.")
    .max(180, "Longitude harus berada di antara -180 sampai 180."),
  radius_meter: yup
    .number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError("Radius area harus berupa angka bulat.")
    .required("Radius area wajib diisi.")
    .integer("Radius area harus berupa angka bulat.")
    .min(1, "Radius area minimal 1 meter."),
})

function initialValues(branch: BranchRow | null): FormValues {
  return branch
    ? {
        name: branch.name,
        address: branch.address ?? "",
        latitude: branch.latitude,
        longitude: branch.longitude,
        radius_meter: String(branch.radius_meter),
      }
    : EMPTY_VALUES
}

interface BranchFormDrawerProps {
  open: boolean
  branch: BranchRow | null
  onOpenChange: (open: boolean) => void
  onCreated: (message: string) => void
}

export function ShiftFormDrawer({
  open,
  branch,
  onOpenChange,
  onCreated,
}: BranchFormDrawerProps) {
  const isMobile = useMobile()
  const isEdit = branch !== null
  const [values, setValues] = useState<FormValues>(() => initialValues(branch))
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitAlert, setSubmitAlert] = useState<SubmitAlert | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setValues(initialValues(branch))
    setErrors({})
    setSubmitAlert(null)
  }, [branch])

  function changeValue(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setSubmitAlert(null)
    try {
      await branchSchema.validate(values, {
        abortEarly: false,
      })
      setErrors({})
      setIsSubmitting(true)
      const payload: CreateBranchPayload = {
        name: values.name.trim(),
        latitude: values.latitude.trim(),
        longitude: values.longitude.trim(),
        radius_meter: Number(values.radius_meter),
        ...(values.address.trim() ? { address: values.address.trim() } : {}),
      }

      const response = isEdit
        ? await updateBranch(branch!.id, payload)
        : await createBranch(payload)

      if (!response.success) throw new Error(response.message)

      onOpenChange(false)
      onCreated(response.message || "Lokasi kerja berhasil disimpan.")
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
              : "Gagal menyimpan lokasi kerja. Coba lagi.",
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
                {isEdit ? "Edit Lokasi Kerja" : "Tambah Lokasi Kerja"}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {isEdit
                  ? "Perbarui detail lokasi kerja."
                  : "Lengkapi data lokasi kerja dan area absensi."}
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
            <Field label="Nama Lokasi" error={errors.name} required>
              <Input
                value={values.name}
                onChange={(event) => changeValue("name", event.target.value)}
                placeholder="Contoh: Kantor Pusat"
                maxLength={255}
                aria-invalid={Boolean(errors.name)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <Field label="Alamat" error={errors.address}>
              <textarea
                value={values.address}
                onChange={(event) => changeValue("address", event.target.value)}
                placeholder="Alamat lengkap (opsional)"
                className="min-h-20 w-full rounded-[5px] border border-[#DDE3E6] bg-white px-3 py-2 text-sm text-[#374957] outline-none placeholder:text-gray-400 focus:border-[#30CCD5] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Latitude" error={errors.latitude} required>
                <Input
                  value={values.latitude}
                  onChange={(event) =>
                    changeValue("latitude", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="-6.2088"
                  aria-invalid={Boolean(errors.latitude)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
              <Field label="Longitude" error={errors.longitude} required>
                <Input
                  value={values.longitude}
                  onChange={(event) =>
                    changeValue("longitude", event.target.value)
                  }
                  inputMode="decimal"
                  placeholder="106.8456"
                  aria-invalid={Boolean(errors.longitude)}
                  className="h-10 rounded-[5px] border-[#DDE3E6]"
                />
              </Field>
            </div>
            <Field
              label="Radius Area (meter)"
              error={errors.radius_meter}
              required
            >
              <Input
                value={values.radius_meter}
                onChange={(event) =>
                  changeValue("radius_meter", event.target.value)
                }
                inputMode="numeric"
                placeholder="Contoh: 100"
                aria-invalid={Boolean(errors.radius_meter)}
                className="h-10 rounded-[5px] border-[#DDE3E6]"
              />
            </Field>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#374957]">Preview Area</p>
              <BranchMapPreview
                latitude={values.latitude}
                longitude={values.longitude}
                radiusMeter={values.radius_meter}
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
