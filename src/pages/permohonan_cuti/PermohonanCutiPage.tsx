import { useEffect, useState } from "react"
import { Eye, Inbox, SlidersHorizontal, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  RowActionsMenu,
  type RowAction,
} from "@/components/data-table/RowActionsMenu"
import {
  PerPageSelect,
  TablePagination,
} from "@/components/data-table/TableFooter"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import { TableLoadingState } from "@/components/data-table/TableLoadingState"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { useDebounce } from "@/hooks/useDebounce"

import {
  PermohonanCutiFilterDrawer,
  DEFAULT_PERMOHONAN_CUTI_FILTERS,
  FILTER_ALL_STATUS,
  FILTER_ALL_DEPARTEMEN,
  countActiveFilters,
  type PermohonanCutiFilterValues,
} from "@/components/permohonan_cuti/PermohonanCutiFilterDrawer"
import { PermohonanCutiDetailDrawer } from "@/components/permohonan_cuti/PermohonanCutiDetailDrawer"
import { LeaveRequestStatusBadge } from "@/components/permohonan_cuti/LeaveRequestStatusBadge"
import { formatDateTime } from "@/components/permohonan_cuti/format"

import { fetchPermohonanCuti } from "@/services/permohonan_cuti/permohonan_cuti.service"
import type {
  LeaveRequestStatus,
  LeaveRequestStatusCounts,
  PermohonanCutiRow,
} from "@/types/permohonan_cuti/permohonan_cuti.types"
import { PermohonanCutiStatusCounts } from "@/components/permohonan_cuti/PermohonanCutiStatusCounts"

const SEARCH_DEBOUNCE_MS = 400

export function PermohonanCutiPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [filters, setFilters] = useState<PermohonanCutiFilterValues>(
    DEFAULT_PERMOHONAN_CUTI_FILTERS
  )
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [detailRow, setDetailRow] = useState<PermohonanCutiRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [rows, setRows] = useState<PermohonanCutiRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusCounts, setStatusCounts] =
    useState<LeaveRequestStatusCounts | null>(null)
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const activeFilterCount = countActiveFilters(filters)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchPermohonanCuti({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          // Periode selalu punya nilai (default bulan/tahun berjalan),
          // beda dari status & departemen yang memang opsional.
          periode: filters.periode,
          status:
            filters.status && filters.status !== FILTER_ALL_STATUS
              ? (filters.status as LeaveRequestStatus)
              : undefined,
          departemen_id:
            filters.departemenId &&
            filters.departemenId !== FILTER_ALL_DEPARTEMEN
              ? filters.departemenId
              : undefined,
        })
        setRows(res.rows)
        setStatusCounts(res.status_counts)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data permohonan cuti. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [page, perPage, debouncedSearch, filters])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const hasActiveFilter = Boolean(debouncedSearch) || activeFilterCount > 0

  const showEmptyState =
    !isLoading && !error && rows.length === 0 && !hasActiveFilter

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  function handleApplyFilters(next: PermohonanCutiFilterValues) {
    setFilters(next)
    setPage(1)
  }

  function rowActions(row: PermohonanCutiRow): RowAction[] {
    return [
      {
        key: "detail",
        label: "Lihat Detail",
        icon: Eye,
        onClick: () => {
          setDetailRow(row)
          setDetailOpen(true)
        },
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Permohonan Cuti / Izin" />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada permohonan cuti"
            description="Data permohonan cuti / izin pegawai akan muncul di sini."
          />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="relative h-10 gap-2 rounded-[5px] border-[#DDE3E6] text-[#374957]"
                >
                  <SlidersHorizontal className="size-4" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-[#30CCD5] text-xs font-medium text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                <div className="relative w-full min-w-[220px] md:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Cari nama pegawai / no. permohonan"
                    className="h-10 rounded-[5px] border-[#EAEAEA] pl-9 text-sm text-[#374957] placeholder:text-gray-400 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <PermohonanCutiStatusCounts
                counts={statusCounts}
                isLoading={isLoading}
              />
            </div>

            {/* Table */}
            <div className="mt-4 overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                      <TableHead className="text-[#374957]">
                        Tgl Permohonan
                      </TableHead>
                      <TableHead className="text-[#374957]">Pegawai</TableHead>
                      <TableHead className="text-[#374957]">
                        Jenis Cuti
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Departemen
                      </TableHead>
                      <TableHead className="text-[#374957]">Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableLoadingState colSpan={6} />
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="py-10 text-center text-sm text-red-500"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6}>
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
                          <TableCell className="text-[#374957]">
                            {formatDateTime(row.applied_at ?? row.created_at)}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            <div className="flex flex-col">
                              <span>{row.employee?.full_name ?? "-"}</span>
                              {row.employee?.employee_code && (
                                <span className="text-xs text-[#9CA6AD]">
                                  {row.employee.employee_code}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.leave_type?.name ?? "-"}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.employee?.department?.name ?? "-"}
                          </TableCell>
                          <TableCell>
                            <LeaveRequestStatusBadge status={row.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <RowActionsMenu actions={rowActions(row)} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-col-reverse items-center justify-between gap-3 md:flex-row">
              <PerPageSelect value={perPage} onChange={handlePerPageChange} />
              <TablePagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </PageCard>

      <PermohonanCutiFilterDrawer
        open={filterDrawerOpen}
        value={filters}
        onOpenChange={setFilterDrawerOpen}
        onApply={handleApplyFilters}
      />

      <PermohonanCutiDetailDrawer
        open={detailOpen}
        row={detailRow}
        onOpenChange={(nextOpen) => {
          setDetailOpen(nextOpen)
          if (!nextOpen) setDetailRow(null)
        }}
      />
    </div>
  )
}

export default PermohonanCutiPage
