import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

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
import type { DepartemenOption } from "@/types/departemen/departemen.types"
import { fetchDepartemenAllData } from "@/services/departemen/departemen.service"

interface DepartemenFormComboboxProps {
  value: string
  onChange: (value: string) => void
  error?: boolean
  onLoadingChange?: (isLoading: boolean) => void
}

export function DepartemenFormCombobox({
  value,
  onChange,
  error = false,
  onLoadingChange,
}: DepartemenFormComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<DepartemenOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    onLoadingChange?.(isLoading)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetchDepartemenAllData()
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
  const selectedLabel = selected
    ? selected.name
    : value
      ? "Memuat..."
      : "Pilih Departemen"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={error}
            className={cn(
              "h-10 w-full justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal",
              selected ? "text-[#374957]" : "text-gray-400",
              error && "border-red-500"
            )}
          />
        }
      >
        <span className="truncate">{selectedLabel}</span>
        {isLoading ? (
          <Loader2 className="size-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[260px] rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Cari departemen..." />
          <CommandList>
            <CommandEmpty>Departemen tidak ditemukan.</CommandEmpty>
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
