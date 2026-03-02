"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function NavBar({ items, className, onChange }) {
  const [activeTab, setActiveTab] = useState(items[0]?.name ?? "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClick = (itemName) => {
    setActiveTab(itemName)
    if (onChange) {
      onChange(itemName)
    }
  }

  return (
    <div className={cn("fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6", className)}>
      <div className="flex items-center gap-1 bg-[#4b6bb3]/80 border border-border mt-8 py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const isActive = activeTab === item.name
          return (
            <button
              key={item.name}
              onClick={() => handleClick(item.name)}
              className={cn(
                "relative cursor-pointer text-xl font-semibold px-1 rounded-full transition-colors ",
                "text-foreground hover:text-[#000000]/50 ",
                isActive && "bg-[#ffffff]/30",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-5 w-full bg-primary rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#4b6bb3] rounded-t-full">
                    <div className="absolute w-12 h-6 bg-[#4b6bb3] rounded-full blur-md -top-2 -left-2" />
                  </div>
                </motion.div>
              )}
              {item.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}