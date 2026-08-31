import { getLeaveRequestStatusLabel } from "@/types/permohonan_cuti/permohonan_cuti.types"
import type { LeaveRequestStatus } from "@/types/permohonan_cuti/permohonan_cuti.types"
import { LEAVE_STATUS_BADGE_STYLE } from "@/components/permohonan_cuti/format"

interface LeaveRequestStatusBadgeProps {
  status: LeaveRequestStatus | string
}

export function LeaveRequestStatusBadge({
  status,
}: LeaveRequestStatusBadgeProps) {
  const style =
    LEAVE_STATUS_BADGE_STYLE[status as LeaveRequestStatus]?.className ??
    "bg-[#EEF1F3] text-[#71808B]"

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}
    >
      {getLeaveRequestStatusLabel(status)}
    </span>
  )
}
