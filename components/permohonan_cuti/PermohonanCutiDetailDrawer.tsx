import { useEffect, useState } from "react"
import {
  Check,
  Clock,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  X,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { LeaveRequestStatusBadge } from "@/components/permohonan_cuti/LeaveRequestStatusBadge"
import {
  formatDate,
  formatDateTime,
  formatTotalDays,
} from "@/components/permohonan_cuti/format"
import { useMobile } from "@/hooks/use-mobile"
import { downloadPermohonanCutiAttachment } from "@/services/permohonan_cuti/permohonan_cuti.service"
import type {
  LeaveRequestAttachment,
  PermohonanCutiRow,
} from "@/types/permohonan_cuti/permohonan_cuti.types"

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
  const [previewAttachment, setPreviewAttachment] =
    useState<LeaveRequestAttachment | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = async (attachment: LeaveRequestAttachment) => {
    if (downloadingId) return

    setDownloadingId(attachment.id)

    try {
      const blob = await downloadPermohonanCutiAttachment(attachment.id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")

      anchor.href = url
      anchor.download = attachment.file_name
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()

      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
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
                        isDownloading={downloadingId === attachment.id}
                        onPreview={() => setPreviewAttachment(attachment)}
                        onDownload={() => handleDownload(attachment)}
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
                          {log.actor?.name ?? "-"} · {formatDateTime(log.created_at)}
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

      <AttachmentPreviewDialog
        attachment={previewAttachment}
        open={previewAttachment !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPreviewAttachment(null)
        }}
      />
    </>
  )
}

function AttachmentItem({
  attachment,
  isDownloading,
  onPreview,
  onDownload,
}: {
  attachment: LeaveRequestAttachment
  isDownloading: boolean
  onPreview: () => void
  onDownload: () => void
}) {
  const isImage = attachment.file_type.startsWith("image/")
  const isPdf = attachment.file_type === "application/pdf"

  return (
    <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[5px] bg-[#F3F6F7] text-[#71808B]">
          {isImage ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#374957]">
            {attachment.file_name}
          </p>
          <p className="mt-0.5 text-xs text-[#9CA6AD]">
            {isImage ? "Gambar" : isPdf ? "PDF" : attachment.file_type}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onPreview}
            aria-label={`Preview ${attachment.file_name}`}
            title="Preview"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDownload}
            disabled={isDownloading}
            aria-label={`Download ${attachment.file_name}`}
            title="Download"
          >
            <Download className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function AttachmentPreviewDialog({
  attachment,
  open,
  onOpenChange,
}: {
  attachment: LeaveRequestAttachment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !attachment) {
      setPreviewUrl(null)
      setLoading(false)
      setError(null)
      return
    }

    let objectUrl: string | null = null
    let cancelled = false

    const loadPreview = async () => {
      setLoading(true)
      setError(null)
      setPreviewUrl(null)

      try {
        const blob = await downloadPermohonanCutiAttachment(attachment.id)

        if (cancelled) return

        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      } catch {
        if (!cancelled) {
          setError("Lampiran tidak dapat ditampilkan.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [open, attachment])

  if (!attachment) return null

  const isImage = attachment.file_type.startsWith("image/")
  const isPdf = attachment.file_type === "application/pdf"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b border-[#EAEAEA] px-4 py-3 pr-12">
          <DialogTitle className="truncate text-sm font-semibold text-[#374957]">
            {attachment.file_name}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#71808B]">
            Preview lampiran
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 bg-[#F5F7F8] p-3 sm:p-5">
          {loading && (
            <div className="flex h-full items-center justify-center text-sm text-[#71808B]">
              Memuat lampiran...
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <FileText className="size-10 text-[#9CA6AD]" />
              <p className="text-sm text-[#71808B]">{error}</p>
            </div>
          )}

          {!loading && !error && previewUrl && isImage && (
            <div className="flex h-full items-center justify-center overflow-auto">
              <img
                src={previewUrl}
                alt={attachment.file_name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {!loading && !error && previewUrl && isPdf && (
            <iframe
              src={previewUrl}
              title={`Preview ${attachment.file_name}`}
              className="h-full w-full rounded-[5px] border border-[#DDE3E6] bg-white"
            />
          )}

          {!loading && !error && previewUrl && !isImage && !isPdf && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <FileText className="size-10 text-[#9CA6AD]" />
              <p className="text-sm text-[#71808B]">
                File ini tidak mendukung preview langsung.
              </p>
              <Button
                type="button"
                onClick={() => {
                  const anchor = document.createElement("a")
                  anchor.href = previewUrl
                  anchor.download = attachment.file_name
                  document.body.appendChild(anchor)
                  anchor.click()
                  anchor.remove()
                }}
              >
                Buka / Simpan File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-[#71808B]">{label}</span>
      <span className="text-right font-medium text-[#374957]">{value}</span>
    </div>
  )
}

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
