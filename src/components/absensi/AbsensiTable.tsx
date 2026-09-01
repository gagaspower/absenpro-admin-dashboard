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
import { cn } from "@/lib/utils"

import { AbsensiStatusCell } from "@/components/absensi/AbsensiStatusCell"
import type { AbsensiRow } from "@/types/absensi/absensi.types"

interface AbsensiTableProps {
  rows: AbsensiRow[]
  daysInMonth: number
  month: number
  year: number
  isLoading?: boolean
  error?: string | null
}

function isSundayDate(day: number, month: number, year: number): boolean {
  return new Date(year, month - 1, day).getDay() === 0
}

export function AbsensiTable({
  rows,
  daysInMonth,
  month,
  year,
  isLoading = false,
  error = null,
}: AbsensiTableProps) {
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
      <div className="max-h-[70vh] overflow-auto">
        <Table className="border-separate border-spacing-0">
          <TableHeader>
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
            <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
              {days.map((day) => (
                <TableHead
                  key={day}
                  className={cn(
                    "sticky top-[45px] z-20 min-w-[44px] border-b border-[#EAEAEA] bg-[#F7FCFA] text-center text-[#374957]",
                    isSundayDate(day, month, year) &&
                      "bg-[#FCEAEE] text-[#D4453B]"
                  )}
                >
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
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
                        isSundayDate(day, month, year) && "bg-[#FCEAEE]"
                      )}
                    >
                      <div className="mx-auto h-6 w-6 animate-pulse rounded-full bg-gray-100" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={daysInMonth + 1}
                  className="py-10 text-center text-sm text-red-500"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
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
              rows.map((row) => (
                <TableRow key={row.id} className="border-[#EAEAEA]">
                  <TableCell className="sticky left-0 z-10 border-r border-[#EAEAEA] bg-white px-5 font-medium text-[#374957]">
                    {row.employee_name}
                  </TableCell>
                  {days.map((day) => {
                    const record = row.days.find((d) => d.date === day)
                    return (
                      <TableCell
                        key={day}
                        className={cn(
                          "p-0 text-center",
                          isSundayDate(day, month, year) && "bg-[#FCEAEE]"
                        )}
                      >
                        <AbsensiStatusCell status={record?.status ?? ""} />
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
  )
}
