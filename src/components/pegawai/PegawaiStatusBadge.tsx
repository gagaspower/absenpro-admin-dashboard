import { cn } from "@/lib/utils"
import type { PegawaiStatus } from "@/types/pegawai/pegawai.types"

const STATUS_CONFIG: Record<
  PegawaiStatus,
  { label: string; className: string }
> = {
  permanent: {
    label: "Tetap",
    className: "bg-[#E6F9F0] text-[#12A150]",
  },
  contract: {
    label: "Kontrak",
    className: "bg-[#E8F1FE] text-[#2E6FE0]",
  },
  intern: {
    label: "Magang",
    className: "bg-[#FFF4E0] text-[#B9770E]",
  },
  resign: {
    label: "Resign",
    className: "bg-[#FCE8E8] text-[#D64545]",
  },
}

interface PegawaiStatusBadgeProps {
  status: PegawaiStatus
  className?: string
}

export function PegawaiStatusBadge({
  status,
  className,
}: PegawaiStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
