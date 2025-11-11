"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { MultiImageUpload } from "@/components/ui/multi-image-upload"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import Link from "next/link"

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const { t } = useLocale()
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    categoryId: "",
    images: [] as string[],
    featured: false,
    isNew: false
  })

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${productId}`)
      if (!response.ok) {
        throw new Error("Product not found")
      }
      const result = await response.json()
      const product = result.data || result
      
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        comparePrice: product.discountPrice?.toString() || "",
        stock: product.stock?.toString() || "",
        categoryId: product.categoryId || "",
        images: product.images || [],
        featured: product.isFeatured || false,
        isNew: product.isNew || false
      })
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product")
      router.push("/admin/products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error(t.admin.errorCreate)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      toast.error(t.admin.fillRequired)
      return
    }

    if (formData.images.length === 0) {
      toast.error(t.admin.uploadImage)
      return
    }

    try {
      setSaving(true)
      
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price),
        discountPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock),
        categoryId: formData.categoryId,
        images: formData.images,
        thumbnail: formData.images[0], // Primary image
        isFeatured: formData.featured,
        isNew: formData.isNew
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.errorUpdate)
      }

      toast.success(t.admin.successUpdate)
      router.push("/admin/products")
    } catch (error: unknown) {
      console.error("Error updating product:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorUpdate)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.admin.editProduct || "Edit Product"}</h1>
          <p className="text-sm text-muted-foreground">Update product information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  {t.admin.productName} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder={t.admin.enterProductName}
                  className="h-11"
                  value={formData.name}
                  onChange={handleNameChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t.admin.productSlug}</Label>
                <Input
                  id="slug"
                  placeholder="product-slug"
                  className="h-11"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">{t.admin.autoGeneratedSlug}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.admin.productDescription}</Label>
                <Textarea
                  id="description"
                  placeholder={t.admin.writeDescription}
                  rows={6}
                  className="resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">
                  {t.common.price} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparePrice">{t.admin.comparePrice}</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="h-11"
                  value={formData.comparePrice}
                  onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                />
              </div>
            </div>

            {/* Inventory & Category */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="stock">
                  {t.admin.stockQuantity} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  {t.common.category} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.admin.selectCategory} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Images */}
            <div className="space-y-2">
              <Label>
                {t.admin.productImages} <span className="text-red-500">*</span>
              </Label>
              <MultiImageUpload
                values={formData.images}
                onChange={(urls) => setFormData({ ...formData, images: urls })}
                maxImages={5}
                disabled={saving}
              />
            </div>

            {/* Featured & New Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  {t.admin.featuredProduct}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isNew"
                  checked={formData.isNew}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked as boolean })}
                />
                <Label htmlFor="isNew" className="cursor-pointer">
                  Nouveau produit (apparaîtra dans la section Nouveautés)
                </Label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8"
                size="lg"
                disabled={saving}
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saving ? "Updating..." : "Update Product"}
              </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline" size="lg">
                  {t.common.cancel}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
