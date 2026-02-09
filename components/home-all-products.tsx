"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"

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

interface ProductsResponse {
  success: boolean
  data: Product[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function HomeAllProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchPage = async (targetPage: number, append: boolean) => {
    const res = await fetch(`/api/products?page=${targetPage}&limit=20&sortBy=createdAt&sortOrder=desc`)
    if (!res.ok) throw new Error("Failed to fetch products")
    const json = (await res.json()) as ProductsResponse

    const next = json.data || []
    setProducts((prev) => (append ? [...prev, ...next] : next))
    setPage(json.pagination?.page || targetPage)
    setTotalPages(json.pagination?.totalPages || 1)
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        setLoading(true)
        await fetchPage(1, false)
      } catch (e) {
        if (mounted) {
          setProducts([])
          setPage(1)
          setTotalPages(1)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const canLoadMore = page < totalPages

  return (
    <section className="container mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">Tous les produits</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? null : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  price: p.discountPrice || p.price,
                  originalPrice: p.discountPrice ? p.price : undefined,
                  image: p.thumbnail || p.images?.[0] || "/placeholder.svg",
                  salePercentage: p.salePercentage,
                  isNew: p.isNew,
                }}
              />
            ))}
          </div>

          {canLoadMore && (
            <div className="flex justify-center mt-6">
              <Button
                disabled={loadingMore}
                onClick={async () => {
                  try {
                    setLoadingMore(true)
                    await fetchPage(page + 1, true)
                  } finally {
                    setLoadingMore(false)
                  }
                }}
                className="min-w-48"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement...
                  </span>
                ) : (
                  "Charger plus"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}
