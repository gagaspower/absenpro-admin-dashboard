import { useEffect, useState } from "react"
import { Inbox, Pencil, RotateCcw, Search, Trash, Trash2 } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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
import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
import {
  ConfirmDialog,
  type ConfirmDialogType,
} from "@/components/feedback/ConfirmDialog"
import { StatusBadge } from "@/components/data-table/StatusBadge"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import { ShiftFormDrawer } from "@/components/shift/ShiftFormDrawer"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { useDebounce } from "@/hooks/useDebounce"

import {
  fetchShift,
  deleteShift,
  restoreShift,
  forceDeleteShift,
  restoreMultipleShift,
  deleteMultipleShift,
  forceDeleteMultipleShift,
  type ShiftStatusFilter,
} from "@/services/shift/shift.service"
import type { ShiftRow } from "@/types/shift/shift.types"
import { AddButton } from "@/components/AddButton"
import TableLoadingState from "@/components/data-table/TableLoadingState"

const BULK_OPTIONS: BulkActionOption[] = [
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Hapus" },
  { value: "delete_permanent", label: "Hapus Permanen" },
]

const FILTER_OPTIONS: FilterCheckboxOption[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "trashed", label: "Sudah dihapus" },
]

const SEARCH_DEBOUNCE_MS = 400

interface PageAlert {
  type: AlertModalType
  message: string
}

export function ShiftPage() {
  const [bulkValue, setBulkValue] = useState("")
  const [filterSelected, setFilterSelected] = useState<string[]>(["active"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<ShiftRow | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)
  const [confirmState, setConfirmState] = useState<{
    type: ConfirmDialogType
    onConfirm: () => void
  } | null>(null)

  const [rows, setRows] = useState<ShiftRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const statusFilter: ShiftStatusFilter =
    (filterSelected[0] as ShiftStatusFilter) ?? "active"

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchShift({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          is_trash: statusFilter,
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data shift. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [page, perPage, debouncedSearch, statusFilter, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  const hasActiveFilter = Boolean(debouncedSearch) || statusFilter !== "active"

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
            await restoreMultipleShift(ids)
            setPageAlert({
              type: "success",
              message: "Data berhasil direstore.",
            })
          } else if (bulkValue === "delete") {
            await deleteMultipleShift(ids)
            setPageAlert({ type: "success", message: "Data berhasil dihapus." })
          } else if (bulkValue === "delete_permanent") {
            await forceDeleteMultipleShift(ids)
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

  function rowActions(row: ShiftRow): RowAction[] {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => {
          setEditingShift(row)
          setDrawerOpen(true)
        },
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
                await deleteShift(row.id)
                setSelectedIds((prev) => {
                  const next = new Set(prev)
                  next.delete(row.id)
                  return next
                })
                setRefreshKey((k) => k + 1)
                setConfirmState(null)
                setPageAlert({
                  type: "success",
                  message: "Data berhasil dihapus.",
                })
              } catch {
                setPageAlert({
                  type: "error",
                  message: "Gagal menghapus data. Coba lagi.",
                })
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
                await restoreShift(row.id)
                setSelectedIds((prev) => {
                  const next = new Set(prev)
                  next.delete(row.id)
                  return next
                })
                setRefreshKey((k) => k + 1)
                setConfirmState(null)
                setPageAlert({
                  type: "success",
                  message: "Data berhasil direstore.",
                })
              } catch {
                setPageAlert({
                  type: "error",
                  message: "Gagal merestore data. Coba lagi.",
                })
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
                await forceDeleteShift(row.id)
                setSelectedIds((prev) => {
                  const next = new Set(prev)
                  next.delete(row.id)
                  return next
                })
                setRefreshKey((k) => k + 1)
                setConfirmState(null)
                setPageAlert({
                  type: "success",
                  message: "Data berhasil dihapus permanen.",
                })
              } catch {
                setPageAlert({
                  type: "error",
                  message: "Gagal menghapus permanen. Coba lagi.",
                })
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
          title="Shift / Jadwal Kerja"
          actions={
            !showEmptyState && (
              <AddButton
                onClick={() => {
                  setEditingShift(null)
                  setDrawerOpen(true)
                }}
              />
            )
          }
        />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada data shift"
            description="Tambahkan shift pertama untuk mulai mengelola jadwal kerja."
            action={
              <AddButton
                onClick={() => {
                  setEditingShift(null)
                  setDrawerOpen(true)
                }}
              />
            }
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

              <div className="flex items-center gap-2">
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
                    placeholder="Cari nama shift"
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
                      <TableHead className="text-[#374957]">
                        Nama Shift
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Jam Kerja
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Absen Masuk
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Absen Pulang
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Toleransi
                      </TableHead>
                      <TableHead className="text-[#374957]">Status</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableLoadingState colSpan={8} />
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-10 text-center text-sm text-red-500"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
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
                            {row.jam_kerja || "-"}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.jam_absen_masuk || "-"}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.jam_absen_pulang || "-"}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.late_tolerance_minutes} menit
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

      {drawerOpen && (
        <ShiftFormDrawer
          open={drawerOpen}
          shift={editingShift}
          onOpenChange={setDrawerOpen}
          onCreated={(message) => {
            setSelectedIds(new Set())
            setRefreshKey((key) => key + 1)
            setPageAlert({
              type: "success",
              message,
            })
          }}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          open
          type={confirmState.type}
          isLoading={isActionLoading}
          onOpenChange={(open) => {
            if (!open) setConfirmState(null)
          }}
          onConfirm={() => {
            confirmState.onConfirm()
          }}
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

export default ShiftPage
