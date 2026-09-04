import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type { BranchSchedule } from "@/types/branch_schedule/branch_schedule.types"
import { WEEKDAY_LABELS } from "@/constants/weekday"

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

// "08:00:00" atau "08:00" -> "08:00"
function formatTime(value: string | null) {
  if (!value) return null
  return value.slice(0, 5)
}

function timeRange(start: string | null, end: string | null) {
  const s = formatTime(start)
  const e = formatTime(end)
  if (!s && !e) return "-"
  return `${s ?? "-"} - ${e ?? "-"}`
}

interface BranchScheduleDetailModalProps {
  open: boolean
  schedule: BranchSchedule | null
  onOpenChange: (open: boolean) => void
}

export function BranchScheduleDetailModal({
  open,
  schedule,
  onOpenChange,
}: BranchScheduleDetailModalProps) {
  if (!schedule) return null

  const sortedDays = [...schedule.days].sort((a, b) => a.weekday - b.weekday)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-hidden rounded-[5px] p-0"
        style={{ width: "min(760px, 92vw)", maxWidth: "none" }}
      >
        <DialogHeader className="border-b border-[#EAEAEA] px-5 py-4">
          <DialogTitle className="text-lg font-semibold text-[#374957]">
            {schedule.name}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[#71808B]">
            {schedule.branch_name} &middot; Efektif{" "}
            {formatDate(schedule.effective_from)}
            {schedule.effective_until
              ? ` s/d ${formatDate(schedule.effective_until)}`
              : " (tanpa batas akhir)"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA]">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-[#F7FCFA] text-[#374957]">
                <tr>
                  <th className="w-[12%] px-3 py-2 text-left font-medium">
                    Hari
                  </th>
                  <th className="w-[10%] px-3 py-2 text-left font-medium">
                    Status
                  </th>
                  <th className="w-[22%] px-3 py-2 text-left font-medium">
                    Jam Kerja
                  </th>
                  <th className="w-[22%] px-3 py-2 text-left font-medium">
                    Check-in
                  </th>
                  <th className="w-[22%] px-3 py-2 text-left font-medium">
                    Check-out
                  </th>
                  <th className="w-[12%] px-3 py-2 text-left font-medium">
                    Toleransi
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDays.map((day) => (
                  <tr
                    key={day.weekday}
                    className="border-t border-[#EAEAEA] text-[#374957]"
                  >
                    <td className="px-3 py-2">
                      {day.weekday_alias || WEEKDAY_LABELS[day.weekday]}
                    </td>
                    <td className="px-3 py-2">
                      {day.is_working_day ? (
                        <span className="text-emerald-600">Kerja</span>
                      ) : (
                        <span className="text-gray-400">Libur</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {day.is_working_day
                        ? timeRange(day.start_time, day.end_time)
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {day.is_working_day
                        ? timeRange(day.check_in_start, day.check_in_end)
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {day.is_working_day
                        ? timeRange(day.check_out_start, day.check_out_end)
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {day.is_working_day
                        ? `${day.late_tolerance_minutes} mnt`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
