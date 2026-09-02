import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react"
import * as yup from "yup"

import { Button } from "@/components/ui/button"
import { loginRequest } from "@/services/auth/auth.service"
import { storage } from "@/lib/storage"

const schema = yup.object({
  username: yup.string().required("Username wajib diisi"),
  password: yup
    .string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
})

type FormErrors = Partial<Record<"username" | "password" | "general", string>>

export function LoginPage() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    // Client-side validation
    try {
      await schema.validate({ username, password }, { abortEarly: false })
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const fieldErrors: FormErrors = {}
        for (const e of err.inner) {
          if (e.path === "username" || e.path === "password") {
            fieldErrors[e.path] = e.message
          }
        }
        setErrors(fieldErrors)
        return
      }
    }

    // API call
    setLoading(true)
    try {
      const response = await loginRequest({ username, password })

      if (!response.status) {
        setErrors({ general: response.message || "Login gagal" })
        return
      }

      storage.saveAuth({
        access_token: response.data.access_token,
        user: response.data.user,
        permissions: response.data.permissions,
      })

      navigate("/dashboard", { replace: true })
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
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-gradient-to-br from-[#EAF9FA] via-[#F5FBFC] to-[#EAF1FC] p-6 text-sm">
      {/* Soft decorative glows — purely visual, no layout impact */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-[#30CCD5]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-28 size-80 rounded-full bg-[#5B8DEF]/15 blur-3xl"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-white/60 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#30CCD5] to-[#5B8DEF] shadow-md shadow-[#30CCD5]/30">
            <Fingerprint className="size-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl">
            <span className="font-semibold text-[#1F9DA6]">Absen</span>
            <span className="font-bold text-slate-900">Pro</span>
          </h1>
          <p className="text-xs text-slate-500">
            Masuk untuk melanjutkan ke akun Anda
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* General error */}
          {errors.general && (
            <p
              role="alert"
              className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs text-red-600"
            >
              {errors.general}
            </p>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="px-0.5 text-xs font-medium text-slate-600"
            >
              Username
            </label>
            <div
              className={`flex items-center gap-2.5 rounded-xl border bg-slate-50/80 px-3.5 py-3 transition-colors focus-within:border-[#30CCD5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#30CCD5]/25 ${
                errors.username
                  ? "border-red-300 bg-red-50/40"
                  : "border-slate-200"
              }`}
            >
              <User className="size-4 shrink-0 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukan username"
                autoComplete="username"
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? "username-error" : undefined
                }
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            {errors.username && (
              <p
                id="username-error"
                role="alert"
                className="px-1 text-xs text-red-500"
              >
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="px-0.5 text-xs font-medium text-slate-600"
            >
              Password
            </label>
            <div
              className={`flex items-center gap-2.5 rounded-xl border bg-slate-50/80 px-3.5 py-3 transition-colors focus-within:border-[#30CCD5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#30CCD5]/25 ${
                errors.password
                  ? "border-red-300 bg-red-50/40"
                  : "border-slate-200"
              }`}
            >
              <Lock className="size-4 shrink-0 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                className="w-full border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
              <p
                id="password-error"
                role="alert"
                className="px-1 text-xs text-red-500"
              >
                {errors.password}
              </p>
            )}
          </div>

          <a
            href="#"
            className="self-end text-xs font-medium text-[#1F9DA6] transition-colors hover:text-[#30CCD5] hover:underline"
          >
            Lupa password?
          </a>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[#30CCD5] to-[#5B8DEF] font-medium text-white shadow-md shadow-[#30CCD5]/25 transition-all hover:shadow-lg hover:shadow-[#30CCD5]/30 hover:brightness-105 disabled:opacity-70 disabled:shadow-none"
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
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
