import { GripVertical, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { RoleOption } from "@/types/roles/roles.types"

interface SortableLevelRowProps {
  id: string
  order: number
  roleId: string
  roleOptions: RoleOption[]
  onRoleChange: (roleId: string) => void
  onRemove: () => void
  canRemove: boolean
  isDuplicate?: boolean
}

export function SortableLevelRow({
  id,
  order,
  roleId,
  roleOptions,
  onRoleChange,
  onRemove,
  canRemove,
  isDuplicate,
}: SortableLevelRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const selectedRole = roleOptions.find((role) => role.id === roleId)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-[8px] border bg-white p-3 transition-all",
        isDragging
          ? "z-10 border-[#30CCD5] shadow-lg ring-2 ring-[#30CCD5]/20"
          : "border-[#EAEAEA] hover:border-[#30CCD5]/40 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-[5px] text-gray-300 hover:bg-gray-50 hover:text-gray-500 active:cursor-grabbing"
        aria-label="Geser untuk mengubah urutan"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F9FA] text-sm font-semibold text-[#12A7B0]">
        {order}
      </div>

      <div className="flex-1">
        <Select
          value={roleId}
          onValueChange={(value) => onRoleChange(value ?? "")}
        >
          <SelectTrigger
            className={cn(
              "!h-10 w-full rounded-[5px] border-[#D9D9D9] text-sm text-[#374957] focus:ring-0 focus:ring-offset-0",
              isDuplicate && "border-red-300 text-red-600"
            )}
          >
            <SelectValue placeholder="Pilih role approver">
              {selectedRole?.nama_role}
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.nama_role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isDuplicate && (
          <p className="mt-1 text-xs text-red-500">
            Role ini sudah dipakai pada level lain.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={!canRemove}
        onClick={onRemove}
        className="h-9 w-9 shrink-0 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
        aria-label="Hapus level ini"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
