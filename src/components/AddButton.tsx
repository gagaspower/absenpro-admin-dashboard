import type { ButtonHTMLAttributes } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button label. Defaults to "Tambah". */
  label?: string
}

/**
 * Reusable "Tambah" (Add) button.
 * Styling is copied 1:1 from the Tambah button used in BranchPage.tsx.
 *
 * Usage:
 *   <AddButton onClick={() => setDrawerOpen(true)} />
 *   <AddButton label="Tambah Wilayah" onClick={...} />
 */
export function AddButton({
  label = "Tambah",
  className,
  type = "button",
  ...props
}: AddButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      className={cn(
        "h-10 gap-2 rounded-[5px] border-[#EAEAEA] bg-white text-sm font-normal text-[#374957] hover:bg-gray-50",
        className
      )}
      {...props}
    >
      <Plus className="size-4" />
      {label}
    </Button>
  )
}
