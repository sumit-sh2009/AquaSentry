import { useEffect, useState } from "react"

export function useQueryState(key: string, fallback: string) {
  const read = () => new URLSearchParams(window.location.search).get(key) ?? fallback
  const [value, setValue] = useState(read)

  useEffect(() => {
    const onPop = () => setValue(new URLSearchParams(window.location.search).get(key) ?? fallback)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [key, fallback])

  const set = (next: string) => {
    const params = new URLSearchParams(window.location.search)
    if (next === fallback) params.delete(key)
    else params.set(key, next)
    const query = params.toString()
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    window.history.replaceState(null, "", url)
    setValue(next)
  }

  return [value, set] as const
}
