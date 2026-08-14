import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
  className?: string
}

/**
 * Badge status generik. Default: Aktif / Tidak Aktif.
 * Bisa dipakai ulang utk tabel master data lain dgn label custom.
 */
export function StatusBadge({
  active,
  activeLabel = "Aktif",
  inactiveLabel = "Tidak Aktif",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] px-3 py-1 text-xs font-medium",
        active ? "bg-[#cce5ff] text-[#004085]" : "bg-[#f8d7da] text-[#721c24]",
        className
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}
