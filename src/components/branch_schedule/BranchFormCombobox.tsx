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

interface BranchFormComboboxProps {
  value: string // branch id, "" jika belum dipilih
  onChange: (value: string) => void
  error?: boolean
  // opsional: nama cabang awal (dari row lama), dipakai untuk resolve id
  // saat data list belum menyertakan branch_id
  initialBranchName?: string
}

export function BranchFormCombobox({
  value,
  onChange,
  error = false,
  initialBranchName,
}: BranchFormComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<BranchOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetchBranchAllData()
      .then((res) => {
        if (!active) return
        setOptions(res.rows)
        if (!value && initialBranchName) {
          const match = res.rows.find((o) => o.name === initialBranchName)
          if (match) onChange(match.id)
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selected = options.find((o) => o.id === value)
  const selectedLabel = selected
    ? selected.name
    : value
      ? "Memuat..."
      : "Pilih Cabang"

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
          <CommandInput placeholder="Cari cabang..." />
          <CommandList>
            <CommandEmpty>Cabang tidak ditemukan.</CommandEmpty>
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
