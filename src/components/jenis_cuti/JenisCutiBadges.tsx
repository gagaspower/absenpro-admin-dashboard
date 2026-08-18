// src/components/jenis_cuti/JenisCutiBadges.tsx
import { cn } from "@/lib/utils"

interface BooleanBadgeProps {
  value: boolean
  trueLabel: string
  falseLabel: string
}

function BooleanBadge({ value, trueLabel, falseLabel }: BooleanBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        value ? "bg-[#E6F9F0] text-[#1D9A6C]" : "bg-[#F2F4F5] text-[#71808B]"
      )}
    >
      {value ? trueLabel : falseLabel}
    </span>
  )
}

export function IsPaidBadge({ value }: { value: boolean }) {
  return (
    <BooleanBadge
      value={value}
      trueLabel="Berbayar"
      falseLabel="Tidak Berbayar"
    />
  )
}

export function DeductQuotaBadge({ value }: { value: boolean }) {
  return (
    <BooleanBadge
      value={value}
      trueLabel="Potong Kuota"
      falseLabel="Tidak Potong Kuota"
    />
  )
}

export function RequiresAttachmentBadge({ value }: { value: boolean }) {
  return (
    <BooleanBadge
      value={value}
      trueLabel="Wajib Lampiran"
      falseLabel="Tanpa Lampiran"
    />
  )
}
