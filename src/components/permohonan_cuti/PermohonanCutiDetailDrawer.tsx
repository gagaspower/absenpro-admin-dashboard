import { Check, Clock, Paperclip, X, XCircle } from "lucide-react"

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
import type { PermohonanCutiRow } from "@/types/permohonan_cuti/permohonan_cuti.types"
import { LeaveRequestStatusBadge } from "@/components/permohonan_cuti/LeaveRequestStatusBadge"
import {
  formatDate,
  formatDateTime,
  formatTotalDays,
} from "@/components/permohonan_cuti/format"

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
                    <a
                      key={attachment.id}
                      href={attachment.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-[5px] border border-[#EAEAEA] px-3 py-2 text-sm text-[#374957] hover:bg-[#F7FCFA]"
                    >
                      <Paperclip className="size-4 shrink-0 text-[#71808B]" />
                      <span className="truncate">{attachment.file_name}</span>
                    </a>
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
