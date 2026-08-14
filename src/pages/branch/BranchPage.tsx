import { useEffect, useState } from "react"
import {
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { BranchFormDrawer } from "@/components/branch/BranchFormDrawer"
import { useDebounce } from "@/hooks/useDebounce"

import {
  fetchBranches,
  deleteBranch,
  type BranchStatusFilter,
} from "@/services/branch/branch.service"
import type { BranchRow } from "@/types/branch/branch.types"

const BULK_OPTIONS: BulkActionOption[] = [
  { value: "restore", label: "Restore" },
  { value: "delete", label: "Hapus" },
  { value: "delete_permanent", label: "Hapus Permanen" },
]

// Status branch sekarang 3 pilihan yang saling eksklusif (bukan checkbox gabungan lagi)
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

export function BranchPage() {
  const [bulkValue, setBulkValue] = useState("")
  const [filterSelected, setFilterSelected] = useState<string[]>(["active"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<BranchRow | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)
  const [confirmState, setConfirmState] = useState<{
    type: ConfirmDialogType
    onConfirm: () => void
  } | null>(null)

  const [rows, setRows] = useState<BranchRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  // TableFilterPopover masih berbasis array, tapi ketiga opsi ini saling
  // eksklusif — ambil pilihan pertama, default ke "active" kalau kosong.
  const statusFilter: BranchStatusFilter =
    (filterSelected[0] as BranchStatusFilter) ?? "active"

  // Fetch data dari backend setiap kali page/perPage/search/filter berubah
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchBranches({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          is_trash: statusFilter,
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data branch. Coba lagi.")
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
    // TODO: panggil endpoint bulk action dgn [...selectedIds] & bulkValue (menyusul)
    console.log("bulk action", bulkValue, [...selectedIds])
  }

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  function rowActions(row: BranchRow): RowAction[] {
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
        onClick: () => {
          setEditingBranch(row)
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
                await deleteBranch(row.id)
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
            onConfirm: () => {
              console.log("restore", row.id)
              setPageAlert({
                type: "success",
                message: "Data berhasil direstore.",
              })
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
            onConfirm: () => {
              console.log("delete-permanent", row.id)
              setPageAlert({
                type: "error",
                message: "Data berhasil dihapus permanen.",
              })
            },
          }),
        // Selalu tampil sesuai ketentuan (tidak bergantung is_trashed)
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[#374957]">
          Wilayah Kerja / Branch
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEditingBranch(null)
            setDrawerOpen(true)
          }}
          className="h-10 gap-2 rounded-[5px] border-[#EAEAEA] bg-white text-sm font-normal text-[#374957] hover:bg-gray-50"
        >
          <Plus className="size-4" />
          Tambah
        </Button>
      </div>

      {/* Toolbar */}
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
              placeholder="Cari nama lokasi"
              className="h-10 rounded-[5px] border-[#EAEAEA] pl-9 text-sm text-[#374957] placeholder:text-gray-400 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
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
                <TableHead className="text-[#374957]">Nama Lokasi</TableHead>
                <TableHead className="text-[#374957]">Latitude</TableHead>
                <TableHead className="text-[#374957]">Longitude</TableHead>
                <TableHead className="text-[#374957]">Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-sm text-gray-400"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
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
                  <TableCell
                    colSpan={6}
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
                    <TableCell className="text-[#374957]">{row.name}</TableCell>
                    <TableCell className="text-[#374957]">
                      {row.latitude}
                    </TableCell>
                    <TableCell className="text-[#374957]">
                      {row.longitude}
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

      {/* Footer */}
      <div className="flex flex-col-reverse items-center justify-between gap-3 md:flex-row">
        <PerPageSelect value={perPage} onChange={handlePerPageChange} />
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {drawerOpen && (
        <BranchFormDrawer
          open={drawerOpen}
          branch={editingBranch}
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
            confirmState.onConfirm() // async, setConfirmState(null) ada di finally-nya
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

export default BranchPage
