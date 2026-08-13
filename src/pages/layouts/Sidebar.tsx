import { NavLink } from "react-router-dom"
import type { LucideIcon } from "lucide-react"
import {
  Briefcase,
  Building2,
  Clock,
  Fingerprint,
  FileText,
  Home,
  IdCard,
  ScanLine,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"

type MenuItem = {
  label: string
  to: string
  icon: LucideIcon
}

const mainMenu: MenuItem[] = [
  { label: "Departemen", to: "/dashboard/departemen", icon: Building2 },
  { label: "Wilayah Kerja / Branch", to: "/dashboard/branch", icon: Users },
  { label: "Jabatan", to: "/dashboard/jabatan", icon: Briefcase },
  { label: "Jam Kerja", to: "/dashboard/jam-kerja", icon: Clock },
  { label: "Jenis Izin / Cuti", to: "/dashboard/jenis-izin", icon: FileText },
  { label: "Karyawan", to: "/dashboard/karyawan", icon: IdCard },
]

const absenMenu: MenuItem[] = [
  { label: "Absensi", to: "/dashboard/absensi", icon: ScanLine },
  { label: "Cuti & Izin", to: "/dashboard/cuti-izin", icon: FileText },
]

function NavItem({ to, icon: Icon, label }: MenuItem) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive &&
            "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-svh w-[280px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 text-sidebar-foreground">
      <div className="mb-8 flex items-center gap-2 px-2">
        <Fingerprint className="size-8" strokeWidth={1.5} />
        <span className="text-lg">
          <span className="text-[#30CCD5]">Absen</span>
          <span className="font-bold">Pro</span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <NavItem to="/dashboard" icon={Home} label="Dashboard" />

        <p className="mt-6 mb-1 px-3 text-xs font-medium tracking-wide text-muted-foreground">
          MAIN MENU
        </p>
        {mainMenu.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <p className="mt-6 mb-1 px-3 text-xs font-medium tracking-wide text-muted-foreground">
          ABSEN & CUTI
        </p>
        {absenMenu.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
