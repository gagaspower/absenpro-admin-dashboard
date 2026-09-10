import type {
  RolePermissionItem,
  RolePermissionMenu,
} from "@/types/roles/roles.types"

// Fixed display order for common CRUD/system actions.
// Any new action (Archive, Publish, etc.) is automatically appended after
// these columns in the order it is first encountered.
const CANONICAL_COLUMN_ORDER = [
  "View",
  "Create",
  "Edit",
  "Delete",
  "Restore",
  "Force Delete",
  "Approve",
  "Reject",
]

// Longest-first so "Force Delete" is matched before "Delete".
// Copy the array so the canonical display order is not mutated.
const MATCH_ACTIONS = [...CANONICAL_COLUMN_ORDER].sort(
  (a, b) => b.length - a.length
)

const CANONICAL_RANK = new Map(
  CANONICAL_COLUMN_ORDER.map((action, i) => [action, i])
)

function parsePermissionName(name: string): { action: string; entity: string } {
  for (const action of MATCH_ACTIONS) {
    if (name.startsWith(`${action} `)) {
      return { action, entity: name.slice(action.length + 1) }
    }
  }

  const [firstWord, ...rest] = name.split(" ")
  return {
    action: firstWord,
    entity: rest.join(" ") || name,
  }
}

export interface PermissionMatrixRow {
  id: string
  entityName: string
  cells: Record<string, RolePermissionItem | undefined>
}

export interface PermissionMatrix {
  columns: string[]
  rows: PermissionMatrixRow[]
}

/**
 * Builds one global permission matrix from every menu.
 *
 * There is intentionally no menu/parent grouping here. Every permission
 * parent becomes a row in the same table and every action becomes a column.
 * New actions are automatically appended after the canonical columns above.
 */
export function buildPermissionMatrix(
  menus: RolePermissionMenu[]
): PermissionMatrix {
  const columnsSet = new Set<string>()
  const rows: PermissionMatrixRow[] = []

  for (const menu of menus) {
    for (const parent of menu.permission_parents) {
      const cells: Record<string, RolePermissionItem> = {}
      let entityName = parent.nama_parent ?? ""

      for (const perm of parent.permissions) {
        const { action, entity } = parsePermissionName(perm.permission_name)

        cells[action] = perm
        columnsSet.add(action)

        if (!entityName) {
          entityName = entity
        }
      }

      rows.push({
        id: parent.id,
        entityName: entityName || "Umum",
        cells,
      })
    }
  }

  const columns = Array.from(columnsSet).sort((a, b) => {
    const ai = CANONICAL_RANK.get(a) ?? 999
    const bi = CANONICAL_RANK.get(b) ?? 999
    return ai - bi
  })

  return { columns, rows }
}

export function flattenPermissionIds(
  menus: RolePermissionMenu[],
  predicate: (item: RolePermissionItem) => boolean
): string[] {
  const ids: string[] = []

  for (const menu of menus) {
    for (const parent of menu.permission_parents) {
      for (const perm of parent.permissions) {
        if (predicate(perm)) ids.push(perm.id)
      }
    }
  }

  return ids
}
