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
import type { KategoriCuti } from "@/types/jenis_cuti/jenis_cuti.types"

interface CategoryOption {
  id: KategoriCuti
  label: string
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { id: "cuti", label: "Cuti" },
  { id: "izin", label: "Izin" },
]

interface CategoryCutiFormComboboxProps {
  value: KategoriCuti | ""
  onChange: (value: KategoriCuti) => void
  error?: boolean
}

export function CategoryCutiFormCombobox({
  value,
  onChange,
  error = false,
}: CategoryCutiFormComboboxProps) {
  const [open, setOpen] = useState(false)

  const selected = CATEGORY_OPTIONS.find((o) => o.id === value)

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
        <span className="truncate">
          {selected ? selected.label : "Pilih Kategori"}
        </span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[260px] rounded-[5px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {CATEGORY_OPTIONS.map((option) => (
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
