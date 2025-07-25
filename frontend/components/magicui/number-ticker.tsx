"use client"

import { useEffect, useRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

export default function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
}: {
  value: number
  direction?: "up" | "down"
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    isInView &&
      setTimeout(() => {
        motionValue.set(direction === "down" ? 0 : value)
      }, delay * 1000)
  }, [motionValue, isInView, delay, value, direction])

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US").format(latest.toFixed(0) as any)
        }
      }),
    [springValue],
  )

  return <span className={className} ref={ref} />
}

export { NumberTicker }
