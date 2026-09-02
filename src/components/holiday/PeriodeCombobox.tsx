import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import { fetchPeriode } from "@/services/periode/periode.service"
import type { PeriodeRow } from "@/types/periode/periode.types"

const currentPeriodeFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
})

function getCurrentPeriodeLabel() {
  return currentPeriodeFormatter.format(new Date())
}

const DEFAULT_OPTION: PeriodeRow = {
  value: "",
  label: getCurrentPeriodeLabel(),
}

interface PeriodeComboboxProps {
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function PeriodeCombobox({
  value,
  onValueChange,
  className,
}: PeriodeComboboxProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<PeriodeRow[]>([DEFAULT_OPTION])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      try {
        const data = await fetchPeriode()
        if (controller.signal.aborted) return
        setOptions([DEFAULT_OPTION, ...data])
      } catch {
        if (!controller.signal.aborted) setOptions([DEFAULT_OPTION])
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const selected = options.find((opt) => opt.value === value) ?? DEFAULT_OPTION

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "h-10 w-full justify-between rounded-[5px] border-[#EAEAEA] text-sm font-normal text-[#374957] md:w-52",
              className
            )}
          />
        }
      >
        <span className="truncate">{selected.label}</span>
        {isLoading ? (
          <LoaderCircle className="size-4 shrink-0 animate-spin opacity-50" />
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Cari periode..." className="h-9" />
          <CommandList>
            <CommandEmpty>Periode tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value || "default"}
                  value={opt.label}
                  onSelect={() => {
                    onValueChange(opt.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === opt.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
