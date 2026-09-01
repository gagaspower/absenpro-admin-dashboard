// src/components/absensi/PeriodeFilter.tsx
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
import { fetchPeriode } from "@/services/periode/periode.service"
import type { PeriodeRow } from "@/types/periode/periode.types"

interface PeriodeFilterProps {
  value: string
  onChange: (value: string) => void
}

export function PeriodeFilter({ value, onChange }: PeriodeFilterProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<PeriodeRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchPeriode()
        if (cancelled) return
        setOptions(data)

        // Set default periode ke bulan berjalan kalau belum ada value terpilih
        if (!value) {
          const now = new Date()
          const currentValue = `${now.getMonth() + 1} - ${now.getFullYear()}`
          const matched = data.find((item) => item.value === currentValue)
          onChange(matched ? matched.value : (data[0]?.value ?? ""))
        }
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
    // hanya perlu fetch sekali saat mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedLabel =
    options.find((o) => o.value === value)?.label ??
    (isLoading ? "Memuat periode..." : "Pilih periode")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isLoading || options.length === 0}
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
      <PopoverContent className="w-[200px] rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Cari periode..." />
          <CommandList>
            <CommandEmpty>Periode tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
