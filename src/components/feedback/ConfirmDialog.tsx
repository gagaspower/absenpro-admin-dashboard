import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export type ConfirmDialogType = "delete" | "delete_permanent" | "restore"

interface ConfirmDialogProps {
  open: boolean
  type: ConfirmDialogType
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

const CONFIRM_CONTENT: Record<
  ConfirmDialogType,
  {
    title: string
    message: string
    confirmLabel: string
  }
> = {
  delete: {
    title: "Hapus data",
    message:
      "Apakah yakin akan menghapus data ini? untuk mengembalikan silahkan klik tombol 'Restore'",
    confirmLabel: "Ya, hapus",
  },
  delete_permanent: {
    title: "Hapus permanen",
    message:
      "Apakah yakin akan menghapus permanen data ini? data tidak dapat dikembalikan",
    confirmLabel: "Ya, hapus permanen",
  },
  restore: {
    title: "Restore data",
    message: "Apakah yakin akan merestore data ini?",
    confirmLabel: "Ya, restore",
  },
}

export function ConfirmDialog({
  open,
  type,
  onOpenChange,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = "Batal",
  isLoading,
}: ConfirmDialogProps) {
  const content = CONFIRM_CONTENT[type]

  function handleConfirm() {
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] rounded-[15px] bg-white p-5 shadow-xl ring-0 sm:max-w-[26rem]"
      >
        <DialogTitle className="text-lg font-semibold text-[#374957]">
          {title ?? content.title}
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm leading-6 text-[#71808B]">
          {message ?? content.message}
        </DialogDescription>

        <div className="mt-5 flex gap-3">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 rounded-[5px] border-[#DDE3E6] bg-white text-sm font-medium text-[#374957] hover:bg-gray-50"
              />
            }
          >
            {cancelLabel}
          </DialogClose>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="h-10 flex-1 rounded-[5px] bg-[#F64C31] text-sm font-medium text-white hover:bg-[#E6442A] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Memproses...
              </span>
            ) : (
              (confirmLabel ?? content.confirmLabel)
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
