import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function PageCard({ children, className, ...props }: PageCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#F1F3F2] bg-[#FEFEFE] p-5 shadow-[0_2px_8px_rgba(16,24,40,0.04)] transition-shadow duration-200 md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface PageCardHeaderProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageCardHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageCardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-3 border-b border-[#F5F6F5] pb-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div>
        <h2 className="text-base font-semibold text-[#2E3A46]">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
