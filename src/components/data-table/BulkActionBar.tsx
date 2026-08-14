import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface BulkActionOption {
  value: string
  label: string
}

interface BulkActionBarProps {
  options: BulkActionOption[]
  value: string
  onValueChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

/**
 * Bulk action bar generik: combobox pilihan aksi + tombol submit.
 * Dipakai di atas tabel (sisi kiri). Reusable utk semua tabel master data,
 * cukup ganti `options`.
 */
export function BulkActionBar({
  options,
  value,
  onValueChange,
  onSubmit,
  disabled,
  placeholder = "Bulk Action",
  className,
}: BulkActionBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      >
        <SelectTrigger className="h-10 w-44 rounded-[5px] border-[#D9D9D9] text-sm text-[#374957] focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder={placeholder}>
            {options.find((opt) => opt.value === value)?.label ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        disabled={disabled || !value}
        onClick={onSubmit}
        className="h-10 rounded-[5px] border-0 bg-[#EEEEEE] px-5 text-sm font-normal text-[#374957] hover:bg-[#e2e2e2] disabled:opacity-60"
      >
        Submit
      </Button>
    </div>
  )
}
