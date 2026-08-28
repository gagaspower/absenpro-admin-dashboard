import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Inbox, Pencil, Trash2, SlidersHorizontal } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  PerPageSelect,
  TablePagination,
} from "@/components/data-table/TableFooter"
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import TableLoadingState from "@/components/data-table/TableLoadingState"
import {
  RowActionsMenu,
  type RowAction,
} from "@/components/data-table/RowActionsMenu"
import { PageCard, PageCardHeader } from "@/components/PageCard"
import { AddButton } from "@/components/AddButton"

import {
  AlertModal,
  type AlertModalType,
} from "@/components/feedback/AlertModal"
import { LevelApprovalDeleteDialog } from "@/components/feedback/LevelApprovalDeleteDialog"

import type { LevelApprovalItem } from "@/types/level_approval/level_approval.type"
import {
  deleteLevelApproval,
  getLevelApprovalList,
} from "@/services/level_approval/level_approval.service"
import {
  DEFAULT_LEVEL_APPROVAL_FILTER,
  type LevelApprovalFilterState,
} from "@/types/jenis_cuti/jenis_cuti.types"
import { Button } from "@/components/ui/button"
import LevelApprovalFilterDrawer from "@/components/level_approval/LevelApprovalFilterDrawer"

const COL_SPAN = 3

interface PageAlert {
  type: AlertModalType
  message: string
}

export function LevelApprovalPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [rows, setRows] = useState<LevelApprovalItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isActionLoading, setIsActionLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null)

  const [deleteRow, setDeleteRow] = useState<LevelApprovalItem | null>(null)
  const [filters, setFilters] = useState<LevelApprovalFilterState>(
    DEFAULT_LEVEL_APPROVAL_FILTER
  )

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await getLevelApprovalList({
          limit: perPage,
          offset: (page - 1) * perPage,
          ...(filters.departmentId !== "all"
            ? { department_id: filters.departmentId }
            : {}),
          ...(filters.leaveTypeId !== "all"
            ? { leave_type_id: filters.leaveTypeId }
            : {}),
        })

        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return

        setError("Gagal memuat data level approval. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => controller.abort()
  }, [page, perPage, filters, refreshKey])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const hasActiveFilter =
    filters.departmentId !== "all" || filters.leaveTypeId !== "all"

  const showEmptyState =
    !isLoading && !error && rows.length === 0 && !hasActiveFilter

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  function handleApplyFilters(next: LevelApprovalFilterState) {
    setFilters(next)
    setPage(1)
  }

  const openCreate = useCallback(() => {
    navigate("/dashboard/level-approval/create")
  }, [navigate])

  function rowActions(row: LevelApprovalItem): RowAction[] {
    return [
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => navigate(`/dashboard/level-approval/edit/${row.id}`),
      },
      {
        key: "delete",
        label: "Hapus",
        icon: Trash2,
        destructive: true,
        onClick: () => setDeleteRow(row),
      },
    ]
  }

  async function handleDelete() {
    if (!deleteRow) return

    setIsActionLoading(true)

    try {
      await deleteLevelApproval(deleteRow.id)

      setDeleteRow(null)
      setRefreshKey((key) => key + 1)

      setPageAlert({
        type: "success",
        message: "Data berhasil dihapus.",
      })
    } catch {
      setDeleteRow(null)

      setPageAlert({
        type: "error",
        message: "Gagal menghapus data. Coba lagi.",
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader
          title="Level Approval"
          actions={
            !showEmptyState && (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFilterDrawerOpen(true)}
                  className="h-10 rounded-[5px] border-[#DDE3E6] text-sm font-normal text-[#374957]"
                >
                  <SlidersHorizontal className="size-4" />
                  Filter
                </Button>

                <AddButton onClick={openCreate} />
              </div>
            )
          }
        />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada data level approval"
            description="Tambahkan level approval pertama untuk mulai mengelola data."
            action={<AddButton onClick={openCreate} />}
          />
        ) : (
          <>
            <div className="mt-4 overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                      <TableHead className="text-[#374957]">
                        Jenis Cuti
                      </TableHead>

                      <TableHead className="text-[#374957]">
                        Departemen
                      </TableHead>

                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableLoadingState colSpan={COL_SPAN} />
                    ) : error ? (
                      <TableRow>
                        <TableCell
                          colSpan={COL_SPAN}
                          className="py-10 text-center text-sm text-red-500"
                        >
                          {error}
                        </TableCell>
                      </TableRow>
                    ) : rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={COL_SPAN}>
                          <TableEmptyState
                            icon={Inbox}
                            title="Data tidak ditemukan"
                            description="Belum ada data untuk filter yang dipilih."
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => (
                        <TableRow key={row.id} className="border-[#EAEAEA]">
                          <TableCell className="text-[#374957]">
                            {row.nama_leave_type}
                          </TableCell>

                          <TableCell className="text-[#374957]">
                            {row.nama_department}
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

      <LevelApprovalFilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        filters={filters}
        onApply={handleApplyFilters}
      />

      <LevelApprovalDeleteDialog
        open={deleteRow !== null}
        isLoading={isActionLoading}
        onOpenChange={(open) => {
          if (!open && !isActionLoading) {
            setDeleteRow(null)
          }
        }}
        onConfirm={handleDelete}
      />

      {pageAlert && (
        <AlertModal
          open
          type={pageAlert.type}
          message={pageAlert.message}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setPageAlert(null)
            }
          }}
        />
      )}
    </div>
  )
}

export default LevelApprovalPage
