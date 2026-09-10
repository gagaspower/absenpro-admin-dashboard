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
  label?: string
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
    label: "Master Data",
    items: [
      {
        label: "Departemen",
        path: "/departemen",
        icon: Building2,
        permission: "View Departemen",
      },
      {
        label: "Lokasi Kerja",
        path: "/wilayah-kerja",
        icon: MapPin,
        permission: "View Lokasi Kerja",
      },
      {
        label: "Jabatan",
        path: "/jabatan",
        icon: BriefcaseBusiness,
        permission: "View Jabatan",
      },
      {
        label: "Shift",
        path: "/jam-kerja",
        icon: Clock3,
        permission: "View Shift",
      },
      {
        label: "Jenis Izin",
        path: "/jenis-izin",
        icon: FileCheck2,
        permission: "View Jenis Cuti / Izin",
      },
      {
        label: "Karyawan",
        path: "/karyawan",
        icon: Users,
        permission: "View Karyawan",
      },
      {
        label: "Level Approval",
        path: "/level-approval",
        icon: GitBranch,
        permission: "View Level Approval",
      },
      {
        label: "Hari Libur",
        path: "/hari-libur",
        icon: CalendarDays,
        permission: "View Hari Libur",
      },
      {
        label: "Jadwal Cabang",
        path: "/jadwal-cabang",
        icon: CalendarClock,
        permission: "View Jadwal Cabang",
      },
    ],
  },
  {
    label: "Transaksi",
    items: [
      {
        label: "Absensi",
        path: "/absensi",
        icon: ClipboardCheck,
        permission: "View Absensi",
      },
      {
        label: "Cuti & Izin",
        path: "/cuti-izin",
        icon: FileClock,
        permission: "View Cuti & Izin",
      },
    ],
  },
]
