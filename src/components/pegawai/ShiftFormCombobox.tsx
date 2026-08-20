import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { ShiftOption } from "@/types/shift/shift.types"
import { fetchAllShift } from "@/services/shift/shift.service"

interface ShiftFormComboboxProps {
  value: string
  onChange: (value: string) => void

  onLoadingChange?: (isLoading: boolean) => void
}

export function ShiftFormCombobox({
  value,
  onChange,
  onLoadingChange,
}: ShiftFormComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ShiftOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetchAllShift()
      .then((res) => {
        if (active) setOptions(res.rows)
      })
      .catch(() => {
        if (active) setOptions([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const selected = options.find((o) => o.id === value)
  const selectedLabel = selected ? selected.name : "Pilih Shift (opsional)"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-10 w-full justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal",
              selected ? "text-[#374957]" : "text-gray-400"
            )}
          />
        }
      >
        <span className="truncate">{selectedLabel}</span>
        <div className="flex shrink-0 items-center gap-1">
          {selected && (
            <X
              className="size-4 opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onChange("")
              }}
            />
          )}
          {isLoading ? (
            <Loader2 className="size-4 animate-spin opacity-50" />
          ) : (
            <ChevronsUpDown className="size-4 opacity-50" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Cari shift..." />
          <CommandList>
            <CommandEmpty>Shift tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name}
                  onSelect={() => {
                    onChange(option.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
