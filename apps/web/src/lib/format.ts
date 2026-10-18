const snapshotDate = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
})

const quantity = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
})

const meters = new Intl.NumberFormat("en-US", {
  style: "unit",
  unit: "meter",
  maximumFractionDigits: 0,
})

const precise = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

export function formatSnapshot(iso: string | null | undefined) {
  if (!iso) return "—"
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return iso
  return snapshotDate.format(new Date(Date.UTC(year, month - 1, day)))
}

export function formatQuantity(value: number) {
  return quantity.format(value)
}

export function formatMeters(value: number) {
  return meters.format(value)
}

export function formatPrecise(value: number) {
  return precise.format(value)
}

export function canonicalReading(finding: { canonical_ppb?: number; canonical_ppt?: number }) {
  if (finding.canonical_ppb != null) return `${formatQuantity(finding.canonical_ppb)} ppb`
  if (finding.canonical_ppt != null) return `${formatQuantity(finding.canonical_ppt)} ppt`
  return "—"
}

export function sourceLabel(source: string) {
  if (source === "utility_ccr_average") return "Utility average"
  if (source === "deterministic_threshold") return "Recomputed gate"
  if (source === "snapshot") return "Local mirror"
  return source.replaceAll("_", " ")
}

export function statusLabel(status: string) {
  if (status === "certified") return "Certified"
  if (status === "human_review") return "Human review"
  if (status === "pending") return "Pending"
  return status.replaceAll("_", " ")
}
