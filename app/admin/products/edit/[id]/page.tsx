"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams, useRouter } from "next/navigation"
import { MultiImageUpload } from "@/components/ui/multi-image-upload"
import { toast } from "sonner"

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [discountedPrice, setDiscountedPrice] = useState("")
  const [salePercentage, setSalePercentage] = useState("")
  const [isNew, setIsNew] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [sku, setSku] = useState("")
  const [quantity, setQuantity] = useState("")
  const [variants, setVariants] = useState<string[]>([])
  const [attributes, setAttributes] = useState<string[]>([])
  const [additionalInfo, setAdditionalInfo] = useState<string[]>([])
  const [body, setBody] = useState("")
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      const product = await response.json()
      
      setTitle(product.name || "")
      setSlug(product.slug || "")
      setDescription(product.description || "")
      setShortDescription(product.shortDesc || "")
      setCategory(product.categoryId || "")
      setPrice(product.price?.toString() || "")
      setDiscountedPrice(product.discountPrice?.toString() || "")
      setSalePercentage(product.salePercentage?.toString() || "")
      setIsNew(product.isNew || false)
      setIsFeatured(product.isFeatured || false)
      setSku(product.sku || "")
      setQuantity(product.stock?.toString() || "")
      setImages(product.images || [])
      setVariants(product.tags || [])
      setAttributes(product.attributes ? Object.entries(product.attributes).map(([k, v]) => `${k}: ${v}`) : [])
      setAdditionalInfo([])
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
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSaveProduct = async () => {
    if (!title || !price || !category) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
          description,
          shortDesc: shortDescription,
          categoryId: category,
          price: parseFloat(price),
          discountPrice: discountedPrice ? parseFloat(discountedPrice) : null,
          salePercentage: salePercentage ? parseInt(salePercentage) : null,
          isNew,
          isFeatured,
          sku,
          stock: parseInt(quantity) || 0,
          images,
          tags: variants,
          attributes: attributes.reduce((acc, attr) => {
            const [key, value] = attr.split(":")
            if (key && value) acc[key.trim()] = value.trim()
            return acc
          }, {} as Record<string, string>),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      toast.success("Product updated successfully!")
      router.push("/admin/products")
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
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
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Product</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
          {/* Product Images */}
          <div className="space-y-2">
            <Label>
              Product Images <span className="text-red-500">*</span>
            </Label>
            <MultiImageUpload
              values={images}
              onChange={setImages}
              maxImages={5}
              disabled={saving}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter your product title.."
                className="h-11"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Slug
              </Label>
              <Input
                id="slug"
                placeholder="this-is-sample-slug"
                className="h-11 text-slate-400"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Description
              </Label>
              <div className="border rounded-lg overflow-hidden">
                <div className="flex items-center gap-1 p-2 border-b bg-slate-50 dark:bg-slate-900">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="font-bold">B</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="italic">I</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="underline">U</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="line-through">S</span>
                  </Button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    ≡
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    •
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    1.
                  </Button>
                  <div className="w-px h-6 bg-slate-300 mx-1" />
                  <Select defaultValue="normal">
                    <SelectTrigger className="h-8 w-24 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="h1">Heading 1</SelectItem>
                      <SelectItem value="h2">Heading 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="normal">
                    <SelectTrigger className="h-8 w-24 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  id="description"
                  className="min-h-[200px] border-0 focus-visible:ring-0"
                  placeholder="Write your product description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="short-description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Short Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="short-description"
                  placeholder="Write short description"
                  rows={3}
                  className="resize-none"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discounted-price" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Discounted Price
                </Label>
                <Input
                  id="discounted-price"
                  type="number"
                  placeholder="0"
                  className="h-11"
                  value={discountedPrice}
                  onChange={(e) => setDiscountedPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Product Badges & Flags</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sale-percentage" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Sale Percentage (%)
                  </Label>
                  <Input
                    id="sale-percentage"
                    type="number"
                    placeholder="e.g., 25 for 25% OFF"
                    className="h-11"
                    value={salePercentage}
                    onChange={(e) => setSalePercentage(e.target.value)}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-slate-500">This will display as "X% OFF" badge on the product card</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is-new" checked={isNew} onCheckedChange={(checked) => setIsNew(checked as boolean)} />
                    <Label
                      htmlFor="is-new"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Mark as NEW
                    </Label>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">Display "NEW" badge on product card</p>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is-featured"
                      checked={isFeatured}
                      onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                    />
                    <Label
                      htmlFor="is-featured"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Featured Product
                    </Label>
                  </div>
                  <p className="text-xs text-slate-500 ml-6">Show in featured products section</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                SKU
              </Label>
              <Input
                id="sku"
                placeholder="Enter SKU"
                className="h-11"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                className="h-11"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Product Variants <span className="text-red-500">*</span>
            </Label>
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              {variants.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No items</p>
              ) : (
                <div className="space-y-2">
                  {variants.map((variant, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span>{variant}</span>
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="default"
              className="bg-[#1e293b] hover:bg-[#334155]"
              onClick={() => setVariants([...variants, `Variant ${variants.length + 1}`])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add item
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Custom Attributes</Label>
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              {attributes.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No attributes added yet.</p>
              ) : (
                <div className="space-y-2">
                  {attributes.map((attr, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span>{attr}</span>
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="default"
              className="bg-[#1e293b] hover:bg-[#334155]"
              onClick={() => setAttributes([...attributes, `Attribute ${attributes.length + 1}`])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add item
            </Button>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Additional Information</Label>
            <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              {additionalInfo.length === 0 ? (
                <p className="text-center text-slate-500 py-4">No items</p>
              ) : (
                <div className="space-y-2">
                  {additionalInfo.map((info, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded">
                      <span>{info}</span>
                      <X
                        className="w-4 h-4 cursor-pointer"
                        onClick={() => setAdditionalInfo(additionalInfo.filter((_, idx) => idx !== i))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="default"
              className="bg-[#1e293b] hover:bg-[#334155]"
              onClick={() => setAdditionalInfo([...additionalInfo, `Info ${additionalInfo.length + 1}`])}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add item
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Body
            </Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 p-2 border-b bg-slate-50 dark:bg-slate-900">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="font-bold">B</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="italic">I</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="underline">U</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="line-through">S</span>
                </Button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  ≡
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  •
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  1.
                </Button>
                <div className="w-px h-6 bg-slate-300 mx-1" />
                <Select defaultValue="normal">
                  <SelectTrigger className="h-8 w-24 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="h1">Heading 1</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="normal">
                  <SelectTrigger className="h-8 w-24 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                id="body"
                className="min-h-[300px] border-0 focus-visible:ring-0"
                placeholder="Write detailed product information..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8"
              size="lg"
              onClick={handleSaveProduct}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push("/admin/products")}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


