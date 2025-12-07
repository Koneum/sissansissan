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
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="heading-responsive-h2">{t.products.newArrivals}</h2>
        <Link href="/products" className="text-responsive-sm font-medium text-orange-600 hover:underline">
          {t.products.viewAll}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
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
        ))}
      </div>
    </section>
  )
}




