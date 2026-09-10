import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"

export interface BulkActionOption {
  value: string
  label: string
  permission?: string
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

export function BulkActionBar({
  options,
  value,
  onValueChange,
  onSubmit,
  disabled,
  placeholder = "Bulk Action",
  className,
}: BulkActionBarProps) {
  const { hasPermission } = useAuth()

  const allowedOptions = options.filter(
    (option) => !option.permission || hasPermission(option.permission)
  )

  if (allowedOptions.length === 0) {
    return null
  }

  const selectedOption = allowedOptions.find((option) => option.value === value)

  return (
    <div className={cn("flex items-stretch gap-2", className)}>
      <Select
        value={selectedOption ? value : ""}
        onValueChange={(nextValue) => onValueChange(nextValue ?? "")}
      >
        <SelectTrigger className="!h-10 w-44 shrink-0 rounded-[5px] border-[#D9D9D9] py-0 text-sm text-[#374957] focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label ?? placeholder}
          </SelectValue>
        </SelectTrigger>

        <SelectContent>
          {allowedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type="button"
        disabled={disabled || !selectedOption}
        onClick={onSubmit}
        className="!h-10 shrink-0 rounded-[5px] border-0 bg-[#EEEEEE] px-5 py-0 text-sm font-normal text-[#374957] hover:bg-[#e2e2e2] disabled:opacity-60"
      >
        Submit
      </Button>
    </div>
  )
}
