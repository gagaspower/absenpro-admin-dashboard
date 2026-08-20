import { MoreVertical, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface RowAction {
  key: string
  label: string
  icon: LucideIcon
  onClick: () => void
  destructive?: boolean
  hidden?: boolean
}

interface RowActionsMenuProps {
  actions: RowAction[]
}

export function RowActionsMenu({ actions }: RowActionsMenuProps) {
  const visibleActions = actions.filter((a) => !a.hidden)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Aksi baris"
          >
            <MoreVertical className="size-4" />
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-44 rounded-[5px] border-[#D9D9D9] shadow-md"
      >
        {visibleActions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            onClick={action.onClick}
            className={cn(
              "cursor-pointer gap-2.5 text-[#374957]",
              action.destructive
                ? "text-red-500 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
                : "hover:text-[#2B8CE5] focus:text-[#2B8CE5]"
            )}
          >
            <action.icon className="size-4" />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
