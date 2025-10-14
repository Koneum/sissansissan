"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"
import { formatPrice } from "@/lib/currency"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
}

interface SearchWithSuggestionsProps {
  onClose: () => void
}

export function SearchWithSuggestions({ onClose }: SearchWithSuggestionsProps) {
  const router = useRouter()
  const { t } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.data || [])
          setShowSuggestions(true)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      onClose()
      setSearchQuery("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/products/${productId}`)
    onClose()
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      onClose()
      setSearchQuery("")
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  return (
    <div className="pb-3 sm:pb-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div ref={searchRef} className="relative max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t.shop.searchPlaceholder || "Search products..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            className="pl-9 sm:pl-10 pr-10 sm:pr-12 h-10 sm:h-11 text-sm sm:text-base"
            autoFocus
          />
          {loading && (
            <Loader2 className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0.5 sm:right-1 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => {
              onClose()
              setSearchQuery("")
              setSuggestions([])
              setShowSuggestions(false)
            }}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-2">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors text-left"
                >
                  {product.thumbnail ? (
                    <Image
                      src={product.thumbnail}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Search className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.discountPrice ? (
                        <>
                          <span className="line-through mr-2">{formatPrice(product.price)}</span>
                          <span className="text-primary font-semibold">{formatPrice(product.discountPrice)}</span>
                        </>
                      ) : (
                        <span>{formatPrice(product.price)}</span>
                      )}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t p-2">
              <Button
                onClick={handleViewAll}
                variant="ghost"
                className="w-full justify-center text-sm"
              >
                View all results
              </Button>
            </div>
          </div>
        )}

        {/* No results */}
        {showSuggestions && searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
          <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
            No products found
          </div>
        )}
      </div>
    </div>
  )
}
