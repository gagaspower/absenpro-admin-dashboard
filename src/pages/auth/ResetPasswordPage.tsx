import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Circle, Eye, EyeOff, Lock } from "lucide-react"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import {
  logoutAllRequest,
  resetPasswordRequest,
} from "@/services/auth/auth.service"
import { storage } from "@/lib/storage"

const schema = yup.object({
  password: yup
    .string()
    .required("Password wajib diisi")
    .min(6, "Password minimal 6 karakter")
    .matches(/^[A-Za-z0-9]+$/, "Hanya huruf & angka tanpa spasi"),
  password_confirm: yup
    .string()
    .required("Konfirmasi password wajib diisi")
    .oneOf([yup.ref("password")], "Konfirmasi password tidak cocok"),
})

type FormErrors = Partial<
  Record<"password" | "password_confirm" | "general", string>
>

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)

  const ruleMinLength = password.length >= 6
  const ruleRequired = password.length > 0
  const ruleAlphanumeric = /^[A-Za-z0-9]+$/.test(password)
  const ruleMatch = passwordConfirm.length > 0 && password === passwordConfirm

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setSuccess(false)

    try {
      await schema.validate(
        { password, password_confirm: passwordConfirm },
        { abortEarly: false }
      )
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {}
        for (const e of err.inner) {
          if (e.path === "password" || e.path === "password_confirm") {
            fieldErrors[e.path] = e.message
          }
        }
        setErrors(fieldErrors)
        return
      }
      return
    }

    setIsConfirmDialogOpen(true)
  }

  async function submitReset(logoutAllDevice: boolean) {
    setIsConfirmDialogOpen(false)
    setLoading(true)

    try {
      const response = await resetPasswordRequest({
        password,
        password_confirmation: passwordConfirm,
      })

      if (!response.status) {
        setErrors({ general: response.message || "Reset password gagal" })
        return
      }

      setSuccess(true)
      setPassword("")
      setPasswordConfirm("")

      if (logoutAllDevice) {
        await logoutAllRequest()
        storage.clearAuth()
        setTimeout(() => navigate("/login", { replace: true }), 1500)
        return
      }

      setTimeout(() => navigate("/dashboard", { replace: true }), 1500)
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number }
      }
      const msg =
        axiosError.response?.data?.message ?? "Terjadi kesalahan. Coba lagi."
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageCard className="mx-auto max-w-md">
      <PageCardHeader
        title="Reset Password"
        description="Ubah password akun Anda"
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {errors.general && (
          <p className="rounded-[5px] bg-red-50 px-3 py-2 text-xs text-red-600">
            {errors.general}
          </p>
        )}
        {success && (
          <p className="rounded-[5px] bg-green-50 px-3 py-2 text-xs text-green-600">
            Password berhasil diubah
          </p>
        )}

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center gap-2 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5 ${
              errors.password ? "ring-1 ring-red-400" : ""
            }`}
          >
            <Lock className="size-4 shrink-0 text-slate-800" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password baru"
              autoComplete="new-password"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#989898]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="shrink-0 text-slate-800"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="px-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Password Confirm */}
        <div className="flex flex-col gap-1">
          <div
            className={`flex items-center gap-2 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5 ${
              errors.password_confirm ? "ring-1 ring-red-400" : ""
            }`}
          >
            <Lock className="size-4 shrink-0 text-slate-800" />
            <input
              type={showPasswordConfirm ? "text" : "password"}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Konfirmasi password baru"
              autoComplete="new-password"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#989898]"
            />
            <button
              type="button"
              onClick={() => setShowPasswordConfirm((p) => !p)}
              className="shrink-0 text-slate-800"
              aria-label={
                showPasswordConfirm
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
            >
              {showPasswordConfirm ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password_confirm && (
            <p className="px-1 text-xs text-red-500">
              {errors.password_confirm}
            </p>
          )}
        </div>

        {/* Realtime rules */}
        <ul className="flex flex-col gap-1.5 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5">
          {[
            { label: "Password minimal 6 karakter", ok: ruleMinLength },
            { label: "Wajib diisi", ok: ruleRequired },
            {
              label: "Kombinasi alphanumeric (tanpa simbol / spasi)",
              ok: ruleAlphanumeric,
            },
            { label: "Password & Password Confirm wajib sama", ok: ruleMatch },
          ].map((rule) => (
            <li
              key={rule.label}
              className={`flex items-center gap-2 text-xs ${
                rule.ok ? "text-green-600" : "text-[#989898]"
              }`}
            >
              {rule.ok ? (
                <CheckCircle2 className="size-3.5 shrink-0" />
              ) : (
                <Circle className="size-3.5 shrink-0" />
              )}
              {rule.label}
            </li>
          ))}
        </ul>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-[5px] bg-[#30CCD5] font-normal text-white hover:bg-[#2ab8c0] disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="size-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Memproses...
            </span>
          ) : (
            "Submit"
          )}
        </Button>
      </form>
      {isConfirmDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={() => setIsConfirmDialogOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-reset-title"
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2
              id="confirm-reset-title"
              className="text-base font-semibold text-gray-900"
            >
              Logout dari semua device?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Password akan diubah. Apakah Anda juga ingin logout dari semua
              device lain yang sedang login?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => submitReset(false)}
              >
                Tidak
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => submitReset(true)}
                className="bg-[#30CCD5] text-white hover:bg-[#2ab8c0]"
              >
                Ya, Logout Semua
              </Button>
            </div>
          </section>
        </div>
      )}
    </PageCard>
  )
}

export default ResetPasswordPage
