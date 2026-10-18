import { Copy } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { canonicalReading, formatMeters, formatPrecise, formatSnapshot, sourceLabel, statusLabel } from "@/lib/format"
import type { Investigation } from "@/lib/types"
import { useQueryState } from "@/lib/use-query-state"

const panels = ["findings", "exposure", "petition", "trace"] as const
type PanelId = (typeof panels)[number]

function isPanel(value: string): value is PanelId {
  return panels.some((panel) => panel === value)
}

export function Docket({
  investigation,
  pending,
  failed,
}: {
  investigation: Investigation | undefined
  pending: boolean
  failed: boolean
}) {
  const [rawPanel, setPanel] = useQueryState("panel", "findings")
  const panel: PanelId = isPanel(rawPanel) ? rawPanel : "findings"
  const petition = investigation?.docket?.petition
  const [copying, setCopying] = useState(false)

  return (
    <section
      id="docket"
      aria-labelledby="docket-heading"
      className="section-shell scroll-mt-24 bg-olive text-forest dark:bg-[color-mix(in_srgb,#01472e_88%,#e9edc9)] dark:text-sage"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="label-track">Docket</p>
          <h2 id="docket-heading" className="font-heading text-6xl leading-[0.85] tracking-[-0.05em] uppercase md:text-8xl">
            Water docket
          </h2>
          <p className="text-pretty" aria-live="polite">
            {pending
              ? "Running the evaluator…"
              : investigation
                ? `${statusLabel(investigation.status)} · pass ${investigation.iteration} · ${sourceLabel(investigation.data_source ?? "snapshot")} · ${formatSnapshot(investigation.snapshot_date)}`
                : "No live docket yet. Findings, exposure, the petition, and the evaluator trace fill in after you check an address. The Newark readings above are the fixture those panels will judge."}
          </p>
        </div>

        {failed ? (
          <Alert variant="destructive">
            <AlertTitle>The investigation did not run</AlertTitle>
            <AlertDescription>Start the API on port 8102, then try the address again.</AlertDescription>
          </Alert>
        ) : null}

        <Tabs value={panel} onValueChange={setPanel}>
          <TabsList>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="exposure">Exposure</TabsTrigger>
            <TabsTrigger value="petition">Petition</TabsTrigger>
            <TabsTrigger value="trace">Trace</TabsTrigger>
          </TabsList>
          <TabsContent value="findings">
            <Findings investigation={investigation} />
          </TabsContent>
          <TabsContent value="exposure">
            <Exposure investigation={investigation} />
          </TabsContent>
          <TabsContent value="petition">
            <Petition
              investigation={investigation}
              copying={copying}
              onCopy={async () => {
                if (!petition) return
                setCopying(true)
                try {
                  await navigator.clipboard.writeText(petition)
                  toast.success("Petition copied.")
                } catch {
                  toast.error("Copy failed. Select the petition text and copy it manually.")
                } finally {
                  setCopying(false)
                }
              }}
            />
          </TabsContent>
          <TabsContent value="trace">
            <Trace investigation={investigation} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

function Findings({ investigation }: { investigation: Investigation | undefined }) {
  const findings = investigation?.docket?.findings ?? []
  if (!investigation) return <Waiting copy="Open a docket to see each analyte against its gate." />
  if (!investigation.docket) return <Held investigation={investigation} />
  return (
    <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
      <CardHeader>
        <CardTitle>Toxicity against the rule</CardTitle>
        <CardDescription>Canonical units after conversion. The gate is the statute, not the utility flag.</CardDescription>
      </CardHeader>
      <CardContent>
        {findings.length === 0 ? (
          <p className="text-pretty">This docket has no findings.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Analyte</TableHead>
                <TableHead>Reported</TableHead>
                <TableHead>Canonical</TableHead>
                <TableHead>Gate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((finding) => (
                <TableRow key={`${finding.analyte}-${finding.location}`}>
                  <TableCell>
                    <div className="font-medium capitalize" translate="no">
                      {finding.analyte}
                    </div>
                    <div className="max-w-xs text-pretty opacity-80">{finding.location}</div>
                    <div className="text-muted-foreground mt-1 font-mono text-[11px]" translate="no">
                      {finding.citation}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">
                    {finding.reported_value} {finding.reported_unit}
                  </TableCell>
                  <TableCell className="font-mono text-xs tabular-nums">{canonicalReading(finding)}</TableCell>
                  <TableCell>
                    <Badge variant={finding.exceeds ? "destructive" : "secondary"}>
                      {finding.exceeds ? "Exceeds" : "Within"}
                    </Badge>
                    <div className="text-muted-foreground mt-2 text-xs">{sourceLabel(finding.classification_source)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function Exposure({ investigation }: { investigation: Investigation | undefined }) {
  const profile = investigation?.docket?.geochemical_profiles
  const exposure = investigation?.docket?.exposure
  if (!investigation) return <Waiting copy="Open a docket to see corrosivity and schools inside the lead buffer." />
  if (!investigation.docket || !profile || !exposure) return <Held investigation={investigation} />
  const schools = exposure.impacted_schools
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
        <CardHeader>
          <CardTitle>Finished water</CardTitle>
          <CardDescription>
            {profile.station ? <span translate="no">{profile.station}</span> : "USGS fixture"}
            {profile.huc12 ? (
              <>
                {" "}
                · HUC-12 <span translate="no">{profile.huc12}</span>
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Stat term="pH" value={formatPrecise(profile.ph)} />
            <Stat term="Alkalinity" value={`${formatPrecise(profile.alkalinity_mg_l)} mg/L`} />
            <Stat term="Index" value={formatPrecise(profile.index)} />
            <Stat term="Corrosive" value={profile.corrosive ? "Yes" : "No"} />
          </dl>
          <p className="mt-4 text-pretty opacity-80">
            Vulnerability score <span className="text-foreground font-mono tabular-nums">{exposure.vulnerability_score}</span>
            {exposure.buffer_m ? <> · buffer {formatMeters(exposure.buffer_m)}</> : null}
          </p>
        </CardContent>
      </Card>
      <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
        <CardHeader>
          <CardTitle>Schools in the buffer</CardTitle>
          <CardDescription>Distance to a known lead line. The graph does not interpolate a plume.</CardDescription>
        </CardHeader>
        <CardContent>
          {schools.length === 0 ? (
            <p className="text-pretty">No school in this snapshot sits inside the lead buffer.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Line</TableHead>
                  <TableHead>Distance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school) => (
                  <TableRow key={`${school.school}-${school.service_line_id}`}>
                    <TableCell>{school.school}</TableCell>
                    <TableCell className="font-mono text-xs" translate="no">
                      {school.service_line_id}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{formatMeters(school.distance_m)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Petition({
  investigation,
  copying,
  onCopy,
}: {
  investigation: Investigation | undefined
  copying: boolean
  onCopy: () => void
}) {
  const petition = investigation?.docket?.petition
  if (!investigation) return <Waiting copy="A certified pass writes a petition that cites 40 CFR 141.85." />
  if (!petition) return <Held investigation={investigation} />
  return (
    <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
      <CardHeader>
        <CardTitle>Petition draft</CardTitle>
        <CardDescription>
          Public-education request for the named tap.{" "}
          <span className="mt-1 block font-mono text-xs break-all" translate="no">
            {investigation.thread_id}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button type="button" variant="outline" disabled={copying} onClick={onCopy} className="w-fit min-h-11">
          {copying ? <Spinner data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
          {copying ? "Copying…" : "Copy petition"}
        </Button>
        <pre className="overflow-x-auto font-mono text-xs leading-6 break-words whitespace-pre-wrap">{petition}</pre>
      </CardContent>
    </Card>
  )
}

function Trace({ investigation }: { investigation: Investigation | undefined }) {
  if (!investigation) return <Waiting copy="The trace lists each evaluator pass after you open a docket." />
  const steps = investigation.audit_trail
  return (
    <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
      <CardHeader>
        <CardTitle>Evaluator feed</CardTitle>
        <CardDescription>At most three passes. The third failure exits to human review.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {steps.length === 0 ? (
          <p className="text-pretty">This run recorded no passes.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {steps.map((step, index) => (
              <li key={`${step.result}-${step.iteration}-${index}`} className="flex flex-col gap-1 border-l-2 pl-4">
                <span className="font-mono text-xs uppercase">
                  Pass {step.iteration}: {statusLabel(step.result)}
                </span>
                {step.errors?.length ? (
                  <span className="text-pretty opacity-80">{step.errors.join(" ")}</span>
                ) : null}
              </li>
            ))}
          </ol>
        )}
        {investigation.rejection_vector.length > 0 ? (
          <>
            <Separator />
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground font-mono text-xs tracking-[0.14em] uppercase">Rejection</p>
              <ul className="flex flex-col gap-2">
                {investigation.rejection_vector.map((item) => (
                  <li key={item} className="text-pretty">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}

function Held({ investigation }: { investigation: Investigation }) {
  return (
    <Alert>
      <AlertTitle>{statusLabel(investigation.status)}</AlertTitle>
      <AlertDescription>
        The docket stopped for human review, so no petition was certified.
        {investigation.rejection_vector[0] ? ` ${investigation.rejection_vector[0]}` : ""}
      </AlertDescription>
    </Alert>
  )
}

function Waiting({ copy }: { copy: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>Waiting for a tap</EmptyTitle>
        <EmptyDescription>{copy}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

function Stat({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-muted-foreground font-mono text-[11px] tracking-[0.14em] uppercase">{term}</dt>
      <dd className="font-heading text-2xl leading-8 tabular-nums">{value}</dd>
    </div>
  )
}
