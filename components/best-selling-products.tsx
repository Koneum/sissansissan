"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
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

export function BestSellingProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBestSellers()
  }, [])

  const fetchBestSellers = async () => {
    try {
      const response = await fetch("/api/products?featured=true&limit=6")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching best sellers:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (products.length === 0) return null
  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="heading-responsive-h2 mb-2">Produits les plus vendus</h2>
        <p className="text-responsive-sm text-gray-600 dark:text-gray-400">
          Ces produits sont en train de voler des rayons ! Découvrez ce que tout le monde aime en ce moment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {products.map((product) => (
          <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 flex items-center justify-center h-48 sm:h-64">
              <img
                src={product.thumbnail || product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-medium mb-2 line-clamp-2 text-responsive-sm">{product.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-base sm:text-lg font-bold">{formatPrice(product.discountPrice || product.price)}</span>
                {product.discountPrice && (
                  <span className="text-responsive-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link href="/shop" className="inline-block text-responsive-sm font-medium text-orange-600 dark:text-orange-400 hover:underline">
          Voir TOUT
        </Link>
      </div>
    </section>
  )
}




