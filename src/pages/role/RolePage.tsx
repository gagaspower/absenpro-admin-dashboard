import { useEffect, useState } from "react"
import { Inbox, ShieldCheck } from "lucide-react"

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
import { TableEmptyState } from "@/components/data-table/TableEmptyState"
import TableLoadingState from "@/components/data-table/TableLoadingState"
import { PageCard, PageCardHeader } from "@/components/PageCard"

import { fetchRole } from "@/services/role/role.service"
import type { RoleOption } from "@/types/roles/roles.types"
import { useAuth } from "@/hooks/useAuth"

export function RolePage() {
  const { hasPermission } = useAuth()
  const [rows, setRows] = useState<RoleOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetchRole()
        setRows(res.rows)
      } catch {
        if (controller.signal.aborted) return
        setError("Gagal memuat data role. Coba lagi.")
        setRows([])
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [])

  const showEmptyState = !isLoading && !error && rows.length === 0

  function rowActions(row: RoleOption): RowAction[] {
    return [
      {
        key: "hak-akses",
        label: "Atur Hak Akses",
        icon: ShieldCheck,
        onClick: () => {
          // TODO: arahkan ke halaman konfigurasi hak akses untuk role ini
        },
        hidden: !hasPermission("Edit Hak Akses Pengguna"),
      },
    ]
  }

  return (
    <div className="flex flex-col gap-4">
      <PageCard>
        <PageCardHeader title="Role" />

        {showEmptyState ? (
          <TableEmptyState
            icon={Inbox}
            title="Belum ada data role"
            description="Data role akan muncul di sini setelah tersedia."
          />
        ) : (
          <div className="mt-4 max-w-md overflow-hidden rounded-[5px] border border-[#EAEAEA] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="border-[#EAEAEA] bg-[#F7FCFA] hover:bg-[#F7FCFA]">
                  <TableHead className="text-[#374957]">Nama Role</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  <TableLoadingState colSpan={2} />
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="py-10 text-center text-sm text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow key={row.id} className="border-[#EAEAEA]">
                      <TableCell className="text-[#374957]">
                        {row.nama_role}
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
        )}
      </PageCard>
    </div>
  )
}

export default RolePage
