"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative isolate overflow-hidden rounded-md bg-foreground/14",
        className
      )}
      {...props}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-transparent via-background/80 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 1.15,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.1,
        }}
      />
    </div>
  )
}

export { Skeleton }
