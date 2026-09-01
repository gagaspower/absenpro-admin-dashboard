import type {
  AbsensiDayRecord,
  AbsensiListResponse,
  AbsensiRow,
  AttendanceStatus,
} from "@/types/absensi/absensi.types"

// ---------------------------------------------------------------------------
// NOTE: Ini masih data dummy (belum terhubung ke API).
// Nanti tinggal ganti isi fungsi `fetchAbsensi` dengan pemanggilan
// `api.get("api/reference/absensi", { params })` sesuai kontrak backend.
// ---------------------------------------------------------------------------

export interface FetchAbsensiParams {
  month: number
  year: number
  search?: string
  department_id?: string
  branch_id?: string
}

const DUMMY_EMPLOYEES: {
  code: string
  name: string
  position: string
  department: string
}[] = [
  {
    code: "EMP001",
    name: "Budi Santoso",
    position: "Staff Produksi",
    department: "Produksi",
  },
  {
    code: "EMP002",
    name: "Siti Aminah",
    position: "Staff Gudang",
    department: "Logistik",
  },
  {
    code: "EMP003",
    name: "Agus Prasetyo",
    position: "Supervisor",
    department: "Produksi",
  },
  {
    code: "EMP004",
    name: "Dewi Lestari",
    position: "Admin HR",
    department: "HRD",
  },
  {
    code: "EMP005",
    name: "Rudi Hartono",
    position: "Teknisi",
    department: "Maintenance",
  },
  {
    code: "EMP006",
    name: "Nurul Fadilah",
    position: "Staff Finance",
    department: "Keuangan",
  },
  {
    code: "EMP007",
    name: "Eko Wibowo",
    position: "Security",
    department: "Umum",
  },
  {
    code: "EMP008",
    name: "Rina Marlina",
    position: "Staff QC",
    department: "Produksi",
  },
  {
    code: "EMP009",
    name: "Hendra Gunawan",
    position: "Driver",
    department: "Logistik",
  },
  {
    code: "EMP010",
    name: "Yuni Kartika",
    position: "Staff Purchasing",
    department: "Umum",
  },
  {
    code: "EMP011",
    name: "Fajar Setiawan",
    position: "Operator Mesin",
    department: "Produksi",
  },
  {
    code: "EMP012",
    name: "Lina Marlina",
    position: "Resepsionis",
    department: "Umum",
  },
]

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate()
}

function isWeekend(day: number, month: number, year: number): boolean {
  const dow = new Date(year, month - 1, day).getDay()
  return dow === 0 || dow === 6
}

function randomWeekdayStatus(): AttendanceStatus {
  const roll = Math.random()
  if (roll < 0.86) return "hadir"
  if (roll < 0.92) return "izin"
  if (roll < 0.97) return "sakit"
  return "alpha"
}

function generateDays(month: number, year: number): AbsensiDayRecord[] {
  const daysInMonth = getDaysInMonth(month, year)
  const today = new Date()
  const isCurrentMonth =
    today.getMonth() + 1 === month && today.getFullYear() === year

  return Array.from({ length: daysInMonth }, (_, i) => {
    const date = i + 1
    const isFuture = isCurrentMonth && date > today.getDate()

    let status: AttendanceStatus = ""
    if (!isFuture) {
      status = isWeekend(date, month, year) ? "libur" : randomWeekdayStatus()
    }

    return {
      date,
      status,
      ...(status === "hadir" ? { check_in: "07:55", check_out: "16:10" } : {}),
    }
  })
}

export async function fetchAbsensi(
  params: FetchAbsensiParams
): Promise<AbsensiListResponse> {
  // Simulasi delay network supaya loading state kelihatan natural.
  await new Promise((resolve) => setTimeout(resolve, 300))

  const daysInMonth = getDaysInMonth(params.month, params.year)

  let rows: AbsensiRow[] = DUMMY_EMPLOYEES.map((emp, index) => ({
    id: String(index + 1),
    employee_id: emp.code,
    employee_code: emp.code,
    employee_name: emp.name,
    position_name: emp.position,
    department_name: emp.department,
    days: generateDays(params.month, params.year),
  }))

  if (params.search) {
    const q = params.search.toLowerCase()
    rows = rows.filter((row) => row.employee_name.toLowerCase().includes(q))
  }

  if (params.department_id && params.department_id !== "all") {
    rows = rows.filter((row) => row.department_name === params.department_id)
  }

  return {
    total: rows.length,
    rows,
    days_in_month: daysInMonth,
  }
}
