import type { ComponentType } from "react"
import { Ban, CheckCircle2, Clock3, FileText, XCircle } from "lucide-react"

import {
  LEAVE_REQUEST_STATUS_OPTIONS,
  type LeaveRequestStatus,
  type LeaveRequestStatusCounts,
} from "@/types/permohonan_cuti/permohonan_cuti.types"

// ─────────────────────────────────────────────────────────────────────────
// Meta icon & warna per status
// Warna disamakan persis dengan LEAVE_STATUS_BADGE_STYLE (format.ts) biar
// konsisten sama badge status di tabel.
// ─────────────────────────────────────────────────────────────────────────

interface StatusMeta {
  icon: ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
}

const STATUS_META: Record<LeaveRequestStatus, StatusMeta> = {
  draft: {
    icon: FileText,
    iconBg: "bg-[#EEF1F3]",
    iconColor: "text-[#71808B]",
  },
  pending: {
    icon: Clock3,
    iconBg: "bg-[#FFF6E5]",
    iconColor: "text-[#B6810F]",
  },
  approve: {
    icon: CheckCircle2,
    iconBg: "bg-[#E6F8EF]",
    iconColor: "text-[#1B8A5A]",
  },
  rejected: {
    icon: XCircle,
    iconBg: "bg-[#FDEBEC]",
    iconColor: "text-[#D6444B]",
  },
  cancelled: {
    icon: Ban,
    iconBg: "bg-[#F1F1F1]",
    iconColor: "text-[#8A8F94]",
  },
}

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

interface PermohonanCutiStatusCountsProps {
  counts: Partial<LeaveRequestStatusCounts> | null | undefined
  isLoading?: boolean
}

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────

export function PermohonanCutiStatusCounts({
  counts,
  isLoading,
}: PermohonanCutiStatusCountsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {LEAVE_REQUEST_STATUS_OPTIONS.map((option) => {
        const meta = STATUS_META[option.value]
        const Icon = meta.icon
        const value = counts?.[option.value] ?? 0

        return (
          <div
            key={option.value}
            className="flex items-center gap-3 rounded-[5px] border border-[#EAEAEA] bg-white px-4 py-3"
          >
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${meta.iconBg} ${meta.iconColor}`}
            >
              <Icon className="size-5" />
            </span>

            <div className="min-w-0">
              <p className="text-lg leading-tight font-semibold text-[#374957]">
                {isLoading ? "-" : value}
              </p>
              <p className="truncate text-xs text-[#71808B]">{option.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
