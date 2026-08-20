import { useEffect, useState } from "react"
import {
  Eye,
  Inbox,
  Pencil,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash,
  Trash2,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { useDebounce } from "@/hooks/useDebounce"

import { PegawaiFilterDrawer } from "@/components/pegawai/PegawaiFilterDrawer"
import { PegawaiFormDrawer } from "@/components/pegawai/PegawaiFormDrawer"

import {
  deleteMultiplePegawai,
  deletePegawai,
  fetchPegawai,
  forceDeleteMultiplePegawai,
  forceDeletePegawai,
  restoreMultiplePegawai,
  restorePegawai,
} from "@/services/pegawai/pegawai.service"
import {
  DEFAULT_PEGAWAI_FILTER,
  type PegawaiFilterState,
  type PegawaiRow,
} from "@/types/pegawai/pegawai.types"
import { PegawaiStatusBadge } from "@/components/pegawai/PegawaiStatusBadge"
import { AddButton } from "@/components/AddButton"
import {
  ConfirmDialog,
  type ConfirmDialogType,
} from "@/components/feedback/ConfirmDialog"
import TableLoadingState from "@/components/data-table/TableLoadingState"

// Endpoint bulk action pegawai belum tersedia dari backend — UI tetap
// disiapkan sesuai scope, onSubmit-nya sementara cuma nampilin info.
// JANGAN hilangkan/hide tombol ini walau endpoint blm ready — masih tahap develop.
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

export function PegawaiPage() {
  const [bulkValue, setBulkValue] = useState("")
  const [filters, setFilters] = useState<PegawaiFilterState>(
    DEFAULT_PEGAWAI_FILTER
  )
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [formDrawerOpen, setFormDrawerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [refreshKey, setRefreshKey] = useState(0)

  const [rows, setRows] = useState<PegawaiRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)
  const [editTarget, setEditTarget] = useState<PegawaiRow | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    type: ConfirmDialogType
    onConfirm: () => void
  } | null>(null)

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchPegawai({
          limit: perPage,
          offset: (page - 1) * perPage,
          search: debouncedSearch || undefined,
          is_trash: filters.isTrash,
          ...(filters.departemenId !== "all"
            ? { department_id: filters.departemenId }
            : {}),
          ...(filters.jabatanId !== "all"
            ? { position_id: filters.jabatanId }
            : {}),
          ...(filters.branchId !== "all"
            ? { branch_id: filters.branchId }
            : {}),
          ...(filters.shiftId !== "all" ? { shift_id: filters.shiftId } : {}),
          ...(filters.status !== "all" ? { status: filters.status } : {}),
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data pegawai. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [page, perPage, debouncedSearch, filters, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const allChecked = rows.length > 0 && rows.every((r) => selectedIds.has(r.id))

  // Aktif kalau user lagi cari atau filter drawer diubah dari default.
  const hasActiveFilter =
    Boolean(debouncedSearch) ||
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_PEGAWAI_FILTER)

  // Kosong total (belum ada data sama sekali, bukan hasil filter/search) →
  // sembunyikan toolbar + tabel + pagination, tampilkan empty state + tombol tambah.
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
            await restoreMultiplePegawai(ids)
            setPageAlert({
              type: "success",
              message: "Data berhasil direstore.",
            })
          } else if (bulkValue === "delete") {
            await deleteMultiplePegawai(ids)
            setPageAlert({ type: "success", message: "Data berhasil dihapus." })
          } else if (bulkValue === "delete_permanent") {
            await forceDeleteMultiplePegawai(ids)
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

  function handleApplyFilters(next: PegawaiFilterState) {
    setFilters(next)
    setPage(1)
  }

  // Endpoint edit/delete/restore/force-delete pegawai belum tersedia dari
  // backend. Row action tetap ditampilkan sesuai scope UI, action-nya
  // sementara console.log dulu — GANTI ke service call begitu endpoint ready.
  function rowActions(row: PegawaiRow): RowAction[] {
    return [
      {
        key: "detail",
        label: "View Detail",
        icon: Eye,
        onClick: () => console.log("[pegawai] detail", row.id),
      },
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => {
          setEditTarget(row)
          setFormDrawerOpen(true)
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
                await deletePegawai(row.id)
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
                await restorePegawai(row.id)
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
                await forceDeletePegawai(row.id)
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
          title="Data Pegawai"
          actions={
            !showEmptyState && (
              <AddButton
                onClick={() => {
                  setEditTarget(null)
                  setFormDrawerOpen(true)
                }}
              />
            )
          }
        />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada data pegawai"
            description="Tambahkan pegawai pertama untuk mulai mengelola data."
            action={
              <AddButton
                onClick={() => {
                  setEditTarget(null)
                  setFormDrawerOpen(true)
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

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="h-10 rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957]"
                >
                  <SlidersHorizontal className="size-4" />
                  Filter
                </Button>
                <div className="relative w-full min-w-[220px] md:w-64">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1)
                    }}
                    placeholder="Cari nama pegawai"
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
                      <TableHead className="text-[#374957]">J/K</TableHead>
                      <TableHead className="text-[#374957]">Jabatan</TableHead>
                      <TableHead className="text-[#374957]">
                        Departemen
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Status Pegawai
                      </TableHead>
                      <TableHead className="text-[#374957]">
                        Aktif/Tidak
                      </TableHead>
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
                            {row.gender}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.position.name}
                          </TableCell>
                          <TableCell className="text-[#374957]">
                            {row.department.name}
                          </TableCell>
                          <TableCell>
                            <PegawaiStatusBadge status={row.status} />
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

      <PegawaiFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />

      <PegawaiFormDrawer
        open={formDrawerOpen}
        onOpenChange={(next) => {
          setFormDrawerOpen(next)
          if (!next) setEditTarget(null)
        }}
        mode={editTarget ? "edit" : "create"}
        pegawai={editTarget}
        onCreated={(message) => {
          setSelectedIds(new Set())
          setRefreshKey((k) => k + 1)
          setPageAlert({ type: "success", message })
        }}
        onError={(message) => setPageAlert({ type: "error", message })}
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

export default PegawaiPage
