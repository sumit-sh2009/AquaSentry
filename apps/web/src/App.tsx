import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { CertificationPath } from "./components/CertificationPath"
import { Desk } from "./components/Desk"
import { Docket } from "./components/Docket"
import { Landing } from "./components/Landing"
import { Method } from "./components/Method"
import { NoiseOverlay } from "./components/NoiseOverlay"
import { SiteFooter } from "./components/SiteFooter"
import { SiteHeader } from "./components/SiteHeader"
import type { Investigation, Watershed } from "./lib/types"

export default function App() {
  const watershed = useQuery({
    queryKey: ["watershed", "NJ0714001"],
    queryFn: async () => {
      const response = await fetch("/api/watersheds/NJ0714001")
      if (!response.ok) throw new Error("watershed snapshot unavailable")
      return (await response.json()) as Watershed
    },
  })

  const investigation = useMutation({
    mutationFn: async (address: string) => {
      const response = await fetch("/api/investigations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, pwsid: "NJ0714001" }),
      })
      if (!response.ok) throw new Error("investigation rejected")
      return (await response.json()) as Investigation
    },
    onSuccess: (result) => {
      toast.success(result.status === "certified" ? "Docket certified." : "Docket held for human review.")
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      document.getElementById("docket")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    },
    onError: () => {
      toast.error("The investigation did not run. Start the API on port 8102, then try again.")
    },
  })

  return (
    <>
      <a
        href="#desk"
        className="sr-only z-50 rounded-full bg-forest px-4 py-2 text-sm text-cream focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:inline-flex focus:min-h-11 focus:items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
      >
        Skip to the watershed desk
      </a>
      <NoiseOverlay />
      <SiteHeader docketCount={investigation.data ? 1 : 0} />
      <main>
        <Landing />
        <CertificationPath />
        <Desk
          lines={watershed.data?.service_lines ?? []}
          loading={watershed.isPending}
          loadError={watershed.isError}
          pending={investigation.isPending}
          onSubmit={(address) => investigation.mutate(address)}
        />
        <Docket
          investigation={investigation.data}
          pending={investigation.isPending}
          failed={investigation.isError}
        />
        <Method />
      </main>
      <SiteFooter systemName={watershed.data?.system_name} snapshotDate={watershed.data?.snapshot_date} />
    </>
  )
}
