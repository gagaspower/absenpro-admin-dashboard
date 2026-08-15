import { useCallback, useEffect, useState } from "react"
import { Eye, Pencil, RotateCcw, Search, Trash, Trash2 } from "lucide-react"

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
import { PageCard, PageCardHeader } from "@/components/PageCard"
import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
import {
  ConfirmDialog,
  type ConfirmDialogType,
} from "@/components/feedback/ConfirmDialog"
import { useDebounce } from "@/hooks/useDebounce"

import { DepartemenFormDrawer } from "@/components/departemen/DepartemenFormDrawer"
import {
  deleteDepartemen,
  fetchDepartemen,
  forceDeleteDepartemen,
  restoreDepartemen,
  type DepartemenStatusFilter,
} from "@/services/departemen/departemen.service"
import type { DepartemenRow } from "@/types/departemen/departemen.types"
import { AddButton } from "@/components/AddButton"

const FILTER_OPTIONS: FilterCheckboxOption[] = [
  { id: "all", label: "Semua" },
  { id: "active", label: "Aktif" },
  { id: "trashed", label: "Sudah dihapus" },
]

// Bulk action API belum tersedia. UI disiapkan lebih dulu sesuai scope.
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

export function DepartemenPage() {
  const [bulkValue, setBulkValue] = useState("")
  const [filterSelected, setFilterSelected] = useState<string[]>(["false"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [rows, setRows] = useState<DepartemenRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRow, setEditingRow] = useState<DepartemenRow | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)
  const [confirmState, setConfirmState] = useState<{
    type: ConfirmDialogType
    onConfirm: () => void
  } | null>(null)

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)
  const statusFilter: DepartemenStatusFilter =
    (filterSelected[0] as DepartemenStatusFilter) ?? "active"

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchDepartemen({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          is_trash: statusFilter,
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data departemen. Coba lagi.")
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
    // TODO: sambungkan ke endpoint bulk action departemen saat API tersedia.
    console.log("bulk action", bulkValue, [...selectedIds])
  }

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  const openCreateDrawer = useCallback(() => {
    setEditingRow(null)
    setDrawerOpen(true)
  }, [])

  const openEditDrawer = useCallback((row: DepartemenRow) => {
    setEditingRow(row)
    setDrawerOpen(true)
  }, [])

  const handleSaved = useCallback((message: string) => {
    setPageAlert({ type: "success", message })
    setRefreshKey((k) => k + 1)
  }, [])

  function rowActions(row: DepartemenRow): RowAction[] {
    return [
      {
        key: "detail",
        label: "View Detail",
        icon: Eye,
        onClick: () => console.log("detail", row.id),
      },
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => openEditDrawer(row),
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
                await deleteDepartemen(row.id)
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
                await restoreDepartemen(row.id)
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
                await forceDeleteDepartemen(row.id)
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
          title="Departemen"
          actions={<AddButton onClick={openCreateDrawer} />}
        />

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
                placeholder="Cari nama departemen"
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
                      onCheckedChange={(checked) => toggleAll(checked === true)}
                      aria-label="Pilih semua"
                    />
                  </TableHead>
                  <TableHead className="text-[#374957]">Nama</TableHead>
                  <TableHead className="text-[#374957]">Deskripsi</TableHead>
                  <TableHead className="text-[#374957]">Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      Tidak ada data.
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
                        {row.desc ?? "-"}
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
      </PageCard>

      <DepartemenFormDrawer
        open={drawerOpen}
        departemen={editingRow}
        onOpenChange={setDrawerOpen}
        onCreated={handleSaved}
      />

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

export default DepartemenPage
