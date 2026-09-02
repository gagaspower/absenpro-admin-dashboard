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
  record?: AbsensiDayRecord
  isSunday?: boolean
  isHoliday?: boolean
  holidayLabel?: string
  holidayDescription?: string
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

function buildTooltipText(record: AbsensiDayRecord): string | null {
  const {
    status,
    leave_label,
    holiday_label,
    holiday_description,
    check_in,
    check_out,
  } = record
  if (status === "sakit" || status === "izin" || status === "cuti")
    return leave_label ?? ABSENSI_STATUS_META[status].label
  if (status === "hadir" || status === "telat") {
    const parts: string[] = []
    if (check_in) parts.push(`Masuk: ${check_in}`)
    if (check_out) parts.push(`Keluar: ${check_out}`)
    return parts.length ? parts.join(" • ") : ABSENSI_STATUS_META[status].label
  }
  if (status === "alpha") return ABSENSI_STATUS_META.alpha.label
  if (status === "libur")
    return holiday_label
      ? `Libur: ${holiday_label}${holiday_description ? ` — ${holiday_description}` : ""}`
      : ABSENSI_STATUS_META.libur.label
  return null
}

export function AbsensiStatusCell({
  record,
  isSunday,
  isHoliday,
  holidayLabel,
  holidayDescription,
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

  const holidayTooltip =
    isHoliday && holidayLabel
      ? `Libur: ${holidayLabel}${holidayDescription ? ` — ${holidayDescription}` : ""}`
      : null

  const sundayTooltip = isSunday ? "Hari Minggu" : null

  const finalTooltip = holidayTooltip ?? sundayTooltip ?? tooltipText

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center py-3",
        isSunday && "bg-[oklch(44.6%_0.03_256.802)]",
        isHoliday && !isSunday && "bg-[oklch(64.5%_0.246_16.439)]"
      )}
    >
      {finalTooltip ? (
        <Tooltip>
          <TooltipTrigger className="inline-flex cursor-default items-center justify-center border-none bg-transparent p-0">
            {badge}
          </TooltipTrigger>

          <TooltipContent>
            <p className="text-xs">{finalTooltip}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        badge
      )}
    </div>
  )
}
