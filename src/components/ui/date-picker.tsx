import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value: string // format yyyy-MM-dd, "" kalau belum dipilih
  onChange: (value: string) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  error = false,
  disabled = false,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const parsedDate = value ? new Date(`${value}T00:00:00`) : undefined
  const selectedDate =
    parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            aria-invalid={error}
            className={cn(
              "h-10 w-full justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal disabled:cursor-not-allowed disabled:opacity-60",
              selectedDate ? "text-[#374957]" : "text-gray-400",
              error && "border-red-500"
            )}
          />
        }
      >
        <span className="truncate">
          {selectedDate ? format(selectedDate, "yyyy-MM-dd") : placeholder}
        </span>
        <CalendarIcon className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-auto rounded-[5px] p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
