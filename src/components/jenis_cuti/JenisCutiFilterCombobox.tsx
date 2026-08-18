import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { KategoriCutiFilter } from "@/services/jenis_cuti/jenis_cuti.service"

interface KategoriOption {
  id: KategoriCutiFilter
  label: string
}

// Hard code sesuai instruksi, tidak ambil dari API.
const KATEGORI_OPTIONS: KategoriOption[] = [
  { id: "all", label: "Semua Kategori" },
  { id: "cuti", label: "Cuti" },
  { id: "izin", label: "Izin" },
]

interface JenisCutiFilterComboboxProps {
  value: KategoriCutiFilter
  onChange: (value: KategoriCutiFilter) => void
}

export function JenisCutiFilterCombobox({
  value,
  onChange,
}: JenisCutiFilterComboboxProps) {
  const [open, setOpen] = useState(false)

  const selectedLabel =
    KATEGORI_OPTIONS.find((o) => o.id === value)?.label ?? "Semua Kategori"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full min-w-[220px] justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957] md:w-56"
          />
        }
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[220px] rounded-[5px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {KATEGORI_OPTIONS.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.label}
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
