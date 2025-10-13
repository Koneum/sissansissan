"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  productId?: string
}

interface CartData {
  items: CartItem[]
  timestamp: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_EXPIRY_HOURS = 48
const CART_STORAGE_KEY = "cart_data"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Check if cart has expired
  const isCartExpired = (timestamp: number): boolean => {
    const now = Date.now()
    const expiryTime = CART_EXPIRY_HOURS * 60 * 60 * 1000 // 48 hours in milliseconds
    return now - timestamp > expiryTime
  }

  const loadCart = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      setLoading(true)

      // Always load from localStorage (no API calls)
      const savedData = localStorage.getItem(CART_STORAGE_KEY)
      if (savedData) {
        try {
          const cartData: CartData = JSON.parse(savedData)
          
          // Check if cart has expired
          if (isCartExpired(cartData.timestamp)) {
            console.log("Cart expired, clearing...")
            localStorage.removeItem(CART_STORAGE_KEY)
            setItems([])
          } else {
            setItems(cartData.items)
          }
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error)
          localStorage.removeItem(CART_STORAGE_KEY)
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error)
    } finally {
      setLoading(false)
      setIsLoaded(true)
    }
  }, [])

  // Load cart on mount
  useEffect(() => {
    loadCart()
  }, [loadCart])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      const cartData: CartData = {
        items,
        timestamp: Date.now()
      }
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData))
    }
  }, [items, isLoaded])

  const addItem = (item: Omit<CartItem, "quantity">) => {
    try {
      // Always use localStorage (no API calls)
      setItems((current) => {
        const existingItem = current.find((i) => i.id === item.id || i.productId === item.id)
        if (existingItem) {
          return current.map((i) => 
            (i.id === item.id || i.productId === item.id) 
              ? { ...i, quantity: i.quantity + 1 } 
              : i
          )
        }
        return [...current, { ...item, quantity: 1 }]
      })
      toast.success("Ajouté au panier")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Échec de l'ajout au panier")
    }
  }

  const removeItem = (id: string) => {
    try {
      // Always use localStorage (no API calls)
      setItems((current) => current.filter((item) => item.id !== id && item.productId !== id))
      toast.success("Retiré du panier")
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast.error("Échec de la suppression")
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }

    try {
      // Always use localStorage (no API calls)
      setItems((current) => 
        current.map((item) => 
          (item.id === id || item.productId === id) 
            ? { ...item, quantity } 
            : item
        )
      )
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Échec de la mise à jour")
    }
  }

  const clearCart = () => {
    try {
      // Always use localStorage (no API calls)
      setItems([])
      if (typeof window !== "undefined") {
        localStorage.removeItem(CART_STORAGE_KEY)
      }
      toast.success("Panier vidé")
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast.error("Échec du vidage du panier")
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
