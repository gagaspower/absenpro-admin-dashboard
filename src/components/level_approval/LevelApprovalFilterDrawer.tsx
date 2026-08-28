import { useEffect, useState } from "react"
import { X } from "lucide-react"

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

import { DepartemenFilterCombobox } from "./DepartemenFilterCombobox"
import { JenisCutiFilterCombobox } from "./JenisCutiFilterCombobox"

import {
  DEFAULT_LEVEL_APPROVAL_FILTER,
  type LevelApprovalFilterState,
} from "@/types/level_approval/level_approval.type"

interface LevelApprovalFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: LevelApprovalFilterState
  onApply: (filters: LevelApprovalFilterState) => void
}

export function LevelApprovalFilterDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
}: LevelApprovalFilterDrawerProps) {
  const isMobile = useMobile()

  const [draft, setDraft] = useState<LevelApprovalFilterState>(filters)

  useEffect(() => {
    if (open) {
      setDraft(filters)
    }
  }, [open, filters])

  function updateDraft<K extends keyof LevelApprovalFilterState>(
    key: K,
    value: LevelApprovalFilterState[K]
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function handleApply() {
    onApply(draft)
    onOpenChange(false)
  }

  function handleReset() {
    setDraft(DEFAULT_LEVEL_APPROVAL_FILTER)
    onApply(DEFAULT_LEVEL_APPROVAL_FILTER)
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
                Filter Level Approval
              </DrawerTitle>

              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                Saring data level approval sesuai kebutuhan.
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
              value={draft.departmentId}
              onChange={(value) => updateDraft("departmentId", value)}
            />
          </FilterField>

          <FilterField label="Jenis Cuti">
            <JenisCutiFilterCombobox
              value={draft.leaveTypeId}
              onChange={(value) => updateDraft("leaveTypeId", value)}
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

export default LevelApprovalFilterDrawer
