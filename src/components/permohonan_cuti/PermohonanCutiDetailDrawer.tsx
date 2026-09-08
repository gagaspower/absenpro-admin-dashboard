import { useEffect, useState } from "react"
import {
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  ImageIcon,
  Paperclip,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMobile } from "@/hooks/use-mobile"
import type {
  LeaveRequestAttachment,
  PermohonanCutiRow,
} from "@/types/permohonan_cuti/permohonan_cuti.types"
import { LeaveRequestStatusBadge } from "@/components/permohonan_cuti/LeaveRequestStatusBadge"
import {
  formatDate,
  formatDateTime,
  formatTotalDays,
} from "@/components/permohonan_cuti/format"
import { downloadPermohonanCutiAttachment } from "@/services/permohonan_cuti/permohonan_cuti.service"
const BACKEND_URL = import.meta.env.VITE_API_URL as string

interface PermohonanCutiDetailDrawerProps {
  open: boolean
  row: PermohonanCutiRow | null
  onOpenChange: (open: boolean) => void
}

export function PermohonanCutiDetailDrawer({
  open,
  row,
  onOpenChange,
}: PermohonanCutiDetailDrawerProps) {
  const isMobile = useMobile()

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      showSwipeHandle={isMobile}
    >
      <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:100%] sm:data-[swipe-axis=x]:[--drawer-content-width:34rem]">
        <DrawerHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DrawerTitle className="text-lg font-semibold text-[#374957]">
                Detail Permohonan
              </DrawerTitle>

              <DrawerDescription className="mt-1 text-sm text-[#71808B]">
                {row?.request_number ?? "-"}
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

        {row && (
          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
            {/* Status */}
            <div className="flex items-center justify-between rounded-[5px] border border-[#EAEAEA] bg-[#F7FCFA] px-4 py-3">
              <div>
                <p className="text-xs text-[#71808B]">Status Permohonan</p>

                <div className="mt-1">
                  <LeaveRequestStatusBadge status={row.status} />
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-[#71808B]">Tgl Permohonan</p>

                <p className="text-sm font-medium text-[#374957]">
                  {formatDateTime(row.applied_at ?? row.created_at)}
                </p>
              </div>
            </div>

            {/* Info Pegawai */}
            <Section title="Info Pegawai">
              <DetailRow label="Nama" value={row.employee?.full_name ?? "-"} />

              <DetailRow
                label="Kode Pegawai"
                value={row.employee?.employee_code ?? "-"}
              />

              <DetailRow
                label="Departemen"
                value={row.employee?.department?.name ?? "-"}
              />
            </Section>

            {/* Info Permohonan */}
            <Section title="Info Permohonan">
              <DetailRow
                label="Jenis Cuti"
                value={row.leave_type?.name ?? "-"}
              />

              <DetailRow
                label="Tanggal Mulai"
                value={formatDate(row.start_date)}
              />

              <DetailRow
                label="Tanggal Selesai"
                value={formatDate(row.end_date)}
              />

              <DetailRow
                label="Jumlah Hari"
                value={formatTotalDays(row.total_days)}
              />

              <DetailRow label="Alasan" value={row.reason || "-"} />

              {row.address_during_leave && (
                <DetailRow
                  label="Alamat Selama Cuti"
                  value={row.address_during_leave}
                />
              )}

              {row.phone_during_leave && (
                <DetailRow
                  label="No. HP Selama Cuti"
                  value={row.phone_during_leave}
                />
              )}

              {row.status === "rejected" && row.rejected_reason && (
                <DetailRow
                  label="Alasan Penolakan"
                  value={row.rejected_reason}
                />
              )}
            </Section>

            {/* Timeline Persetujuan */}
            {row.timeline.length > 0 && (
              <Section title="Timeline Persetujuan">
                <ol className="space-y-4">
                  {row.timeline.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <TimelineIcon status={item.status} />

                      <div className="flex-1 pb-1">
                        <p className="text-sm font-medium text-[#374957]">
                          {item.title}
                        </p>

                        <p className="text-xs text-[#71808B]">
                          {item.description}
                        </p>

                        {item.acted_at && (
                          <p className="mt-1 text-xs text-[#9CA6AD]">
                            {formatDateTime(item.acted_at)}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {/* Lampiran */}
            {row.attachments.length > 0 && (
              <Section title="Lampiran">
                <div className="space-y-2">
                  {row.attachments.map((attachment) => (
                    <AttachmentItem
                      key={attachment.id}
                      attachment={attachment}
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Log Aktivitas */}
            {row.logs.length > 0 && (
              <Section title="Log Aktivitas">
                <div className="space-y-3">
                  {row.logs.map((log) => (
                    <div key={log.id} className="text-sm">
                      <p className="text-[#374957]">{log.action}</p>

                      <p className="text-xs text-[#9CA6AD]">
                        {log.actor?.name ?? "-"} ·{" "}
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        <div className="flex shrink-0 border-t border-[#EAEAEA] bg-white px-5 py-4">
          <DrawerClose
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full rounded-[5px] border-[#DDE3E6]"
              />
            }
          >
            Tutup
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/* ============================================================
 * ATTACHMENT ITEM
 * ============================================================ */

function AttachmentItem({
  attachment,
}: {
  attachment: LeaveRequestAttachment
}) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const isImage = attachment.file_type?.startsWith("image/")
  const isPdf = attachment.file_type === "application/pdf"

  const handleDownload = async () => {
    try {
      setDownloading(true)

      const blob = await downloadPermohonanCutiAttachment(attachment.id)

      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = attachment.file_name

      document.body.appendChild(link)
      link.click()
      link.remove()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Gagal mengunduh lampiran:", error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-[5px] border border-[#EAEAEA] px-3 py-2">
        {/* Icon */}
        <div className="flex size-8 shrink-0 items-center justify-center rounded-[5px] bg-[#F4F6F7]">
          {isImage ? (
            <ImageIcon className="size-4 text-[#71808B]" />
          ) : isPdf ? (
            <FileText className="size-4 text-[#71808B]" />
          ) : (
            <Paperclip className="size-4 text-[#71808B]" />
          )}
        </div>

        {/* Filename */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate text-sm font-medium text-[#374957]"
            title={attachment.file_name}
          >
            {attachment.file_name}
          </p>

          <p className="text-xs text-[#9CA6AD]">
            {isImage ? "Gambar" : isPdf ? "PDF" : "Lampiran"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {(isImage || isPdf) && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-[#71808B] hover:bg-[#F7FCFA] hover:text-[#374957]"
              aria-label={`Preview ${attachment.file_name}`}
              title="Preview"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="size-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 text-[#71808B] hover:bg-[#F7FCFA] hover:text-[#374957]"
            aria-label={`Download ${attachment.file_name}`}
            title="Download"
            disabled={downloading}
            onClick={handleDownload}
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      {(isImage || isPdf) && (
        <AttachmentPreviewDialog
          attachment={attachment}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </>
  )
}

/* ============================================================
 * ATTACHMENT PREVIEW
 * ============================================================ */

function AttachmentPreviewDialog({
  attachment,
  open,
  onOpenChange,
}: {
  attachment: LeaveRequestAttachment
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const isImage = attachment.file_type?.startsWith("image/")
  const isPdf = attachment.file_type === "application/pdf"

  useEffect(() => {
    if (!open) {
      setPreviewUrl(null)
      setLoading(false)
      setError(false)
      return
    }

    /*
     * Preview langsung menggunakan URL storage backend.
     *
     * file_path:
     * leave-attachments/xxxxx.jpg
     *
     * menjadi:
     * ${BACKEND_URL}/storage/leave-attachments/xxxxx.jpg
     */
    const url = `${BACKEND_URL}/storage/${attachment.file_path}`

    setPreviewUrl(url)
    setLoading(false)
    setError(false)
  }, [open, attachment.file_path])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-5xl overflow-hidden p-0">
        <DialogHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <DialogTitle className="truncate pr-8 text-base font-semibold text-[#374957]">
            {attachment.file_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[calc(95vh-80px)] min-h-[300px] items-center justify-center overflow-auto bg-[#F7F8F9] p-4">
          {loading && (
            <div className="text-sm text-[#71808B]">Memuat lampiran...</div>
          )}

          {!loading && error && (
            <div className="text-center">
              <p className="text-sm text-[#71808B]">
                Lampiran tidak dapat ditampilkan.
              </p>

              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() =>
                  window.open(
                    `${BACKEND_URL}/storage/${attachment.file_path}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              >
                Buka File
              </Button>
            </div>
          )}

          {!loading && !error && previewUrl && isImage && (
            <img
              src={previewUrl}
              alt={attachment.file_name}
              className="max-h-[calc(95vh-130px)] max-w-full rounded-md object-contain"
              onError={() => setError(true)}
            />
          )}

          {!loading && !error && previewUrl && isPdf && (
            <iframe
              src={previewUrl}
              title={attachment.file_name}
              className="h-[calc(95vh-130px)] w-full rounded-md border border-[#EAEAEA] bg-white"
              onError={() => setError(true)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ============================================================
 * SECTION
 * ============================================================ */

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#374957]">{title}</p>

      {children}
    </div>
  )
}

/* ============================================================
 * DETAIL ROW
 * ============================================================ */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#71808B]">{label}</span>

      <span className="text-right font-medium text-[#374957]">{value}</span>
    </div>
  )
}

/* ============================================================
 * TIMELINE
 * ============================================================ */

function TimelineIcon({ status }: { status: string }) {
  const base = "flex size-6 shrink-0 items-center justify-center rounded-full"

  if (status === "completed") {
    return (
      <span className={`${base} bg-[#E6F8EF] text-[#1B8A5A]`}>
        <Check className="size-3.5" />
      </span>
    )
  }

  if (status === "rejected") {
    return (
      <span className={`${base} bg-[#FDEBEC] text-[#D6444B]`}>
        <XCircle className="size-3.5" />
      </span>
    )
  }

  if (status === "current") {
    return (
      <span className={`${base} bg-[#FFF6E5] text-[#B6810F]`}>
        <Clock className="size-3.5" />
      </span>
    )
  }

  return (
    <span className={`${base} bg-[#EEF1F3] text-[#9CA6AD]`}>
      <Clock className="size-3.5" />
    </span>
  )
}
