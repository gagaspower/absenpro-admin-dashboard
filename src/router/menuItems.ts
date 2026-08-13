import {
  LayoutDashboard,
  Building2,
  MapPin,
  Briefcase,
  Clock,
  FileText,
  Users,
  ScanLine,
  CalendarOff,
  type LucideIcon,
} from "lucide-react"

export interface MenuItem {
  label: string
  path: string
  icon: LucideIcon
}

export interface MenuGroup {
  heading?: string
  items: MenuItem[]
}

export const menuGroups: MenuGroup[] = [
  {
    items: [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Main Menu",
    items: [
      { label: "Departemen", path: "/dashboard/departemen", icon: Building2 },
      {
        label: "Wilayah Kerja / Branch",
        path: "/dashboard/wilayah-kerja",
        icon: MapPin,
      },
      { label: "Jabatan", path: "/dashboard/jabatan", icon: Briefcase },
      { label: "Jam Kerja", path: "/dashboard/jam-kerja", icon: Clock },
      {
        label: "Jenis Izin / Cuti",
        path: "/dashboard/jenis-izin",
        icon: FileText,
      },
      { label: "Karyawan", path: "/dashboard/karyawan", icon: Users },
    ],
  },
  {
    heading: "Absen & Cuti",
    items: [
      { label: "Absensi", path: "/dashboard/absensi", icon: ScanLine },
      { label: "Cuti & Izin", path: "/dashboard/cuti-izin", icon: CalendarOff },
    ],
  },
]
