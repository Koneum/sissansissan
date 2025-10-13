"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface CountdownData {
  enabled: boolean
  title: string
  endDate: string
  backgroundColor: string
  textColor: string
}

const defaultCountdownData: CountdownData = {
  enabled: true,
  title: "FLASH SALE ENDS IN",
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  backgroundColor: "#4F46E5",
  textColor: "#FFFFFF"
}

interface CountdownContextType {
  countdownData: CountdownData
  updateCountdownData: (data: CountdownData) => void
}

const CountdownContext = createContext<CountdownContextType | undefined>(undefined)

export function CountdownProvider({ children }: { children: ReactNode }) {
  const [countdownData, setCountdownData] = useState<CountdownData>(defaultCountdownData)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("countdownCustomization")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setCountdownData(parsed)
        } catch (error) {
          console.error("Error loading countdown data:", error)
        }
      }
    }
  }, [])

  const updateCountdownData = (data: CountdownData) => {
    setCountdownData(data)
    if (typeof window !== "undefined") {
      localStorage.setItem("countdownCustomization", JSON.stringify(data))
    }
  }

  return (
    <CountdownContext.Provider value={{ countdownData, updateCountdownData }}>
      {children}
    </CountdownContext.Provider>
  )
}

export function useCountdown() {
  const context = useContext(CountdownContext)
  if (context === undefined) {
    throw new Error("useCountdown must be used within a CountdownProvider")
  }
  return context
}

