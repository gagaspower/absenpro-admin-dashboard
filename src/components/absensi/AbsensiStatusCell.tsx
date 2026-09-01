// src/components/absensi/AbsensiStatusCell.tsx
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  ABSENSI_STATUS_META,
  type AbsensiDayRecord,
  type AttendanceStatus,
} from "@/types/absensi/absensi.types"

interface AbsensiStatusCellProps {
  /** Data absensi 1 hari (status, jam masuk/keluar, label cuti/izin, dst) */
  record?: AbsensiDayRecord
  /** Tandai kolom sebagai hari Minggu (highlight pink, sesuai mockup) */
  isSunday?: boolean
}

const STATUS_STYLE: Record<Exclude<AttendanceStatus, "">, string> = {
  hadir: "bg-[#E7FAF0] text-[#1E9E5E]",
  telat: "bg-[#FFEDD5] text-[#C2410C]",
  sakit: "bg-[#FFF6E0] text-[#B7791F]",
  izin: "bg-[#E7F3FF] text-[#1D6FC2]",
  cuti: "bg-[#F3E8FF] text-[#7C3AED]",
  alpha: "bg-[#FDEAEA] text-[#D4453B]",
  libur: "bg-transparent text-[#B9C2C9]",
}

/** Susun teks tooltip sesuai jenis status. Return null kalau tidak perlu tooltip. */
function buildTooltipText(record: AbsensiDayRecord): string | null {
  const { status, leave_label, check_in, check_out } = record

  switch (status) {
    case "sakit":
    case "izin":
    case "cuti":
      // Prioritaskan nama jenis izin/cuti dari backend (mis. "Cuti Tahunan")
      return leave_label ?? ABSENSI_STATUS_META[status].label

    case "hadir":
    case "telat": {
      const parts: string[] = []
      if (check_in) parts.push(`Masuk: ${check_in}`)
      if (check_out) parts.push(`Keluar: ${check_out}`)
      return parts.length > 0
        ? parts.join(" • ")
        : ABSENSI_STATUS_META[status].label
    }

    case "alpha":
      return ABSENSI_STATUS_META.alpha.label

    default:
      return null
  }
}

export function AbsensiStatusCell({
  record,
  isSunday,
}: AbsensiStatusCellProps) {
  const status = record?.status ?? ""

  const badge = status ? (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
        STATUS_STYLE[status]
      )}
    >
      {ABSENSI_STATUS_META[status].short}
    </span>
  ) : null

  const tooltipText = record ? buildTooltipText(record) : null

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center py-3",
        isSunday && "bg-[#FCEAEE]"
      )}
    >
      {badge &&
        (tooltipText ? (
          <Tooltip>
            <TooltipTrigger className="inline-flex cursor-default items-center justify-center border-none bg-transparent p-0">
              {badge}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          badge
        ))}
    </div>
  )
}
