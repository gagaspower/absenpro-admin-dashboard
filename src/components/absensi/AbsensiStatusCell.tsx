import { cn } from "@/lib/utils"
import {
  ABSENSI_STATUS_META,
  type AttendanceStatus,
} from "@/types/absensi/absensi.types"

interface AbsensiStatusCellProps {
  status: AttendanceStatus
  /** Tandai kolom sebagai hari Minggu (highlight pink, sesuai mockup) */
  isSunday?: boolean
}

const STATUS_STYLE: Record<Exclude<AttendanceStatus, "">, string> = {
  hadir: "bg-[#E7FAF0] text-[#1E9E5E]",
  sakit: "bg-[#FFF6E0] text-[#B7791F]",
  izin: "bg-[#E7F3FF] text-[#1D6FC2]",
  alpha: "bg-[#FDEAEA] text-[#D4453B]",
  libur: "bg-transparent text-[#B9C2C9]",
}

export function AbsensiStatusCell({
  status,
  isSunday,
}: AbsensiStatusCellProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center py-3",
        isSunday && "bg-[#FCEAEE]"
      )}
    >
      {status && (
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
            STATUS_STYLE[status]
          )}
        >
          {ABSENSI_STATUS_META[status].short}
        </span>
      )}
    </div>
  )
}
