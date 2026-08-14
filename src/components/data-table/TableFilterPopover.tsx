import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface FilterCheckboxOption {
  id: string
  label: string
}

interface TableFilterPopoverProps {
  options: FilterCheckboxOption[]
  selected: string[]
  onSubmit: (selected: string[]) => void
  /** Batasi pilihan ke satu checkbox, misalnya untuk filter status. */
  singleSelect?: boolean
}

/**
 * Filter popover generik (icon button + checkbox list + Reset/Submit).
 * `options` beda2 sesuai kebutuhan tiap tabel master data.
 */
export function TableFilterPopover({
  options,
  selected,
  onSubmit,
  singleSelect = false,
}: TableFilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(selected)

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(selected)
    }
    setOpen(nextOpen)
  }

  function toggle(id: string, checked: boolean) {
    setDraft((prev) => {
      if (singleSelect) {
        return checked ? [id] : prev
      }

      return checked ? [...prev, id] : prev.filter((v) => v !== id)
    })
  }

  function handleReset() {
    setDraft([])
    onSubmit([])
    setOpen(false)
  }

  function handleSubmit() {
    onSubmit(draft)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-[5px] border-[#EAEAEA] bg-white text-[#374957] hover:bg-gray-50"
            aria-label="Filter"
          >
            <Filter className="size-4" />
          </Button>
        }
      />

      <PopoverContent align="start" className="w-56 rounded-[5px] p-3">
        <div className="flex flex-col gap-2.5">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2 text-sm text-[#374957]"
            >
              <Checkbox
                checked={draft.includes(opt.id)}
                onCheckedChange={(checked) => toggle(opt.id, checked === true)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-9 rounded-[5px] border-[#EAEAEA] bg-white text-sm font-normal text-[#374957] hover:bg-gray-50"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="h-9 rounded-[5px] bg-[#30CCD5] text-sm font-normal text-white hover:bg-[#2ab8c0]"
          >
            Submit
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
