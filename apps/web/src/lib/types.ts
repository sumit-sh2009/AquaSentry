export type LineMaterial = "lead" | "copper" | "unknown"

export type ServiceLine = {
  id: string
  material: LineMaterial
  lat: number
  lon: number
}

export type Finding = {
  analyte: string
  location: string
  reported_value: number
  reported_unit: string
  exceeds: boolean
  classification_source: string
  citation: string
  canonical_ppb?: number
  canonical_ppt?: number
}

export type GeochemicalProfile = {
  ph: number
  alkalinity_mg_l: number
  corrosive: boolean
  index: number
  huc12?: string
  station?: string
}

export type ImpactedSchool = {
  school: string
  service_line_id: string
  distance_m: number
}

export type Docket = {
  petition: string
  findings: Finding[]
  geochemical_profiles: GeochemicalProfile | null
  exposure: {
    vulnerability_score: number
    buffer_m?: number
    impacted_schools: ImpactedSchool[]
  } | null
}

export type AuditStep = {
  iteration: number
  result: string
  errors?: string[]
}

export type Investigation = {
  thread_id: string
  status: string
  iteration: number
  data_source: string | null
  snapshot_date: string | null
  rejection_vector: string[]
  audit_trail: AuditStep[]
  docket: Docket | null
}

export type Watershed = {
  service_lines: ServiceLine[]
  system_name: string
  snapshot_date: string
  pwsid?: string
}
