import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface PegawaiInfoItem {
  icon: LucideIcon
  label: string
  value: ReactNode
}

interface PegawaiInfoCardProps {
  title: string
  description?: string
  items: PegawaiInfoItem[]
  className?: string
}

export function PegawaiInfoCard({
  title,
  description,
  items,
  className,
}: PegawaiInfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#EAEAEA] bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-[#1C2A33]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-[#8B9AA5]">{description}</p>
        )}
      </div>

      <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#F7FCFA] text-[#0F9D6C]">
              <Icon className="size-4" />
            </span>
            <div className="flex flex-col">
              <dt className="text-xs text-[#8B9AA5]">{label}</dt>
              <dd className="text-sm font-medium break-words text-[#374957]">
                {value || "-"}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  )
}
