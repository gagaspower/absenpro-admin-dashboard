import type {
  RolePermissionItem,
  RolePermissionMenu,
} from "@/types/roles/roles.types"

// Fixed display order requested: View | Create | Edit | Delete | Restore | Force Delete.
// Anything else (Approve, Reject, ...) is appended after, in first-seen order.
const CANONICAL_COLUMN_ORDER = [
  "View",
  "Create",
  "Edit",
  "Delete",
  "Restore",
  "Force Delete",
]

// Longest-first, only for parsing "{Action} {Entity}" prefixes correctly
// (e.g. "Force Delete" must be matched before "Delete").
const MATCH_ACTIONS = [...CANONICAL_COLUMN_ORDER, "Approve", "Reject"].sort(
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
  return { action: firstWord, entity: rest.join(" ") || name }
}

export interface MatrixRow {
  parentId: string
  entityName: string
  cells: Record<string, RolePermissionItem | undefined>
}

export interface MenuMatrix {
  menuId: string
  menuName: string
  columns: string[]
  rows: MatrixRow[]
}

export function buildMenuMatrix(menu: RolePermissionMenu): MenuMatrix {
  const columnsSet = new Set<string>()

  const rows: MatrixRow[] = menu.permission_parents.map((parent) => {
    const cells: Record<string, RolePermissionItem> = {}
    let entityName = parent.nama_parent ?? ""

    for (const perm of parent.permissions) {
      const { action, entity } = parsePermissionName(perm.permission_name)
      cells[action] = perm
      columnsSet.add(action)
      if (!entityName) entityName = entity
    }

    return { parentId: parent.id, entityName: entityName || "Umum", cells }
  })

  // Stable sort: canonical actions first in fixed order, everything else
  // after, keeping the relative order they were first seen in (Set preserves
  // insertion order, Array.sort is stable in modern JS engines).
  const columns = Array.from(columnsSet).sort((a, b) => {
    const ai = CANONICAL_RANK.get(a) ?? 999
    const bi = CANONICAL_RANK.get(b) ?? 999
    return ai - bi
  })

  return { menuId: menu.id, menuName: menu.nama_menu, columns, rows }
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
