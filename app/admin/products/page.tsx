"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/currency"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PagePermissionGuard } from "@/components/page-permission-guard"
import { PermissionButton } from "@/components/permission-button"

interface Product {
  id: string
  name: string
  description?: string
  price: number
  discountPrice?: number
  stock: number
  thumbnail?: string
  images?: string[]
  category?: {
    id: string
    name: string
  }
}

export default function ProductsPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name-asc")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?admin=true")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data.data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStock = stockFilter === "all" || 
        (stockFilter === "low" && product.stock < 10) ||
        (stockFilter === "in-stock" && product.stock >= 10) ||
        (stockFilter === "out-of-stock" && product.stock === 0)
      
      return matchesSearch && matchesStock
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "stock-asc":
          return a.stock - b.stock
        case "stock-desc":
          return b.stock - a.stock
        default:
          return 0
      }
    })
  }, [products, searchQuery, stockFilter, sortBy])

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete product")
      }

      toast.success(t.admin.successDelete)
      setProducts(products.filter(p => p.id !== productToDelete.id))
      setProductToDelete(null)
    } catch (error: unknown) {
      console.error("Error deleting product:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorDelete)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <PagePermissionGuard category="products" action="view">
    <div className="space-y-4 sm:space-y-6 pb-4 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">{t.admin.allProducts}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{t.common.total} : {products.length} {t.admin.products.toLowerCase()}</p>
        </div>
        <PermissionButton 
          category="products" 
          action="create"
          size="sm" 
          className="bg-[#1e293b] hover:bg-[#334155] w-full sm:w-auto text-sm"
          onClick={() => router.push('/admin/products/add')}
        >
          + {t.admin.addProduct}
        </PermissionButton>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t.common.search + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 sm:h-10 md:h-11 text-sm"
            />
          </div>

          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
              <SelectValue placeholder={t.common.filter} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.stockLevel}</SelectItem>
              <SelectItem value="in-stock">{t.admin.inStock} (≥10)</SelectItem>
              <SelectItem value="low">{t.admin.lowStock} (&lt;10)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
              <SelectValue placeholder={t.common.sort} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t.admin.sortByName} (A-Z)</SelectItem>
              <SelectItem value="name-desc">{t.admin.sortByName} (Z-A)</SelectItem>
              <SelectItem value="price-asc">{t.common.price} (↑)</SelectItem>
              <SelectItem value="price-desc">{t.common.price} (↓)</SelectItem>
              <SelectItem value="stock-asc">{t.admin.sortByStock} (↑)</SelectItem>
              <SelectItem value="stock-desc">{t.admin.sortByStock} (↓)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.productName}</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.category}</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.price}</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.stock}</th>
                <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 sm:py-8 text-center text-muted-foreground text-sm">
                    {t.admin.noData}
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className={index !== filteredAndSortedProducts.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}
                  >
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={product.thumbnail || product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-contain p-1 sm:p-2"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm truncate">{product.name}</p>
                          {product.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 hidden sm:block">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <span className="text-xs sm:text-sm text-muted-foreground">{product.category?.name || "-"}</span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div>
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{formatPrice(product.discountPrice)}</span>
                            <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <Badge variant={product.stock < 10 ? "destructive" : "default"} className="text-[10px] sm:text-xs">
                        {product.stock}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex gap-1 sm:gap-2 justify-end">
                        <PermissionButton
                          category="products"
                          action="delete"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          onClick={() => setProductToDelete(product)}
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </PermissionButton>
                        <PermissionButton
                          category="products"
                          action="edit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </PermissionButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteMessage} <span className="font-semibold">{productToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.admin.deleteProduct}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PagePermissionGuard>
  )
}
