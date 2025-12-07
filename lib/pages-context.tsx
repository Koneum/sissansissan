"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface PagesData {
  privacyPolicy: string
  termsConditions: string
}

const defaultPagesData: PagesData = {
  privacyPolicy: `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## Information We Collect

We collect information you provide directly to us when you create an account, make a purchase, or contact us.

## How We Use Your Information

We use the information we collect to process your orders, communicate with you, and improve our services.

## Data Security

We implement appropriate security measures to protect your personal information.

## Contact Us

If you have any questions about this Privacy Policy, please contact us.`,
  termsConditions: `# Terms and Conditions

Last updated: ${new Date().toLocaleDateString()}

## Acceptance of Terms

By accessing and using this website, you accept and agree to be bound by these Terms and Conditions.

## Use of Website

You may use our website for lawful purposes only.

## Products and Pricing

We reserve the right to change prices and product availability at any time.

## Limitation of Liability

We shall not be liable for any indirect, incidental, or consequential damages.

## Contact

For questions about these Terms, please contact us.`
}

interface PagesContextType {
  pagesData: PagesData
  updatePagesData: (data: PagesData) => void
}

const PagesContext = createContext<PagesContextType | undefined>(undefined)

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pagesData, setPagesData] = useState<PagesData>(defaultPagesData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPagesData()
  }, [])

  const fetchPagesData = async () => {
    try {
      const response = await fetch("/api/settings/pages")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setPagesData(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading pages data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("pagesCustomization")
        if (stored) {
          try {
            setPagesData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updatePagesData = async (data: PagesData) => {
    setPagesData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("pagesCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving pages data to database:", error)
    }
  }

  return (
    <PagesContext.Provider value={{ pagesData, updatePagesData }}>
      {children}
    </PagesContext.Provider>
  )
}

export function usePages() {
  const context = useContext(PagesContext)
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider")
  }
  return context
}




