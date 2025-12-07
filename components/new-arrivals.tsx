"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { useLocale } from "@/lib/locale-context"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  salePercentage?: number
  isNew?: boolean
}

export function NewArrivals() {
  const { t } = useLocale()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewArrivals()
  }, [])

  const fetchNewArrivals = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?isNew=true&sortBy=createdAt&sortOrder=desc")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching new arrivals:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="heading-responsive-h2">{t.products.newArrivals}</h2>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400">{t.common.loading}</p>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
              ✨ Fraîchement arrivés
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
              {t.products.newArrivals}
            </h2>
          </div>
          <Link 
            href="/shop" 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            {t.products.viewAll}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div 
              key={product.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.discountPrice || product.price,
                  originalPrice: product.discountPrice ? product.price : undefined,
                  image: product.thumbnail || product.images?.[0] || "/placeholder.svg",
                  salePercentage: product.salePercentage,
                  isNew: product.isNew
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}




