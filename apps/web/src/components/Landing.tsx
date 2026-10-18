import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { editorialDuration, editorialEase } from "@/lib/motion"
import { FloatingOrganic } from "./FloatingOrganic"
import { Reveal } from "./Reveal"

const heroLetters = ["N", "A", "M", "E", "D"]

const pillSize = "pointer-events-none absolute hidden h-52 w-36 lg:block"

const pills = [
  { src: "/outcomes/outcome-glass.jpg", alt: "", floatDelay: 0, className: "top-[8%] left-[2%]" },
  { src: "/outcomes/outcome-fountain.jpg", alt: "", floatDelay: 1.2, className: "top-[6%] right-[3%]" },
  { src: "/outcomes/outcome-family.jpg", alt: "", floatDelay: 0.6, className: "top-[40%] left-[1%]" },
  { src: "/outcomes/outcome-schoolyard.jpg", alt: "", floatDelay: 1.8, className: "top-[38%] right-[2%]" },
  { src: "/outcomes/outcome-service.jpg", alt: "", floatDelay: 0.9, className: "bottom-[7%] left-[16%]" },
  { src: "/outcomes/outcome-record.jpg", alt: "", floatDelay: 1.5, className: "bottom-[8%] right-[14%]" },
]

const returns = [
  {
    title: "The glass",
    line: "A kitchen tap with a reading attached.",
    image: "/outcomes/outcome-family.jpg",
    alt: "A child drinking a glass of water at a kitchen table.",
  },
  {
    title: "The fountain",
    line: "A school fountain named on the record.",
    image: "/outcomes/outcome-fountain.jpg",
    alt: "A student drinking from a school fountain.",
  },
  {
    title: "The file",
    line: "Analyte, place, and rule, on one page.",
    image: "/outcomes/outcome-record.jpg",
    alt: "Hands resting a blank folder beside a glass of water.",
  },
]

const readings = [
  {
    name: "Lead",
    place: "Louise A. Spencer School fountain",
    status: "Exceeds",
    tone: "destructive" as const,
    value: 15,
    gate: 15,
    gateLabel: "15 ppb",
    max: 20,
    unit: "ppb",
  },
  {
    name: "PFOA",
    place: "Wanaque entry point",
    status: "Exceeds",
    tone: "destructive" as const,
    value: 6.2,
    gate: 4,
    gateLabel: "4.0 ppt",
    max: 10,
    unit: "ppt",
  },
  {
    name: "PFOS",
    place: "Wanaque entry point",
    status: "Within",
    tone: "secondary" as const,
    value: 3.1,
    gate: 4,
    gateLabel: "4.0 ppt",
    max: 10,
    unit: "ppt",
  },
]

const flow = [
  { index: "01", title: "Address" },
  { index: "02", title: "Gate" },
  { index: "03", title: "Petition" },
]

