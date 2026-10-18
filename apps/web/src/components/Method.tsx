import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Reveal } from "./Reveal"

const gates = [
  { name: "Lead", mark: "≥ 15 ppb" },
  { name: "PFOA / PFOS", mark: "> 4.0 ppt" },
  { name: "Units", mark: "µg/L = ppb" },
]

const workers = [
  { name: "SDWIS", mark: "Mirror" },
  { name: "USGS", mark: "pH" },
  { name: "Spatial", mark: "80 m" },
  { name: "Evaluator", mark: "Recompute" },
]

const sources = [
  { source: "EPA SDWIS", endpoint: "data.epa.gov/efservice", use: "Local snapshot of NJ0714001" },
  { source: "USGS Water Quality Portal", endpoint: "waterqualitydata.us", use: "Fixture pH and alkalinity" },
  { source: "EPA UCMR 5", endpoint: "epa.gov/dwucmr", use: "Fixture PFOA 6.2 ppt and PFOS 3.1 ppt" },
  { source: "Lead line inventory", endpoint: "Municipal GeoJSON", use: "Three fixture service lines" },
]

export function Method() {
  return (
    <section
      id="method"
      aria-labelledby="method-heading"
      className="section-shell scroll-mt-24 bg-cream text-forest dark:bg-forest dark:text-sage"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-6">
        <Reveal>
          <p className="label-track mb-4">Method</p>
          <h2 id="method-heading" className="font-heading max-w-[12ch] text-6xl leading-[0.85] tracking-[-0.05em] uppercase md:text-8xl">
            The check
          </h2>
        </Reveal>
        <div className="grid gap-10 lg:grid-cols-2">
          <ul className="grid grid-cols-3 gap-4" aria-label="Gates">
            {gates.map((gate) => (
              <li key={gate.name} className="flex aspect-square flex-col items-center justify-center gap-3 rounded-full bg-olive text-center shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] dark:bg-[color-mix(in_srgb,#01472e_80%,#e9edc9)]">
                <p className="label-track px-3">{gate.name}</p>
                <p className="font-heading text-2xl tracking-[-0.05em] uppercase md:text-3xl">{gate.mark}</p>
              </li>
            ))}
          </ul>
          <ol className="grid grid-cols-4 items-start gap-3" aria-label="Workers">
            {workers.map((worker, index) => (
              <li key={worker.name} className="flex flex-col items-center gap-3 text-center">
                <div className="relative flex w-full justify-center">
                  {index > 0 ? <span className="absolute top-1/2 right-1/2 left-0 h-px bg-forest/30 dark:bg-sage/40" aria-hidden="true" /> : null}
                  {index < workers.length - 1 ? <span className="absolute top-1/2 right-0 left-1/2 h-px bg-forest/30 dark:bg-sage/40" aria-hidden="true" /> : null}
                  <span className="relative grid size-16 place-items-center rounded-full border-2 border-forest bg-cream font-heading text-xl dark:border-sage dark:bg-forest md:size-20 md:text-2xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="label-track" translate="no">
                  {worker.name}
                </p>
                <p className="text-base leading-snug">{worker.mark}</p>
              </li>
            ))}
          </ol>
        </div>
        <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
          <CardHeader>
            <CardTitle>Open-data anchors</CardTitle>
            <CardDescription>What this scaffold actually reads. The mirror date stays on the docket.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Use here</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell className="font-medium">{row.source}</TableCell>
                    <TableCell className="font-mono text-xs" translate="no">
                      {row.endpoint}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.use}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
