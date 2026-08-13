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
    <div className="flex min-h-svh items-center justify-center bg-[#F7FCFA] p-6 text-sm">
      <div className="w-full max-w-sm rounded-[10px] bg-white p-8 shadow-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <Fingerprint className="size-12 text-slate-800" strokeWidth={1.5} />
          <h1 className="text-lg">
            <span className="text-[#30CCD5]">Absen</span>
            <span className="font-bold text-black">Pro</span>
            <span className="text-black"> Login</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          noValidate
        >
          {/* General error */}
          {errors.general && (
            <p className="rounded-[5px] bg-red-50 px-3 py-2 text-xs text-red-600">
              {errors.general}
            </p>
          )}

          {/* Username */}
          <div className="flex flex-col gap-1">
            <div
              className={`flex items-center gap-2 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5 ${
                errors.username ? "ring-1 ring-red-400" : ""
              }`}
            >
              <User className="size-4 shrink-0 text-slate-800" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukan Username"
                autoComplete="username"
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#989898]"
              />
            </div>
            {errors.username && (
              <p className="px-1 text-xs text-red-500">{errors.username}</p>
            )}
          </div>

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
                placeholder="Masukan password"
                autoComplete="current-password"
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

          <a href="#" className="self-end text-xs text-[#30CCD5]">
            Lupa password?
          </a>

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
              "Masuk"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
