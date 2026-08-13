import { useLocation } from "react-router-dom"
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  KeyRound,
  LogOut,
  Menu,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  departemen: "Departemen",
  branch: "Wilayah Kerja / Branch",
  jabatan: "Jabatan",
  "jam-kerja": "Jam Kerja",
  "jenis-izin": "Jenis Izin / Cuti",
  karyawan: "Karyawan",
  absensi: "Absensi",
  "cuti-izin": "Cuti & Izin",
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation()
  const segment =
    location.pathname.split("/").filter(Boolean).pop() ?? "dashboard"
  const currentTitle = pageTitles[segment] ?? "Dashboard"

  function handleResetPassword() {
    // TODO: hook up reset password flow
  }

  function handleLogout() {
    // TODO: hook up logout request
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-5" />
        </Button>

        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Home className="size-4" />
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{currentTitle}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full border border-border"
          aria-label="Notifikasi"
        >
          <Bell className="size-4" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="gap-2 rounded-full pr-1">
              <Avatar className="size-8">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">John Doe</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-1">
            <Button
              variant="ghost"
              onClick={handleResetPassword}
              className="w-full justify-start gap-2 px-2.5 font-normal"
            >
              <KeyRound className="size-4" />
              Reset Password
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2 px-2.5 font-normal text-destructive hover:text-destructive"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
}

export default Navbar
