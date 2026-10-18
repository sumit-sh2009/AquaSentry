import { Reveal } from "./Reveal"

const nodes = [
  { index: "01", title: "Read", mark: "Address in" },
  { index: "02", title: "Gate", mark: "15 ppb · 4.0 ppt" },
  { index: "03", title: "File", mark: "Petition or hold" },
]

export function CertificationPath() {
  return (
    <section
      id="path"
      aria-labelledby="path-heading"
      className="section-shell scroll-mt-24 bg-cream text-forest dark:bg-forest dark:text-sage"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 md:px-6">
        <Reveal>
          <p className="label-track mb-4">Path</p>
          <h2 id="path-heading" className="font-heading max-w-[10ch] text-6xl leading-[0.85] tracking-[-0.05em] uppercase md:text-8xl">
            Three marks
          </h2>
        </Reveal>
        <ol className="grid gap-10 md:grid-cols-3">
          {nodes.map((node, index) => (
            <li key={node.index} className="flex flex-col items-center gap-5 text-center">
              <div className="relative flex w-full items-center justify-center">
                {index > 0 ? <span className="absolute right-1/2 left-0 hidden h-px bg-forest/30 md:block dark:bg-sage/40" aria-hidden="true" /> : null}
                {index < nodes.length - 1 ? <span className="absolute right-0 left-1/2 hidden h-px bg-forest/30 md:block dark:bg-sage/40" aria-hidden="true" /> : null}
                <span className="relative grid size-36 place-items-center rounded-full border-2 border-forest bg-olive font-heading text-5xl shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] md:size-44 md:text-6xl dark:border-sage dark:bg-[color-mix(in_srgb,#01472e_80%,#e9edc9)]">
                  {node.index}
                </span>
              </div>
              <p className="font-heading text-4xl tracking-[-0.05em] uppercase">{node.title}</p>
              <p className="label-track">{node.mark}</p>
            </li>
          ))}
        </ol>
        <Reveal>
          <div className="mx-auto grid max-w-3xl grid-cols-2 overflow-hidden rounded-[2.5rem] border border-forest/20 dark:border-sage/30">
            <div className="flex flex-col items-center gap-2 bg-olive px-6 py-10 text-center dark:bg-[color-mix(in_srgb,#01472e_80%,#e9edc9)]">
              <span className="grid size-16 place-items-center rounded-full bg-forest font-heading text-2xl text-cream dark:bg-sage dark:text-forest" aria-hidden="true">
                =
              </span>
              <p className="label-track">Match</p>
              <p className="font-heading text-3xl tracking-[-0.05em] uppercase">Certify</p>
            </div>
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="grid size-16 place-items-center rounded-full border-2 border-forest font-heading text-2xl dark:border-sage" aria-hidden="true">
                3
              </span>
              <p className="label-track">Third mismatch</p>
              <p className="font-heading text-3xl tracking-[-0.05em] uppercase">Hold</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
