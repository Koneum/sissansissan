"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useParams, useRouter } from "next/navigation"

// Données mockées des produits
const mockProducts: Record<string, any> = {
  "1": {
    id: "1",
    title: "iPhone 16 Pro - 8/128GB",
    slug: "iphone-16-pro-8-128gb",
    description: "The latest iPhone with advanced features and stunning design.",
    shortDescription: "Latest iPhone model with 8GB RAM and 128GB storage",
    category: "electronics",
    price: "999",
    discountedPrice: "899",
    salePercentage: "10",
    isNew: true,
    isFeatured: true,
    sku: "IPH16-128",
    quantity: "15",
    variants: ["128GB", "256GB", "512GB"],
    attributes: ["Color: Natural Titanium", "Screen: 6.3 inch"],
    additionalInfo: ["5G Compatible", "A18 Pro chip"],
  },
  "2": {
    id: "2",
    title: "MacBook Air M4 chip, 16/256GB",
    slug: "macbook-air-m4-16-256gb",
    description: "Powerful and lightweight MacBook Air with M4 chip.",
    shortDescription: "MacBook Air with 16GB RAM and 256GB SSD",
    category: "electronics",
    price: "1299",
    discountedPrice: "1199",
    salePercentage: "8",
    isNew: false,
    isFeatured: true,
    sku: "MBA-M4-256",
    quantity: "8",
    variants: ["256GB", "512GB", "1TB"],
    attributes: ["Processor: M4", "RAM: 16GB"],
    additionalInfo: ["Battery: Up to 18 hours", "Weight: 1.24kg"],
  },
  "3": {
    id: "3",
    title: "Havit HV-G69 USB Gamepad",
    slug: "havit-hv-g69-usb-gamepad",
    description: "Ergonomic gamepad for comfortable gaming experience.",
    shortDescription: "USB gamepad with ergonomic design",
    category: "accessories",
    price: "49",
    discountedPrice: "",
    salePercentage: "",
    isNew: false,
    isFeatured: false,
    sku: "GAM-HV69",
    quantity: "30",
    variants: ["Black", "Red"],
    attributes: ["Connectivity: USB", "Compatible: PC/PS3"],
    additionalInfo: ["Vibration feedback", "6 feet cable"],
  },
}

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

  useEffect(() => {
    // Charger les données du produit
    const product = mockProducts[productId]
    if (product) {
      setTitle(product.title || "")
      setSlug(product.slug || "")
      setDescription(product.description || "")
      setShortDescription(product.shortDescription || "")
      setCategory(product.category || "")
      setPrice(product.price || "")
      setDiscountedPrice(product.discountedPrice || "")
      setSalePercentage(product.salePercentage || "")
      setIsNew(product.isNew || false)
      setIsFeatured(product.isFeatured || false)
      setSku(product.sku || "")
      setQuantity(product.quantity || "")
      setVariants(product.variants || [])
      setAttributes(product.attributes || [])
      setAdditionalInfo(product.additionalInfo || [])
      setBody(product.body || "")
    }
  }, [productId])

  const handleSaveProduct = () => {
    // Logique de sauvegarde ici
    console.log("Product updated:", {
      id: productId,
      title,
      slug,
      description,
      shortDescription,
      category,
      price,
      discountedPrice,
      salePercentage,
      isNew,
      isFeatured,
      sku,
      quantity,
      variants,
      attributes,
      additionalInfo,
      body,
    })
    // Rediriger vers la liste des produits
    router.push("/admin/products")
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Edit Product</h1>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-6">
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
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothing">Clothing</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
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
            >
              Update Product
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


