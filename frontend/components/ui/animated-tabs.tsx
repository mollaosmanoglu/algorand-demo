"use client"

import { TabsList } from "@/components/ui/tabs"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import * as React from "react"

export const AnimatedTabsList = TabsList

export const AnimatedTabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof TabsPrimitive.Trigger> & { isActive?: boolean }
>((props, ref) => {
  const { value, children, className, isActive, ...rest } = props

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      data-slot="tabs-trigger"
      className={cn(
        "relative px-2 py-2 font-medium text-muted-foreground",
        "data-[state=active]:text-foreground",
        "inline-flex items-center justify-center",
        "transition-colors disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...rest}
    >
      {/* underline */}
      {isActive && (
        <motion.span
          className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-foreground"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
        />
      )}

      <span className="relative z-10 px-2 py-1 rounded-md transition-colors duration-150 hover:bg-[hsl(var(--tab-hover))]">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  )
})

AnimatedTabsTrigger.displayName = "AnimatedTabsTrigger"
