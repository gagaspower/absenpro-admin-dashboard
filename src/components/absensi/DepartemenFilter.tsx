// src/components/absensi/DepartemenFilter.tsx
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
import { fetchDepartemenAllData } from "@/services/departemen/departemen.service"
import type { DepartemenOption } from "@/types/departemen/departemen.types"

const ALL_VALUE = ""
const ALL_LABEL = "Semua Departemen"

interface DepartemenFilterProps {
  value: string
  onChange: (value: string) => void
}

export function DepartemenFilter({ value, onChange }: DepartemenFilterProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<DepartemenOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchDepartemenAllData()
        if (cancelled) return
        setOptions(data.rows.filter((row) => !row.deleted_at))
      } catch {
        if (!cancelled) setOptions([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const selectedLabel =
    value === ALL_VALUE
      ? ALL_LABEL
      : (options.find((o) => o.id === value)?.name ??
        (isLoading ? "Memuat departemen..." : ALL_LABEL))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isLoading}
            className="h-10 w-full justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957] disabled:opacity-60 md:w-[200px]"
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
      <PopoverContent className="w-62.5 rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Cari departemen..." />
          <CommandList>
            <CommandEmpty>Departemen tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value={ALL_LABEL}
                onSelect={() => {
                  onChange(ALL_VALUE)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === ALL_VALUE ? "opacity-100" : "opacity-0"
                  )}
                />
                {ALL_LABEL}
              </CommandItem>
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
