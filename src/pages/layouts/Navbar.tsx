import { Bell, ChevronDown, Home, LogOut, Menu, KeyRound } from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { menuGroups } from "@/router/menuItems"
import { logoutRequest } from "@/services/auth/auth.service"
import { storage } from "@/lib/storage"
import { BACKEND_URL } from "@/lib/config"

interface NavbarProps {
  onMenuToggle: () => void
}

function useBreadcrumb() {
  const location = useLocation()
  const allItems = menuGroups.flatMap((g) => g.items)

  const matched = allItems.find((item) => {
    if (item.path === "/dashboard") return location.pathname === "/dashboard"
    return location.pathname.startsWith(item.path)
  })

  return matched?.label ?? "Dashboard"
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const breadcrumb = useBreadcrumb()
  const navigate = useNavigate()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState("")

  const auth = storage.getAuth()
  const employee = auth?.user.employee
  const fullName = employee?.full_name ?? "User"
  const avatarUrl = employee?.face_profile?.reference_photo_path
    ? `${BACKEND_URL}/storage/${employee.face_profile.reference_photo_path}`
    : undefined

  const initials = getInitials(fullName)

  function openLogoutDialog() {
    setLogoutError("")
    setIsLogoutDialogOpen(true)
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError("")

    try {
      const response = await logoutRequest()
      if (!response.status) {
        setLogoutError(response.message || "Logout gagal. Silakan coba lagi.")
        return
      }

      storage.clearAuth()
      navigate("/login", { replace: true })
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setLogoutError(
        axiosError.response?.data?.message ||
          "Terjadi kesalahan saat logout. Silakan coba lagi."
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 shadow-[0_1px_12px_-4px_rgba(15,23,42,0.06)] backdrop-blur-sm md:px-6">
        {/* Left: hamburger + breadcrumb */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="h-9 w-9 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="size-5" />
          </Button>

          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1.5 text-sm text-slate-500"
            aria-label="Breadcrumb"
          >
            <Link
              to="/dashboard"
              className="flex items-center transition-colors hover:text-[#1F9DA6]"
              aria-label="Home"
            >
              <Home className="size-4" />
            </Link>
            <ChevronDown className="size-3.5 -rotate-90 text-slate-300" />
            <span className="font-medium text-slate-700">{breadcrumb}</span>
          </nav>
        </div>

        {/* Right: bell + user */}
        <div className="flex items-center gap-2">
          {/* Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100"
            aria-label="Notifikasi"
          >
            <Bell className="size-5" />
            <span className="absolute top-1.5 right-1.5 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
          </Button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1 text-sm text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#30CCD5]/40">
              <Avatar className="h-8 w-8 border border-slate-200">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-[#30CCD5] to-[#5B8DEF] text-xs font-medium text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden font-medium sm:block">{fullName}</span>
              <ChevronDown className="size-3.5 text-slate-400" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-slate-200 p-1.5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.10)]"
            >
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg text-slate-700 hover:text-[#1F9DA6] focus:bg-[#EAF9FA] focus:text-[#1F9DA6]"
                onClick={() => navigate("/dashboard/reset-password")}
              >
                <KeyRound className="size-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200" />
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg text-red-500 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                onClick={openLogoutDialog}
              >
                <LogOut className="size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {isLogoutDialogOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
            role="presentation"
            onMouseDown={() => !isLoggingOut && setIsLogoutDialogOpen(false)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-dialog-title"
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.14)]"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2
                id="logout-dialog-title"
                className="text-base font-semibold text-slate-900"
              >
                Konfirmasi logout
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Anda yakin ingin keluar dari akun ini?
              </p>

              {logoutError && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
                >
                  {logoutError}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoggingOut}
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-70"
                >
                  {isLoggingOut ? "Memproses..." : "Logout"}
                </Button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </>
  )
}
