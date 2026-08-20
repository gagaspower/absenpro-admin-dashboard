import { cn } from "@/lib/utils"

const SIZE_MAP = {
  sm: {
    ring: "size-8",
    border: "border-2",
    gap: "gap-2",
    text: "text-xs",
    dot: "size-1",
  },
  md: {
    ring: "size-12",
    border: "border-2",
    gap: "gap-3",
    text: "text-sm",
    dot: "size-1.5",
  },
  lg: {
    ring: "size-16",
    border: "border-[3px]",
    gap: "gap-4",
    text: "text-base",
    dot: "size-2",
  },
} as const

type SpinnerSize = keyof typeof SIZE_MAP

interface LoadingSpinnerProps {
  /** Text under the spinner. Defaults to the standard loading copy. */
  label?: string
  /** Hide the label entirely (e.g. inline usage inside a button). */
  showLabel?: boolean
  size?: SpinnerSize
  className?: string
}

/**
 * Reusable animated loading spinner (dual rotating rings + pulsing core +
 * bouncing-dot label). Pure Tailwind utility classes only — no custom
 * keyframes/config needed, safe to drop in anywhere.
 *
 * Usage:
 *   <LoadingSpinner />
 *   <LoadingSpinner label="Menyimpan..." size="sm" showLabel={false} />
 */
export function LoadingSpinner({
  label = "Sedang memuat data",
  showLabel = true,
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const s = SIZE_MAP[size]

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center",
        s.gap,
        className
      )}
    >
      <div className={cn("relative flex items-center justify-center", s.ring)}>
        {/* static track */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-[#EAEAEA]",
            s.border
          )}
        />

        {/* fast outer arc */}
        <div
          className={cn(
            "absolute inset-0 animate-spin rounded-full border-transparent border-t-primary border-r-primary",
            s.border
          )}
          style={{ animationDuration: "0.8s" }}
        />

        {/* slow counter-rotating arc, adds depth */}
        <div
          className={cn(
            "absolute inset-1 animate-spin rounded-full border-transparent border-b-primary/40",
            s.border
          )}
          style={{ animationDuration: "1.4s", animationDirection: "reverse" }}
        />

        {/* pulsing core */}
        <span className="relative flex size-1.5 items-center justify-center rounded-full bg-primary">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
        </span>
      </div>

      {showLabel && (
        <div className={cn("flex items-center gap-1 text-gray-400", s.text)}>
          <span>{label}</span>
        </div>
      )}

      <span className="sr-only">{label}</span>
    </div>
  )
}

export default LoadingSpinner
