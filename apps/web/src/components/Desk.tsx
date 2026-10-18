import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { addressSchema, type AddressInput } from "@/lib/schema"
import type { LineMaterial, ServiceLine } from "@/lib/types"
import { Reveal } from "./Reveal"
import { WatershedMap } from "./WatershedMap"

const materialVariant = {
  lead: "destructive",
  copper: "secondary",
  unknown: "outline",
} as const satisfies Record<LineMaterial, "destructive" | "secondary" | "outline">

const materialCopy = {
  lead: "Known lead. Schools within 80 m of this line are listed on the docket.",
  copper: "Copper. This line does not open the school buffer.",
  unknown: "Material is unconfirmed, so it is not treated as lead.",
} as const satisfies Record<LineMaterial, string>

export function Desk({
  lines,
  loading,
  loadError,
  pending,
  onSubmit,
}: {
  lines: ServiceLine[]
  loading: boolean
  loadError: boolean
  pending: boolean
  onSubmit: (address: string) => void
}) {
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { address: "81 Congress St, Newark, NJ" },
  })
  const addressError = form.formState.errors.address

  return (
    <section
      id="desk"
      aria-labelledby="desk-heading"
      className="section-shell scroll-mt-24 bg-sage text-forest dark:bg-[color-mix(in_srgb,#01472e_86%,#ccd5ae)] dark:text-sage"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-6">
        <Reveal>
          <p className="label-track mb-4">Desk</p>
          <h2 id="desk-heading" className="display-section max-w-[8ch]">
            Desk
          </h2>
          <p className="mt-6 max-w-2xl text-pretty">
            Open a docket for a Newark address. The evaluator reads the fixture, recomputes each analyte, and either
            certifies a petition or stops for review.
          </p>
        </Reveal>

        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>The watershed mirror did not load</AlertTitle>
            <AlertDescription>Start the API on port 8102, then reload this page.</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
          {loading ? <Skeleton className="h-80 rounded-[2.5rem] md:h-[26rem]" /> : <WatershedMap lines={lines} />}
          <Card className="rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]">
            <CardHeader>
              <CardTitle>Service lines</CardTitle>
              <CardDescription>Three fixture lines. Lead is the exposure buffer, not a plume.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {loading ? (
                <div className="flex flex-col gap-3" aria-hidden="true">
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                  <Skeleton className="h-11" />
                </div>
              ) : lines.length === 0 ? (
                <p className="text-pretty">This snapshot has no service lines.</p>
              ) : (
                <ItemGroup>
                  {lines.map((line) => (
                    <Item key={line.id} variant="outline">
                      <ItemContent>
                        <ItemTitle>
                          <span translate="no">{line.id}</span>
                        </ItemTitle>
                        <ItemDescription>{materialCopy[line.material]}</ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Badge variant={materialVariant[line.material]}>{line.material}</Badge>
                      </ItemActions>
                    </Item>
                  ))}
                </ItemGroup>
              )}
              <form
                aria-busy={pending}
                onSubmit={form.handleSubmit((values) => onSubmit(values.address), () => form.setFocus("address"))}
              >
                <FieldGroup>
                  <Field data-invalid={addressError ? true : undefined}>
                    <FieldLabel htmlFor="address" className="label-track">
                      Street address
                    </FieldLabel>
                    <Input
                      id="address"
                      autoComplete="street-address"
                      placeholder="81 Congress St, Newark, NJ…"
                      aria-invalid={addressError ? true : undefined}
                      className="min-h-12 text-lg"
                      {...form.register("address")}
                    />
                    {addressError ? (
                      <FieldError errors={[addressError]} />
                    ) : (
                      <FieldDescription>Checked against PWSID NJ0714001 only.</FieldDescription>
                    )}
                  </Field>
                  <Button type="submit" disabled={pending} className="label-track min-h-11 rounded-full tracking-[0.28em]">
                    {pending ? <Spinner data-icon="inline-start" /> : null}
                    {pending ? "Running evaluator…" : "Open water docket"}
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
