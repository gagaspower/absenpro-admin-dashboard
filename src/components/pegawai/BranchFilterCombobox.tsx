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
import type { BranchOption } from "@/types/branch/branch.types"
import { fetchBranchAllData } from "@/services/branch/branch.service"

interface BranchFilterComboboxProps {
  value: string // "all" | branch id
  onChange: (value: string) => void
}

export function BranchFilterCombobox({
  value,
  onChange,
}: BranchFilterComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<BranchOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetchBranchAllData()
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

  const selectedLabel =
    value === "all"
      ? "Semua Lokasi Kerja"
      : (options.find((o) => o.id === value)?.name ?? "Semua Lokasi Kerja")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957]"
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
          <CommandInput placeholder="Cari lokasi kerja..." />
          <CommandList>
            <CommandEmpty>Lokasi kerja tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange("all")
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 size-4",
                    value === "all" ? "opacity-100" : "opacity-0"
                  )}
                />
                Semua Lokasi Kerja
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
