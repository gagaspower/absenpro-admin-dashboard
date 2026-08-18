import { useEffect, useState } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useMobile } from "@/hooks/use-mobile"
import { DepartemenFilterCombobox } from "@/components/pegawai/DepartemenFilterCombobox"
import { JabatanFilterCombobox } from "@/components/pegawai/JabatanFilterCombobox"
import { BranchFilterCombobox } from "@/components/pegawai/BranchFilterCombobox"
import { ShiftFilterCombobox } from "@/components/pegawai/ShiftFilterCombobox"
import {
  DEFAULT_PEGAWAI_FILTER,
  type PegawaiFilterState,
  type PegawaiStatusFilterValue,
  type PegawaiTrashFilterValue,
} from "@/types/pegawai/pegawai.types"

const STATUS_OPTIONS: { value: PegawaiStatusFilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "permanent", label: "Tetap" },
  { value: "contract", label: "Kontrak" },
  { value: "intern", label: "Magang" },
  { value: "resign", label: "Resign" },
]

const TRASH_OPTIONS: { value: PegawaiTrashFilterValue; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "trashed", label: "Sudah dihapus" },
]

interface PegawaiFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: PegawaiFilterState
  onApply: (filters: PegawaiFilterState) => void
}

export function PegawaiFilterDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
}: PegawaiFilterDrawerProps) {
  const isMobile = useMobile()
  const [draft, setDraft] = useState<PegawaiFilterState>(filters)

  // Sinkron draft tiap drawer dibuka, biar gak kebawa nilai lama yang
  // udah di-Reset/Terapkan dari sesi buka-tutup sebelumnya.
  useEffect(() => {
    if (open) setDraft(filters)
  }, [open, filters])

  function updateDraft<K extends keyof PegawaiFilterState>(
    key: K,
    value: PegawaiFilterState[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function handleDepartemenChange(value: string) {
    // Jabatan bertingkat dengan departemen — reset kalau departemen ganti.
    setDraft((current) => ({
      ...current,
      departemenId: value,
      jabatanId: "all",
    }))
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  function handleReset() {
    setDraft(DEFAULT_PEGAWAI_FILTER)
    onApply(DEFAULT_PEGAWAI_FILTER)
    onOpenChange(false)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle={isMobile}
    >
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:24rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                Filter Pegawai
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                Saring data pegawai sesuai kebutuhan.
              </DrawerDescription>
            </div>
            <DrawerClose
              render={
                <Button variant="ghost" size="icon" aria-label="Tutup drawer" />
              }
            >
              <X className="size-5" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <FilterField label="Departemen">
            <DepartemenFilterCombobox
              value={draft.departemenId}
              onChange={handleDepartemenChange}
            />
          </FilterField>

          <FilterField label="Jabatan / Posisi">
            <JabatanFilterCombobox
              value={draft.jabatanId}
              onChange={(value) => updateDraft("jabatanId", value)}
              departemenId={draft.departemenId}
            />
          </FilterField>

          <FilterField label="Lokasi Kerja">
            <BranchFilterCombobox
              value={draft.branchId}
              onChange={(value) => updateDraft("branchId", value)}
            />
          </FilterField>

          <FilterField label="Shift">
            <ShiftFilterCombobox
              value={draft.shiftId}
              onChange={(value) => updateDraft("shiftId", value)}
            />
          </FilterField>

          <FilterField label="Status Pegawai">
            <OptionPills
              options={STATUS_OPTIONS}
              value={draft.status}
              onChange={(value) => updateDraft("status", value)}
            />
          </FilterField>

          <FilterField label="Status Data">
            <OptionPills
              options={TRASH_OPTIONS}
              value={draft.isTrash}
              onChange={(value) => updateDraft("isTrash", value)}
            />
          </FilterField>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-[#EAEAEA] bg-white px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-10 flex-1 rounded-[5px] border-[#DDE3E6]"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            className="h-10 flex-1 rounded-[5px] bg-[#30CCD5] text-white hover:bg-[#28B8C0]"
          >
            Terapkan
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-[#374957]">{label}</span>
      {children}
    </div>
  )
}

function OptionPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-[#30CCD5] bg-[#E7FAFB] text-[#1FA0A8]"
                : "border-[#DDE3E6] text-[#71808B] hover:border-[#30CCD5]"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
