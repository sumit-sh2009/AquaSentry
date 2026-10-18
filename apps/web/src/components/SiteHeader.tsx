import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { editorialDuration, editorialEase } from "@/lib/motion"

const links = [
  { href: "#results", label: "Results" },
  { href: "#gates", label: "Reading" },
  { href: "#path", label: "Path" },
  { href: "#docket", label: "Docket" },
]

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
  return () => observer.disconnect()
}

function themeSnapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function SiteHeader({ docketCount }: { docketCount: number }) {
  const theme = useSyncExternalStore(subscribe, themeSnapshot, () => "light")
  const { setTheme } = useTheme()
  const dark = theme === "dark"

  function toggleTheme() {
    const next = dark ? "light" : "dark"
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(next)
    root.style.colorScheme = next
    localStorage.setItem("aquasentry-theme", next)
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next === "dark" ? "#01472e" : "#ccd5ae")
    setTheme(next)
  }

  return (
    <header id="top" className="fixed top-0 z-30 w-full px-4 pt-4 md:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <a
          href="#top"
          className="label-track rounded-full px-2 py-3 text-forest focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:text-sage"
        >
          - AquaSentry
          <span className="mt-1 block tracking-[0.18em] opacity-70">Newark watershed</span>
        </a>
        <nav
          aria-label="Page"
          className="mx-2 hidden max-w-[min(100%,32rem)] overflow-x-auto rounded-full bg-white/10 px-2 py-1 shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)] backdrop-blur-[20px] sm:block"
        >
          <ul className="flex items-center">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="label-track inline-flex min-h-11 items-center rounded-full px-4 text-forest transition-[background-color,color] duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-cream/70 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:text-sage dark:hover:bg-forest/60"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            aria-pressed={dark}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={toggleTheme}
            style={{ transitionTimingFunction: `cubic-bezier(${editorialEase.join(",")})`, transitionDuration: `${editorialDuration}s` }}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild className="min-h-11 rounded-full bg-forest px-5 text-cream hover:bg-forest/90 dark:bg-sage dark:text-forest">
            <a href="#desk" className="label-track inline-flex items-center gap-2">
              Desk
              <span className="inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-cream px-2 text-[10px] font-bold tracking-normal text-forest tabular-nums">
                {docketCount}
              </span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
