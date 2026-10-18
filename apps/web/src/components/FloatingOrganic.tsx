import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import { editorialDuration, editorialEase } from "@/lib/motion"

export function FloatingOrganic({
  src,
  alt,
  className,
  delay = 0,
  floatDelay = 0,
}: {
  src: string
  alt: string
  className?: string
  delay?: number
  floatDelay?: number
}) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, (value) => (reduce ? 0 : value * 0.05))

  return (
    <motion.div
      className={className}
      style={{ y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: editorialDuration, delay, ease: editorialEase }}
    >
      <img
        src={src}
        alt={alt}
        width={480}
        height={640}
        style={{ animationDelay: `${floatDelay}s` }}
        className="animate-float size-full rounded-full object-cover shadow-[0_25px_50px_-12px_rgba(1,71,46,0.2)]"
      />
    </motion.div>
  )
}
