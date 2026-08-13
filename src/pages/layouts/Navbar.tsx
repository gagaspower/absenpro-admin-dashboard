import { Bell, ChevronDown, Home, LogOut, Menu, KeyRound } from "lucide-react"
import { useState } from "react"
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

export function Navbar({ onMenuToggle }: NavbarProps) {
  const breadcrumb = useBreadcrumb()
  const navigate = useNavigate()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState("")

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
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-[#D9D9D9] bg-white px-4 shadow-sm md:px-6">
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-9 w-9 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="size-5" />
        </Button>

        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-sm text-gray-500"
          aria-label="Breadcrumb"
        >
          <Link
            to="/dashboard"
            className="flex items-center transition-colors hover:text-gray-800"
            aria-label="Home"
          >
            <Home className="size-4" />
          </Link>
          <ChevronDown className="size-3.5 -rotate-90 text-gray-400" />
          <span className="font-medium text-gray-700">{breadcrumb}</span>
        </nav>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-2">
        {/* Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full text-gray-500 hover:bg-gray-100"
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
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B8CE5]">
            <Avatar className="h-8 w-8 border border-[#D9D9D9]">
              <AvatarImage src="" alt="John Doe" />
              <AvatarFallback className="bg-gray-200 text-xs font-medium text-gray-600">
                JD
              </AvatarFallback>
            </Avatar>
            <span className="hidden font-medium sm:block">John Doe</span>
            <ChevronDown className="size-3.5 text-gray-400" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-44 rounded-[8px] border-[#D9D9D9] shadow-md"
          >
            <DropdownMenuItem className="cursor-pointer gap-2.5 text-gray-700 hover:text-[#2B8CE5] focus:text-[#2B8CE5]">
              <KeyRound className="size-4" />
              Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#D9D9D9]" />
            <DropdownMenuItem
              className="cursor-pointer gap-2.5 text-red-500 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={openLogoutDialog}
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLogoutDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={() => !isLoggingOut && setIsLogoutDialogOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2
              id="logout-dialog-title"
              className="text-base font-semibold text-gray-900"
            >
              Konfirmasi logout
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Anda yakin ingin keluar dari akun ini?
            </p>

            {logoutError && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {logoutError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => setIsLogoutDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                {isLoggingOut ? "Memproses..." : "Logout"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </header>
  )
}
