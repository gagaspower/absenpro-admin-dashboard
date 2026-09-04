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
  ListChecks,
  PartyPopper,
  CalendarClock,
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
    heading: "Master Data",
    items: [
      { label: "Departemen", path: "/dashboard/departemen", icon: Building2 },
      {
        label: "Lokasi kerja",
        path: "/dashboard/wilayah-kerja",
        icon: MapPin,
      },
      { label: "Jabatan", path: "/dashboard/jabatan", icon: Briefcase },
      { label: "Shift", path: "/dashboard/jam-kerja", icon: Clock },
      {
        label: "Jenis Izin / Cuti",
        path: "/dashboard/jenis-izin",
        icon: FileText,
      },
      { label: "Karyawan", path: "/dashboard/karyawan", icon: Users },
      {
        label: "Level Approval",
        path: "/dashboard/level-approval",
        icon: ListChecks,
      },
      {
        label: "Hari Libur",
        path: "/dashboard/hari-libur",
        icon: PartyPopper,
      },
      {
        label: "Jadwal Cabang",
        path: "/dashboard/jadwal-cabang",
        icon: CalendarClock,
      },
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
