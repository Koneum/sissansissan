"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { formatPrice } from "@/lib/currency"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=4")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching featured products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (products.length === 0) return null
  return (
    <section className="container mx-auto px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="relative bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 flex items-center justify-center h-40 sm:h-48">
              <img
                src={product.thumbnail || product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-medium mb-2 line-clamp-2 text-responsive-sm">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                {product.discountPrice && (
                  <span className="text-responsive-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                )}
                <span className="text-base sm:text-lg font-bold">{formatPrice(product.discountPrice || product.price)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
