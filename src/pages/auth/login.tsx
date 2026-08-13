import { useState, type FormEvent } from "react"
import { Eye, EyeOff, Fingerprint, Lock, User } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // TODO: hook up auth request
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5">
            <User className="size-4 shrink-0 text-slate-800" />
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Masukan Username"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#989898]"
            />
          </div>

          <div className="flex items-center gap-2 rounded-[5px] bg-[#F7FCFA] px-3 py-2.5">
            <Lock className="size-4 shrink-0 text-slate-800" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukan password"
              className="w-full border-none bg-transparent text-sm outline-none placeholder:text-[#989898]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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

          <a href="#" className="self-end text-xs text-[#30CCD5]">
            Lupa password?
          </a>

          <Button
            type="submit"
            className="h-11 w-full rounded-[5px] bg-[#30CCD5] font-normal text-white hover:bg-[#2ab8c0]"
          >
            Masuk
          </Button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
