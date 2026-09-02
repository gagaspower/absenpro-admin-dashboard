// src/components/absensi/AbsensiTable.tsx
import { Search } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { AbsensiStatusCell } from "@/components/absensi/AbsensiStatusCell"
import type { AbsensiRow } from "@/types/absensi/absensi.types"
import { parsePeriodeValue } from "@/types/absensi/absensi.types"

interface AbsensiTableProps {
  rows: AbsensiRow[]
  daysInMonth: number
  periode: string
  isLoading?: boolean
  error?: string | null
}

function isSundayDate(day: number, month: number, year: number) {
  return new Date(year, month - 1, day).getDay() === 0
}

export function AbsensiTable({
  rows,
  daysInMonth,
  periode,
  isLoading = false,
  error = null,
}: AbsensiTableProps) {
  const { month, year } = parsePeriodeValue(periode)

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const firstRow = rows[0]

  return (
    <TooltipProvider>
      <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
        <div className="max-h-[70vh] overflow-auto">
          <Table className="border-separate border-spacing-0">
            <TableHeader>
              {/* Header utama */}
              <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                <TableHead
                  rowSpan={2}
                  className="sticky top-0 left-0 z-30 min-w-[220px] border-r border-b border-[#EAEAEA] bg-[#F7FCFA] px-5 align-middle text-[#374957]"
                >
                  Nama
                </TableHead>

                <TableHead
                  colSpan={daysInMonth}
                  className="sticky top-0 z-20 border-b border-[#EAEAEA] bg-[#F7FCFA] text-center text-[#374957]"
                >
                  Tanggal
                </TableHead>
              </TableRow>

              {/* Header tanggal */}
              <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                {days.map((day) => {
                  const record = firstRow?.days.find((d) => d.date === day)

                  const sunday = isSundayDate(day, month, year)
                  const holiday = record?.is_holiday === true

                  const label = record?.holiday_label
                  const description = record?.holiday_description

                  const tooltipText =
                    holiday && label
                      ? `Libur: ${label}${
                          description ? ` — ${description}` : ""
                        }`
                      : sunday
                        ? "Hari Minggu"
                        : null

                  return (
                    <TableHead
                      key={day}
                      className={cn(
                        "sticky top-[45px] z-20 min-w-[44px] border-b border-[#EAEAEA] text-center text-[#374957]",
                        sunday
                          ? "bg-[oklch(44.6%_0.03_256.802)] text-white"
                          : holiday
                            ? "bg-[oklch(64.5%_0.246_16.439)] text-white"
                            : "bg-[#F7FCFA] text-[#374957]"
                      )}
                    >
                      {tooltipText ? (
                        <div className="group relative flex h-full w-full cursor-default items-center justify-center">
                          {day}

                          <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 hidden -translate-x-1/2 rounded-md bg-[#374957] px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-md group-hover:block">
                            {tooltipText}
                          </div>
                        </div>
                      ) : (
                        day
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading */}
              {isLoading ? (
                Array.from({ length: 6 }).map((_, rowIdx) => (
                  <TableRow key={rowIdx} className="border-[#EAEAEA]">
                    <TableCell className="sticky left-0 z-10 border-r border-[#EAEAEA] bg-white px-5">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    </TableCell>

                    {days.map((day) => (
                      <TableCell
                        key={day}
                        className={cn(
                          "p-0 text-center",
                          isSundayDate(day, month, year) &&
                            "bg-[oklch(44.6%_0.03_256.802)]"
                        )}
                      >
                        <div className="mx-auto h-6 w-6 animate-pulse rounded-full bg-gray-100" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : error ? (
                /* Error */
                <TableRow>
                  <TableCell
                    colSpan={daysInMonth + 1}
                    className="py-10 text-center text-sm text-red-500"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                /* Empty */
                <TableRow>
                  <TableCell colSpan={daysInMonth + 1}>
                    <TableEmptyState
                      icon={Search}
                      title="Data tidak ditemukan"
                      description="Coba ubah kata kunci pencarian atau filter."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                /* Data */
                rows.map((row) => (
                  <TableRow key={row.id} className="border-[#EAEAEA]">
                    <TableCell className="sticky left-0 z-10 border-r border-[#EAEAEA] bg-white px-5 font-medium text-[#374957]">
                      {row.employee_name}
                    </TableCell>

                    {days.map((day) => {
                      const record = row.days.find((d) => d.date === day)

                      const sunday = isSundayDate(day, month, year)

                      const holiday = record?.is_holiday === true

                      return (
                        <TableCell
                          key={day}
                          className={cn(
                            "p-0 text-center",
                            sunday
                              ? "bg-[oklch(44.6%_0.03_256.802)]"
                              : holiday
                                ? "bg-[oklch(64.5%_0.246_16.439)]"
                                : ""
                          )}
                        >
                          <AbsensiStatusCell
                            record={record}
                            isSunday={sunday}
                            isHoliday={holiday}
                            holidayLabel={record?.holiday_label}
                            holidayDescription={record?.holiday_description}
                          />
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  )
}