export function Landing() {
  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="relative min-h-svh overflow-hidden bg-sage px-4 pt-28 pb-28 text-forest md:px-6 dark:bg-forest dark:text-sage"
      >
        <h1 id="hero-heading" className="sr-only">
          A Newark address comes back as a named tap. The record cites the analyte, the place, and the rule.
        </h1>
        {pills.map((pill) => (
          <FloatingOrganic
            key={pill.src}
            src={pill.src}
            alt={pill.alt}
            delay={0.15}
            floatDelay={pill.floatDelay}
            className={`${pillSize} ${pill.className}`}
          />
        ))}
        <div className="relative z-10 mx-auto flex min-h-[68vh] max-w-6xl flex-col items-center justify-center text-center">
          <p className="label-track mb-6">What you leave with</p>
          <p className="pointer-events-none font-heading text-[clamp(4.5rem,14vw,10rem)] leading-[0.8] tracking-[-0.05em] text-forest uppercase select-none dark:text-sage" aria-hidden="true">
            {heroLetters.map((letter, index) => (
              <span key={letter} className="inline-block overflow-hidden">
                <motion.span
                  className="inline-block"
                  initial={{ y: "100%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: editorialDuration, delay: index * 0.05, ease: editorialEase }}
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </p>
          <p className="mt-8 max-w-md text-pretty">One Newark address. One named tap.</p>
          <Button
            asChild
            className="mt-10 size-36 shrink-0 rounded-full bg-forest text-cream shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] hover:bg-forest/90 dark:bg-sage dark:text-forest"
          >
            <a href="#desk" className="label-track flex size-36 items-center justify-center rounded-full text-center leading-4">
              Open
              <br />
              the desk
            </a>
          </Button>
        </div>
      </section>

      <section
        id="results"
        aria-labelledby="results-heading"
        className="section-shell scroll-mt-24 bg-cream text-forest dark:bg-forest dark:text-sage"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 md:px-6">
          <Reveal>
            <p className="label-track mb-4">Results</p>
            <h2 id="results-heading" className="font-heading max-w-[12ch] text-6xl leading-[0.85] tracking-[-0.05em] uppercase md:text-8xl">
              What comes back
            </h2>
          </Reveal>
          <ol className="grid grid-cols-3 items-center gap-3 md:gap-6" aria-label="Address, then gate, then petition">
            {flow.map((step, index) => (
              <li key={step.index} className="flex flex-col items-center gap-4 text-center">
                <div className="relative flex w-full items-center justify-center">
                  {index > 0 ? <span className="absolute right-1/2 left-0 h-px bg-forest/30 dark:bg-sage/40" aria-hidden="true" /> : null}
                  {index < flow.length - 1 ? <span className="absolute right-0 left-1/2 h-px bg-forest/30 dark:bg-sage/40" aria-hidden="true" /> : null}
                  <span className="relative grid size-20 place-items-center rounded-full border-2 border-forest bg-olive font-heading text-2xl dark:border-sage dark:bg-[color-mix(in_srgb,#01472e_80%,#e9edc9)] md:size-28 md:text-4xl">
                    {step.index}
                  </span>
                </div>
                <p className="label-track">{step.title}</p>
              </li>
            ))}
          </ol>
          <ul className="grid-cards-equal">
            {returns.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={index * 0.06}>
                  <article className="flex h-full flex-col overflow-hidden rounded-[2.5rem] bg-olive shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] dark:bg-[color-mix(in_srgb,#01472e_80%,#e9edc9)]">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img src={item.image} alt={item.alt} width={768} height={960} className="size-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 px-8 py-8">
                      <p className="label-track">{item.title}</p>
                      <p className="text-pretty">{item.line}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="gates"
        aria-labelledby="gates-heading"
        className="section-shell scroll-mt-24 bg-olive text-forest dark:bg-[color-mix(in_srgb,#01472e_88%,#e9edc9)] dark:text-sage"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal>
            <p className="label-track mb-4">Then the reading</p>
            <h2 id="gates-heading" className="font-heading max-w-[8ch] text-6xl leading-[0.85] tracking-[-0.05em] uppercase md:text-8xl">
              The line
            </h2>
            <p className="mt-6 max-w-xl text-pretty">June 15, 2024. The bar is the sample. The mark is the rule.</p>
          </Reveal>
          <ul className="grid-cards-equal mt-12">
            {readings.map((reading, index) => (
              <li key={reading.name}>
                <Reveal delay={index * 0.06}>
                  <article className="flex h-full flex-col gap-6 rounded-[2.5rem] bg-cream px-8 py-10 shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] dark:bg-forest">
                    <div className="flex items-center justify-between gap-3">
                      <p className="label-track">{reading.name}</p>
                      <Badge variant={reading.tone}>{reading.status}</Badge>
                    </div>
                    <p className="font-heading text-6xl leading-none tracking-[-0.05em] uppercase">
                      {reading.value}
                      <span className="ml-2 text-2xl">{reading.unit}</span>
                    </p>
                    <Scale value={reading.value} gate={reading.gate} max={reading.max} />
                    <p className="label-track">Gate {reading.gateLabel}</p>
                    <p className="mt-auto font-bold" translate="no">
                      {reading.place}
                    </p>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

function Scale({ value, gate, max }: { value: number; gate: number; max: number }) {
  const filled = Math.min(100, (value / max) * 100)
  const mark = (gate / max) * 100
  return (
    <div className="relative h-4 rounded-full bg-sage/80 dark:bg-sage/20" aria-hidden="true">
      <div className="h-full rounded-full bg-forest dark:bg-sage" style={{ width: `${filled}%` }} />
      <span className="absolute top-1/2 h-8 w-0.5 -translate-y-1/2 bg-forest dark:bg-cream" style={{ left: `${mark}%` }} />
    </div>
  )
}
