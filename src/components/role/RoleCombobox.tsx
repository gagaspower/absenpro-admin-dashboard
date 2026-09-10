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
import type { RoleOption } from "@/types/roles/roles.types"
import { fetchRole } from "@/services/role/role.service"

interface RoleComboboxProps {
  value: string // "" | role id
  onChange: (value: string) => void
}

export function RoleCombobox({ value, onChange }: RoleComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<RoleOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    fetchRole()
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
    options.find((o) => o.id === value)?.nama_role ?? "Pilih role"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 w-full min-w-[220px] justify-between rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957] md:w-72"
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
      <PopoverContent className="w-[280px] rounded-[5px] p-0">
        <Command>
          <CommandInput placeholder="Cari role..." />
          <CommandList>
            <CommandEmpty>Role tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.nama_role}
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
                  {option.nama_role}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
