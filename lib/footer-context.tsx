"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface ContactInfo {
  phone: string
  email: string
  address: string
}

interface SocialLink {
  platform: string
  url: string
  color: string
}

interface FooterLink {
  id: string
  text: string
  url: string
}

interface AppDownload {
  appStoreUrl: string
  googlePlayUrl: string
}

interface SocialMedia {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
}

interface PaymentMethod {
  name: string
  image: string
}

export interface FooterData {
  companyDescription: string
  contactInfo: ContactInfo
  socialLinks: SocialLink[]
  helpSupport: FooterLink[]
  accountLinks: FooterLink[]
  appDownload: AppDownload
  copyrightText: string
  poweredByText: string
  poweredByUrl: string
  logoUrl?: string
  socialMedia?: SocialMedia
  paymentMethods?: (PaymentMethod | string)[]
}

const defaultFooterData: FooterData = {
  companyDescription: "Your trusted destination for premium tech products and exceptional customer service.",
  contactInfo: {
    phone: "+1 (555) 123-4567",
    email: "support@zissan-sissan.com",
    address: "123 Commerce St, Tech City"
  },
  socialLinks: [
    { platform: "Facebook", url: "https://facebook.com", color: "#F97316" },
    { platform: "Twitter", url: "https://twitter.com", color: "#F97316" },
    { platform: "Instagram", url: "https://instagram.com", color: "#F97316" },
    { platform: "LinkedIn", url: "https://linkedin.com", color: "#F97316" },
  ],
  helpSupport: [
    { id: "1", text: "Contact", url: "/contact" },
    { id: "2", text: "FAQ's", url: "/faq" },
    { id: "3", text: "Shipping Info", url: "/shipping" },
    { id: "4", text: "Returns & Refunds", url: "/returns" },
    { id: "5", text: "Privacy Policy", url: "/privacy" },
    { id: "6", text: "Terms of Use", url: "/terms" },
  ],
  accountLinks: [
    { id: "1", text: "Login / Register", url: "/signin" },
    { id: "2", text: "My Account", url: "/account" },
    { id: "3", text: "Shopping Cart", url: "/cart" },
    { id: "4", text: "Wishlist", url: "/wishlist" },
    { id: "5", text: "Shop", url: "/products" },
    { id: "6", text: "Track Order", url: "/track-order" },
  ],
  appDownload: {
    appStoreUrl: "https://apps.apple.com/app/your-app",
    googlePlayUrl: "https://play.google.com/store/apps/details?id=your.app"
  },
  copyrightText: "© 2025 Sissan-Sissan. All rights reserved.",
  poweredByText: "Umbrella Dynastie",
  poweredByUrl: "https://umdynastie.com"
}

interface FooterContextType {
  footerData: FooterData
  updateFooterData: (data: FooterData) => void
}

const FooterContext = createContext<FooterContextType | undefined>(undefined)

export function FooterProvider({ children }: { children: ReactNode }) {
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    try {
      const [footerRes, storeRes] = await Promise.all([
        fetch("/api/settings/footer"),
        fetch("/api/settings/store"),
      ])

      let footerValue: any = null
      if (footerRes.ok) {
        const footerJson = await footerRes.json()
        footerValue = footerJson?.data || null
      }

      let storeValue: any = null
      if (storeRes.ok) {
        const storeJson = await storeRes.json()
        storeValue = storeJson?.data || null
      }

      if (footerValue || storeValue) {
        const merged: FooterData = {
          ...(footerValue || defaultFooterData),
          contactInfo: {
            ...(footerValue?.contactInfo || defaultFooterData.contactInfo),
            phone: storeValue?.phone || footerValue?.contactInfo?.phone || defaultFooterData.contactInfo.phone,
            email: storeValue?.email || footerValue?.contactInfo?.email || defaultFooterData.contactInfo.email,
            address: storeValue?.address || footerValue?.contactInfo?.address || defaultFooterData.contactInfo.address,
          },
        }
        setFooterData(merged)
      }
    } catch (error) {
      console.error("Error loading footer data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("footerCustomization")
        if (stored) {
          try {
            setFooterData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updateFooterData = async (data: FooterData) => {
    setFooterData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("footerCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving footer data to database:", error)
    }
  }

  return (
    <FooterContext.Provider value={{ footerData, updateFooterData }}>
      {children}
    </FooterContext.Provider>
  )
}

export function useFooter() {
  const context = useContext(FooterContext)
  if (context === undefined) {
    throw new Error("useFooter must be used within a FooterProvider")
  }
  return context
}




