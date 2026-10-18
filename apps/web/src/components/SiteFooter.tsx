import { Button } from "@/components/ui/button"
import { formatSnapshot } from "../lib/format"

const statutes = [
  {
    href: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-141/subpart-I/section-141.80",
    label: "40 CFR 141.80",
  },
  {
    href: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-141/subpart-G/section-141.61",
    label: "40 CFR 141.61",
  },
  {
    href: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-141/subpart-I/section-141.85",
    label: "40 CFR 141.85",
  },
]

const deskLinks = [
  { href: "#desk", label: "Watershed desk" },
  { href: "#docket", label: "Water docket" },
  { href: "#method", label: "Method" },
  { href: "#gates", label: "This fixture" },
]

export function SiteFooter({
  systemName,
  snapshotDate,
}: {
  systemName?: string
  snapshotDate?: string | null
}) {
  return (
    <footer className="section-shell bg-forest text-sage">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 md:grid-cols-12 md:px-6">
        <div className="md:col-span-6">
          <p className="label-track mb-6">Scope</p>
          <h2 className="font-heading mb-6 max-w-[14ch] text-5xl leading-[0.85] tracking-[-0.05em] uppercase">
            Newark only. Arithmetic, not a lab.
          </h2>
          <p className="mb-8 max-w-md text-pretty text-sage">
            This page is the June 15, 2024 mirror for PWSID NJ0714001
            {systemName ? <span translate="no"> · {systemName}</span> : null}. Open a docket from the desk. There is
            no mailing list and no statewide inventory.
          </p>
          <Button asChild className="label-track min-h-11 rounded-full bg-sage text-forest hover:bg-cream">
            <a href="#desk">Open the watershed desk</a>
          </Button>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 md:col-span-6">
          <div>
            <p className="label-track mb-4">Desk</p>
            <ul className="flex flex-col gap-3">
              {deskLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[11px] font-bold tracking-[0.28em] uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-track mb-4">Statute</p>
            <ul className="flex flex-col gap-3">
              {statutes.map((citation) => (
                <li key={citation.href}>
                  <a
                    href={citation.href}
                    className="text-[11px] font-bold tracking-[0.28em] uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                    translate="no"
                  >
                    {citation.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sage/30 md:col-span-12 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-pretty">
            Snapshot {formatSnapshot(snapshotDate)}. Not a certified laboratory result.
          </p>
          <p className="label-track">AquaSentry · NJ0714001</p>
        </div>
      </div>
    </footer>
  )
}
