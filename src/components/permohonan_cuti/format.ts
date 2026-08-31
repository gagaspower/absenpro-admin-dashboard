import type { LeaveRequestStatus } from "@/types/permohonan_cuti/permohonan_cuti.types"

/**
 * Backend ngirim datetime dalam 2 format berbeda tergantung field:
 * - "2026-08-28 13:36:42"       (applied_at, decided_at, acted_at, dll)
 * - "2026-08-28T06:36:42.000000Z" (created_at, updated_at, ISO/UTC)
 * Dua-duanya bisa langsung di-parse oleh `new Date(...)`.
 */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-"
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-"
  const date = new Date(value.includes("T") ? value : value.replace(" ", "T"))
  if (Number.isNaN(date.getTime())) return "-"

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

export function formatTotalDays(value: string | null | undefined): string {
  if (!value) return "-"
  const num = Number(value)
  if (Number.isNaN(num)) return value
  const trimmed = num % 1 === 0 ? num.toString() : num.toString()
  return `${trimmed} hari`
}

export const LEAVE_STATUS_BADGE_STYLE: Record<
  LeaveRequestStatus,
  { className: string }
> = {
  draft: { className: "bg-[#EEF1F3] text-[#71808B]" },
  pending: { className: "bg-[#FFF6E5] text-[#B6810F]" },
  approve: { className: "bg-[#E6F8EF] text-[#1B8A5A]" },
  rejected: { className: "bg-[#FDEBEC] text-[#D6444B]" },
  cancelled: { className: "bg-[#F1F1F1] text-[#8A8F94]" },
}
