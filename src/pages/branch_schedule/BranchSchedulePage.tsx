import { useCallback, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  Eye,
  Inbox,
  Pencil,
  RotateCcw,
  Search,
  Trash,
  Trash2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  BulkActionBar,
  type BulkActionOption,
} from "@/components/data-table/BulkActionBar"
import {
  TableFilterPopover,
  type FilterCheckboxOption,
} from "@/components/data-table/TableFilterPopover"
import {
  RowActionsMenu,
  type RowAction,
} from "@/components/data-table/RowActionsMenu"
import {
  PerPageSelect,
  TablePagination,
} from "@/components/data-table/TableFooter"
import { StatusBadge } from "@/components/data-table/StatusBadge"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog"
import type { ConfirmDialogType } from "@/components/feedback/ConfirmDialog"
import { useDebounce } from "@/hooks/useDebounce"

import { BranchFilterCombobox } from "@/components/branch_schedule/BranchFilterCombobox"
import { BranchScheduleDetailModal } from "@/components/branch_schedule/BranchScheduleDetailModal"
import {
  deleteBranchSchedule,
  deleteMultipleBranchSchedules,
  fetchBranchSchedules,
  forceDeleteBranchSchedule,
  forceDeleteMultipleBranchSchedules,
  restoreBranchSchedule,
  restoreMultipleBranchSchedules,
  type BranchScheduleStatusFilter,
} from "@/services/branch_schedule/branch_schedule.service"
import type { BranchSchedule } from "@/types/branch_schedule/branch_schedule.types"
import { AddButton } from "@/components/AddButton"
import TableLoadingState from "@/components/data-table/TableLoadingState"

const FILTER_OPTIONS: FilterCheckboxOption[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "trashed", label: "Sudah dihapus" },
]

const BULK_OPTIONS: BulkActionOption[] = [
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Hapus" },
  { value: "delete_permanent", label: "Hapus Permanen" },
]

const SEARCH_DEBOUNCE_MS = 400

interface PageAlert {
  type: AlertModalType
  message: string
}

function formatEffectiveDate(row: BranchSchedule) {
  const from = new Date(row.effective_from).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  if (!row.effective_until) return `${from} - Sekarang`
  const until = new Date(row.effective_until).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
  return `${from} - ${until}`
}

