import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { WatershedMap } from "./components/WatershedMap"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./components/ui/table"

type Line = { id: string; material: "lead" | "copper" | "unknown"; lat: number; lon: number }

type Finding = {
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

type Investigation = {
  thread_id: string
  status: string
  iteration: number
  data_source: string | null
  snapshot_date: string | null
  rejection_vector: string[]
  audit_trail: { iteration: number; result: string }[]
  docket: {
    petition: string
    findings: Finding[]
    geochemical_profiles: { ph: number; alkalinity_mg_l: number; corrosive: boolean; index: number }
    exposure: {
      vulnerability_score: number
      impacted_schools: { school: string; service_line_id: string; distance_m: number }[]
    }
  } | null
}

type Watershed = { service_lines: Line[]; system_name: string; snapshot_date: string }

const materialVariant = {
  lead: "lead",
  copper: "copper",
  unknown: "unknown",
} as const

export default function App() {
  const [address, setAddress] = useState("81 Congress St, Newark, NJ")
  const watershed = useQuery({
    queryKey: ["watershed", "NJ0714001"],
    queryFn: async () => {
      const response = await fetch("/api/watersheds/NJ0714001")
      if (!response.ok) throw new Error("watershed snapshot unavailable")
      return (await response.json()) as Watershed
    },
  })
  const investigation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, pwsid: "NJ0714001" }),
      })
      if (!response.ok) throw new Error("investigation rejected")
      return (await response.json()) as Investigation
    },
  })
  const docket = investigation.data?.docket
  const lines = watershed.data?.service_lines ?? []

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-8">
      <header className="flex flex-col gap-3 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Field accession · NJ0714001</p>
          <h1 className="font-serif text-5xl leading-none text-balance">AquaSentry</h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Newark tap results, checked against the lead action level and the PFOA/PFOS MCL. Utility averages do not
            certify a sample as safe.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          Snapshot {watershed.data?.snapshot_date ?? "—"}
          <br />
          {watershed.data?.system_name ?? "Loading watershed mirror"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <WatershedMap lines={lines} />
        <Card>
          <CardHeader>
            <CardTitle>Service lines</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {lines.map((line) => (
              <div key={line.id} className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs">{line.id}</span>
                <Badge variant={materialVariant[line.material]}>{line.material}</Badge>
              </div>
            ))}
            <form
              className="mt-2 flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                investigation.mutate()
              }}
            >
              <label className="flex flex-col gap-1 text-sm">
                Street address
                <input
                  className="rounded-sm border border-border bg-background px-3 py-2"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </label>
              <Button type="submit" disabled={investigation.isPending}>
                {investigation.isPending ? "Running evaluator…" : "Open water docket"}
              </Button>
            </form>
            {watershed.isError ? <p className="text-sm text-[var(--lead)]">Start the API on port 8102.</p> : null}
          </CardContent>
        </Card>
      </div>

      {investigation.data ? (
        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Toxicity vs regulation</CardTitle>
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {investigation.data.status} · iteration {investigation.data.iteration} · {investigation.data.data_source}{" "}
                {investigation.data.snapshot_date}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Analyte</TableHead>
                    <TableHead>Canonical</TableHead>
                    <TableHead>Gate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docket?.findings.map((finding) => (
                    <TableRow key={`${finding.analyte}-${finding.location}`}>
                      <TableCell>
                        <div className="font-medium capitalize">{finding.analyte}</div>
                        <div className="text-xs text-muted-foreground">{finding.location}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {finding.canonical_ppb ?? finding.canonical_ppt} {finding.canonical_ppb != null ? "ppb" : "ppt"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={finding.exceeds ? "lead" : "copper"}>{finding.exceeds ? "exceeds" : "within"}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {docket ? (
                <p className="mt-4 text-sm">
                  Corrosivity index {docket.geochemical_profiles.index} · pH {docket.geochemical_profiles.ph} ·
                  alkalinity {docket.geochemical_profiles.alkalinity_mg_l} mg/L · schools in the lead buffer:{" "}
                  {docket.exposure.impacted_schools.map((school) => school.school).join(", ") || "none"}
                </p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Evaluator feed</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex flex-col gap-2 font-mono text-xs">
                {investigation.data.audit_trail.map((step, index) => (
                  <li key={`${step.result}-${index}`}>
                    pass {step.iteration}: {step.result}
                  </li>
                ))}
              </ol>
              {investigation.data.rejection_vector[0] ? (
                <p className="text-sm leading-relaxed">{investigation.data.rejection_vector[0]}</p>
              ) : null}
              {docket ? (
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-sm bg-muted p-4 font-mono text-xs leading-relaxed">
                  {docket.petition}
                </pre>
              ) : (
                <p className="text-sm">The docket stopped for human review. No petition was certified.</p>
              )}
            </CardContent>
          </Card>
        </section>
      ) : null}
    </div>
  )
}
