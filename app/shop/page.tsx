"use client"

import { useState, useEffect, Suspense, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocale } from "@/lib/locale-context"
import { SlidersHorizontal, Search, Loader2, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  price: number
  discountPrice?: number
  thumbnail?: string
  images?: string[]
  stock: number
  isFeatured: boolean
  salePercentage?: number
  category?: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
}

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest")
  const [inStockOnly, setInStockOnly] = useState(false)

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      
      // Build query params
      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (selectedCategories.length > 0) {
        params.append("categoryId", selectedCategories[0]) // API expects single category
      }
      if (priceRange.min) params.append("minPrice", priceRange.min)
      if (priceRange.max) params.append("maxPrice", priceRange.max)
      
      // Map sort values to API parameters
      if (sortBy) {
        switch (sortBy) {
          case "newest":
            params.append("sortBy", "createdAt")
            params.append("sortOrder", "desc")
            break
          case "price-asc":
            params.append("sortBy", "price")
            params.append("sortOrder", "asc")
            break
          case "price-desc":
            params.append("sortBy", "price")
            params.append("sortOrder", "desc")
            break
          case "name-asc":
            params.append("sortBy", "name")
            params.append("sortOrder", "asc")
            break
          case "name-desc":
            params.append("sortBy", "name")
            params.append("sortOrder", "desc")
            break
        }
      }
      
      if (inStockOnly) params.append("inStock", "true")

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedCategories, priceRange, sortBy, inStockOnly])

  useEffect(() => {
    fetchCategories()
    fetchProducts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch when filters change
  useEffect(() => {
    fetchProducts()
  }, [searchQuery, selectedCategories, sortBy, inStockOnly, fetchProducts])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }, [searchInput])

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSearchInput("")
    setSelectedCategories([])
    setPriceRange({ min: "", max: "" })
    setSortBy("newest")
    setInStockOnly(false)
    router.push("/shop")
  }, [router])

  const filtersContent = useMemo(() => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label>{t.shop.searchPlaceholder}</Label>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder={t.common.search}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t.categories.all}</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryToggle(category.id)}
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">{t.shop.priceRange}</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder={t.shop.minPrice}
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className="w-full"
          />
          <span>-</span>
          <Input
            type="number"
            placeholder={t.shop.maxPrice}
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full"
          />
        </div>
        <Button
          onClick={fetchProducts}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {t.shop.applyFilters}
        </Button>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Disponibilité</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            {t.common.inStock}
          </Label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        onClick={clearFilters}
        variant="outline"
        className="w-full"
      >
        <X className="w-4 h-4 mr-2" />
        {t.shop.clearFilters}
      </Button>
    </div>
  ), [t, searchInput, handleSearch, categories, selectedCategories, handleCategoryToggle, priceRange, fetchProducts, inStockOnly, clearFilters])

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="heading-responsive-h1 mb-2">{t.shop.title}</h1>
          <p className="text-responsive-sm text-muted-foreground">
            {loading ? t.common.loading : `${products.length} ${t.shop.results}`}
          </p>
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-4 sm:space-y-6 border rounded-lg p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-responsive-h3">{t.common.filter}</h2>
                <SlidersHorizontal className="icon-responsive" />
              </div>
              {filtersContent}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden btn-responsive w-full sm:w-auto">
                    <SlidersHorizontal className="icon-responsive mr-2" />
                    {t.common.filter}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t.common.filter}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    {filtersContent}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort By */}
              <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                <Label className="text-responsive-sm whitespace-nowrap">{t.shop.sortBy} :</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 sm:h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t.shop.sortNewest}</SelectItem>
                    <SelectItem value="price-asc">{t.shop.sortPriceLow}</SelectItem>
                    <SelectItem value="price-desc">{t.shop.sortPriceHigh}</SelectItem>
                    <SelectItem value="name-asc">Nom : A à Z</SelectItem>
                    <SelectItem value="name-desc">Nom : Z à A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">{t.products.noProducts}</p>
                <Button onClick={clearFilters}>{t.shop.clearFilters}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      price: product.discountPrice || product.price,
                      originalPrice: product.discountPrice ? product.price : undefined,
                      image: product.thumbnail || product.images?.[0] || "/placeholder.svg",
                      salePercentage: product.salePercentage
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
