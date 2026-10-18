import { motion } from "motion/react"
import type { ReactNode } from "react"
import { editorialDuration, editorialEase } from "@/lib/motion"

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: editorialDuration, delay, ease: editorialEase }}
    >
      {children}
    </motion.div>
  )
}
