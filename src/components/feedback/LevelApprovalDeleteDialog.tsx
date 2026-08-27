import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface LevelApprovalDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function LevelApprovalDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: LevelApprovalDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] rounded-[15px] bg-white p-5 shadow-xl ring-0 sm:max-w-[26rem]"
      >
        <DialogTitle className="text-lg font-semibold text-[#374957]">
          Hapus data
        </DialogTitle>

        <DialogDescription className="mt-2 text-sm leading-6 text-[#71808B]">
          Apakah yakin akan menghapus data ini?
        </DialogDescription>

        <div className="mt-5 flex gap-3">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                className="h-10 flex-1 rounded-[5px] border-[#DDE3E6] bg-white text-sm font-medium text-[#374957] hover:bg-gray-50"
              />
            }
          >
            Batal
          </DialogClose>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 flex-1 rounded-[5px] bg-[#F64C31] text-sm font-medium text-white hover:bg-[#E6442A] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
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
              "Ya, hapus"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LevelApprovalDeleteDialog
