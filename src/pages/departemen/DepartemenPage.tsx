import { useEffect, useState } from "react"
import { Eye, Pencil, RotateCcw, Search, Trash, Trash2 } from "lucide-react"

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
import { useDebounce } from "@/hooks/useDebounce"

import { fetchDepartemen } from "@/services/departemen/departemen.service"
import type { DepartemenRow } from "@/types/departemen/departemen.types"

const FILTER_OPTIONS: FilterCheckboxOption[] = [
  { id: "false", label: "Aktif" },
  { id: "true", label: "Sudah dihapus" },
]

const SEARCH_DEBOUNCE_MS = 400

export function DepartemenPage() {
  const [filterSelected, setFilterSelected] = useState<string[]>(["false"])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [rows, setRows] = useState<DepartemenRow[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS)

  const isTrash = filterSelected[0] === "true"

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
          is_trash: isTrash,
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
  }, [page, perPage, debouncedSearch, isTrash])

  const totalPages = Math.max(1, Math.ceil(total / perPage))

  function handlePerPageChange(value: number) {
    setPerPage(value)
    setPage(1)
  }

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
        onClick: () => console.log("edit", row.id),
        hidden: row.is_trashed,
      },
      {
        key: "delete",
        label: "Hapus",
        icon: Trash2,
        destructive: true,
        onClick: () => console.log("delete", row.id),
        hidden: row.is_trashed,
      },
      {
        key: "restore",
        label: "Restore",
        icon: RotateCcw,
        onClick: () => console.log("restore", row.id),
        hidden: !row.is_trashed,
      },
      {
        key: "delete-permanent",
        label: "Hapus Permanen",
        icon: Trash,
        destructive: true,
        onClick: () => console.log("delete-permanent", row.id),
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Departemen" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
          <div className="flex items-center gap-2">
            <TableFilterPopover
              options={FILTER_OPTIONS}
              selected={filterSelected}
              singleSelect
              onSubmit={(sel) => {
                setFilterSelected(sel.length > 0 ? [sel[0]] : ["false"])
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
                      colSpan={4}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      Memuat data...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-gray-400"
                    >
                      Tidak ada data.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} className="border-[#EAEAEA]">
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
    </div>
  )
}
