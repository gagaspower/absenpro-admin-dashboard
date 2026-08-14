import checkMarkIcon from "@/assets/images/check-mark.png"
import warningIcon from "@/assets/images/warning.png"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type AlertModalType = "success" | "error"

interface AlertModalProps {
  open: boolean
  type: AlertModalType
  message: string
  title?: string
  onOpenChange: (open: boolean) => void
}

const ALERT_CONTENT: Record<AlertModalType, { title: string; icon: string }> = {
  success: {
    title: "Sukses",
    icon: checkMarkIcon,
  },
  error: {
    title: "Error",
    icon: warningIcon,
  },
}

export function AlertModal({
  open,
  type,
  message,
  title,
  onOpenChange,
}: AlertModalProps) {
  const content = ALERT_CONTENT[type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 rounded-[15px] bg-white px-6 py-7 text-center shadow-xl ring-0 sm:max-w-[22rem]"
      >
        <img
          src={content.icon}
          alt=""
          className="mx-auto size-16 object-contain"
          aria-hidden="true"
        />
        <DialogTitle className="mt-5 text-xl font-bold text-[#374957]">
          {title ?? content.title}
        </DialogTitle>
        <DialogDescription className="mt-3 text-sm leading-6 text-[#71808B]">
          {message}
        </DialogDescription>
        <DialogClose
          render={
            <Button
              type="button"
              className="mt-7 h-10 w-full rounded-[5px] bg-[#30CCD5] text-sm font-semibold text-white hover:bg-[#28B8C0]"
            />
          }
        >
          Ok
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export type { AlertModalType }
