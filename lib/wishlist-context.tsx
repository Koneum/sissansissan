"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface WishlistItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  productId?: string
}

interface WishlistData {
  items: WishlistItem[]
  timestamp: number
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  itemCount: number
  loading: boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_EXPIRY_HOURS = 48
const WISHLIST_STORAGE_KEY = "wishlist_data"

export function WishlistProvider({ children }: { children: React.ReactNode}) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if wishlist has expired
  const isWishlistExpired = (timestamp: number): boolean => {
    const now = Date.now()
    const expiryTime = WISHLIST_EXPIRY_HOURS * 60 * 60 * 1000
    return now - timestamp > expiryTime
  }

  const loadWishlist = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      setLoading(true)

      // Always load from localStorage (no API calls)
      const savedData = localStorage.getItem(WISHLIST_STORAGE_KEY)
      if (savedData) {
        try {
          const wishlistData: WishlistData = JSON.parse(savedData)
          
          // Check if wishlist has expired
          if (isWishlistExpired(wishlistData.timestamp)) {
            console.log("Wishlist expired, clearing...")
            localStorage.removeItem(WISHLIST_STORAGE_KEY)
            setItems([])
          } else {
            setItems(wishlistData.items)
          }
        } catch (error) {
          console.error("Failed to parse wishlist from localStorage:", error)
          localStorage.removeItem(WISHLIST_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error)
    } finally {
      setLoading(false)
      setIsLoaded(true)
    }
  }, [])

  // Load wishlist on mount
  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      const wishlistData: WishlistData = {
        items,
        timestamp: Date.now()
      }
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistData))
    }
  }, [items, isLoaded])

  const addItem = (item: WishlistItem) => {
    try {
      // Always use localStorage (no API calls)
      setItems((current) => {
        if (current.find((i) => i.id === item.id || i.productId === item.id)) {
          toast.info("Déjà dans la liste de souhaits")
          return current
        }
        return [...current, item]
      })
      toast.success("Ajouté à la liste de souhaits")
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast.error("Échec de l'ajout")
    }
  }

  const removeItem = (id: string) => {
    try {
      // Always use localStorage (no API calls)
      setItems((current) => current.filter((item) => item.id !== id && item.productId !== id))
      toast.success("Retiré de la liste de souhaits")
    } catch (error) {
      console.error("Error removing from wishlist:", error)
      toast.error("Échec de la suppression")
    }
  }

  const isInWishlist = (id: string) => {
    return items.some((item) => item.id === id || item.productId === id)
  }

  const itemCount = items.length

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        itemCount,
        loading
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