export function BranchSchedulePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [bulkValue, setBulkValue] = useState("")
  const [filterSelected, setFilterSelected] = useState<string[]>(["active"])
  const [branchFilter, setBranchFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [rows, setRows] = useState<BranchSchedule[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isActionLoading, setIsActionLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)
  const [confirmState, setConfirmState] = useState<{
    type: ConfirmDialogType
    onConfirm: () => void
  } | null>(null)
  const [detailRow, setDetailRow] = useState<BranchSchedule | null>(null)

  // Alert dari halaman Add/Edit (dikirim lewat navigate state)
  useEffect(() => {
    const state = location.state as { alert?: PageAlert } | null
    if (state?.alert) {
      setPageAlert(state.alert)
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)
  const statusFilter: BranchScheduleStatusFilter =
    (filterSelected[0] as BranchScheduleStatusFilter) ?? "active"

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchBranchSchedules({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          is_trash: statusFilter,
          branch_id: branchFilter !== "all" ? branchFilter : undefined,
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data jadwal cabang. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [page, perPage, debouncedSearch, statusFilter, branchFilter, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  const hasActiveFilter =
    Boolean(debouncedSearch) ||
    branchFilter !== "all" ||
    statusFilter !== "active"

  const showEmptyState =
    !isLoading && !error && rows.length === 0 && !hasActiveFilter

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      rows.forEach((r) => (checked ? next.add(r.id) : next.delete(r.id)))
      return next
    })
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }

  function handleBulkSubmit() {
    if (!bulkValue || selectedIds.size === 0) return

    const ids = [...selectedIds]

    const confirmTypeMap: Record<string, ConfirmDialogType> = {
      restore: "restore",
      delete: "delete",
      delete_permanent: "delete_permanent",
    }

    const confirmType = confirmTypeMap[bulkValue]
    if (!confirmType) return

    setConfirmState({
      type: confirmType,
      onConfirm: async () => {
        setIsActionLoading(true)
        try {
          if (bulkValue === "restore") {
            await restoreMultipleBranchSchedules(ids)
            setPageAlert({
              type: "success",
              message: "Data berhasil direstore.",
            })
          } else if (bulkValue === "delete") {
            await deleteMultipleBranchSchedules(ids)
            setPageAlert({ type: "success", message: "Data berhasil dihapus." })
          } else if (bulkValue === "delete_permanent") {
            await forceDeleteMultipleBranchSchedules(ids)
            setPageAlert({
              type: "success",
              message: "Data berhasil dihapus permanen.",
            })
          }
          setSelectedIds(new Set())
          setBulkValue("")
          setRefreshKey((k) => k + 1)
          setConfirmState(null)
        } catch {
          setPageAlert({
            type: "error",
            message: "Gagal menjalankan aksi. Coba lagi.",
          })
        } finally {
          setIsActionLoading(false)
        }
      },
    })
  }

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  const goToCreate = useCallback(() => {
    navigate("/dashboard/jadwal-cabang/create")
  }, [navigate])

  const goToEdit = useCallback(
    (row: BranchSchedule) => {
      navigate(`/dashboard/jadwal-cabang/edit/${row.id}`, { state: { row } })
    },
    [navigate]
  )

  function rowActions(row: BranchSchedule): RowAction[] {
    return [
      {
        key: "detail",
        label: "Lihat Detail",
        icon: Eye,
        onClick: () => setDetailRow(row),
      },
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => goToEdit(row),
        hidden: row.is_trashed,
      },
      {
        key: "delete",
        label: "Hapus",
        icon: Trash2,
        destructive: true,
        onClick: () =>
          setConfirmState({
            type: "delete",
            onConfirm: async () => {
              setIsActionLoading(true)
              try {
                await deleteBranchSchedule(row.id)
                setPageAlert({
                  type: "success",
                  message: "Data berhasil dihapus.",
                })
                setConfirmState(null)
                setRefreshKey((k) => k + 1)
              } finally {
                setIsActionLoading(false)
              }
            },
          }),
        hidden: row.is_trashed,
      },
      {
        key: "restore",
        label: "Restore",
        icon: RotateCcw,
        onClick: () =>
          setConfirmState({
            type: "restore",
            onConfirm: async () => {
              setIsActionLoading(true)
              try {
                await restoreBranchSchedule(row.id)
                setPageAlert({
                  type: "success",
                  message: "Data berhasil di restore",
                })
                setConfirmState(null)
                setRefreshKey((k) => k + 1)
              } finally {
                setIsActionLoading(false)
              }
            },
          }),
        hidden: !row.is_trashed,
      },
      {
        key: "delete-permanent",
        label: "Hapus Permanen",
        icon: Trash,
        destructive: true,
        onClick: () =>
          setConfirmState({
            type: "delete_permanent",
            onConfirm: async () => {
              setIsActionLoading(true)
              try {
                await forceDeleteBranchSchedule(row.id)
                setPageAlert({
                  type: "success",
                  message: "Data telah dihapus permanen.",
                })
                setConfirmState(null)
                setRefreshKey((k) => k + 1)
              } finally {
                setIsActionLoading(false)
              }
            },
          }),
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader
          title="Jadwal Cabang"
          actions={!showEmptyState && <AddButton onClick={goToCreate} />}
        />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada data jadwal cabang"
            description="Tambahkan jadwal pertama untuk mulai mengelola jam kerja cabang."
            action={<AddButton onClick={goToCreate} />}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <BulkActionBar
                options={BULK_OPTIONS}
                value={bulkValue}
                onValueChange={(value) => setBulkValue(value)}
                onSubmit={handleBulkSubmit}
                disabled={selectedIds.size === 0}
              />

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <BranchFilterCombobox
                  value={branchFilter}
                  onChange={(value) => {
                    setBranchFilter(value)
                    setPage(1)
                  }}
                />
                <TableFilterPopover
                  options={FILTER_OPTIONS}
                  selected={filterSelected}
                  singleSelect
                  onSubmit={(sel) => {
                    setFilterSelected(sel.length > 0 ? [sel[0]] : ["active"])
                    setPage(1)
                  }}
                />
                <div className="relative w-full min-w-[220px] md:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Cari nama jadwal"
                    className="h-10 rounded-[5px] border-[#EAEAEA] pl-9 text-sm text-[#374957] placeholder:text-gray-400 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                      <TableHead className="w-12 px-5">
                        <Checkbox
                          checked={allChecked}
                          onCheckedChange={(checked) =>
                            toggleAll(checked === true)
                          }
                          aria-label="Pilih semua"
                        />
                      </TableHead>
                      <TableHead className="text-[#374957]">Nama</TableHead>
                      <TableHead className="text-[#374957]">Cabang</TableHead>
                      <TableHead className="text-[#374957]">
                        Tgl. Efektif
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
                          <TableCell className="px-5">
                            <Checkbox
                              checked={selectedIds.has(row.id)}
                              onCheckedChange={(checked) =>
                                toggleRow(row.id, checked === true)
                              }
                              aria-label={`Pilih ${row.name}`}
                            />
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.name}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.branch_name}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {formatEffectiveDate(row)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge active={!row.is_trashed} />
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

      <BranchScheduleDetailModal
        open={detailRow !== null}
        schedule={detailRow}
        onOpenChange={(open) => {
          if (!open) setDetailRow(null)
        }}
      />

      {confirmState && (
        <ConfirmDialog
          open
          type={confirmState.type}
          isLoading={isActionLoading}
          onOpenChange={(open) => {
            if (!open) setConfirmState(null)
          }}
          onConfirm={() => confirmState.onConfirm()}
        />
      )}

      {pageAlert && (
        <AlertModal
          open
          type={pageAlert.type}
          message={pageAlert.message}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setPageAlert(null)
          }}
        />
      )}
    </div>
  )
}

export default BranchSchedulePage
