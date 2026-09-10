import {
  LayoutDashboard,
  Building2,
  MapPin,
  BriefcaseBusiness,
  Clock3,
  FileCheck2,
  Users,
  GitBranch,
  CalendarDays,
  CalendarClock,
  ClipboardCheck,
  FileClock,
} from "lucide-react"

export interface MenuItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
  permission?: string
}

export interface MenuGroup {
  heading?: string
  items: MenuItem[]
}

export const menuGroups: MenuGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    heading: "Master Data",
    items: [
      {
        label: "Departemen",
        path: "/dashboard/departemen",
        icon: Building2,
        permission: "View Departemen",
      },
      {
        label: "Lokasi Kerja",
        path: "/dashboard/wilayah-kerja",
        icon: MapPin,
        permission: "View Lokasi Kerja",
      },
      {
        label: "Jabatan",
        path: "/dashboard/jabatan",
        icon: BriefcaseBusiness,
        permission: "View Jabatan",
      },
      {
        label: "Shift",
        path: "/dashboard/jam-kerja",
        icon: Clock3,
        permission: "View Shift",
      },
      {
        label: "Jenis Izin",
        path: "/dashboard/jenis-izin",
        icon: FileCheck2,
        permission: "View Jenis Cuti / Izin",
      },
      {
        label: "Karyawan",
        path: "/dashboard/karyawan",
        icon: Users,
        permission: "View Karyawan",
      },
      {
        label: "Level Approval",
        path: "/dashboard/level-approval",
        icon: GitBranch,
        permission: "View Level Approval",
      },
      {
        label: "Hari Libur",
        path: "/dashboard/hari-libur",
        icon: CalendarDays,
        permission: "View Hari Libur",
      },
      {
        label: "Jadwal Cabang",
        path: "/dashboard/jadwal-cabang",
        icon: CalendarClock,
        permission: "View Jadwal Cabang",
      },
    ],
  },
  {
    heading: "Transaksi",
    items: [
      {
        label: "Absensi",
        path: "/dashboard/absensi",
        icon: ClipboardCheck,
        permission: "View Absensi",
      },
      {
        label: "Cuti & Izin",
        path: "/dashboard/cuti-izin",
        icon: FileClock,
        permission: "View Cuti & Izin",
      },
    ],
  },
]
