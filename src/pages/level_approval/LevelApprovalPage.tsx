import { useCallback, useEffect, useState } from "react"
import { Eye, Inbox, Pencil, Trash2 } from "lucide-react"

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
import type { LevelApprovalItem } from "@/types/level_approval/level_approval.type"
import { getLevelApprovalList } from "@/services/level_approval/level_approval.service"

const COL_SPAN = 3

export function LevelApprovalPage() {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [rows, setRows] = useState<LevelApprovalItem[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await getLevelApprovalList({
          limit: perPage,
          offset: (page - 1) * perPage,
        })
        setRows(res.rows)
        setTotal(res.total)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data level approval. Coba lagi.")
        setRows([])
        setTotal(0)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [page, perPage])

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const showEmptyState = !isLoading && !error && rows.length === 0

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

  // TODO: ganti dengan drawer/dialog create begitu endpoint POST tersedia.
  const openCreate = useCallback(() => {
    console.log("[level-approval] create clicked")
  }, [])

  // TODO: ganti dengan aksi asli (detail/edit/delete) begitu endpoint tersedia.
  function rowActions(row: LevelApprovalItem): RowAction[] {
    return [
      {
        key: "detail",
        label: "View Detail",
        icon: Eye,
        onClick: () => console.log("[level-approval] detail", row.id),
      },
      {
        key: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: () => console.log("[level-approval] edit", row.id),
      },
      {
        key: "delete",
        label: "Hapus",
        icon: Trash2,
        destructive: true,
        onClick: () => console.log("[level-approval] delete", row.id),
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader
          title="Level Approval"
          actions={!showEmptyState && <AddButton onClick={openCreate} />}
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
                            description="Belum ada data untuk ditampilkan."
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
    </div>
  )
}

export default LevelApprovalPage
