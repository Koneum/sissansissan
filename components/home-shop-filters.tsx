"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  id: string
  name: string
}

export function HomeShopFilters() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [categoryId, setCategoryId] = useState<string>("all")

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        setCategories(data?.data || [])
      } catch {
        // ignore
      }
    }

    fetchCategories()
  }, [])

  const categoryOptions = useMemo(() => {
    return categories
      .map((c) => ({ id: c.id, name: c.name }))
      .filter((c) => typeof c.id === "string" && typeof c.name === "string")
  }, [categories])

  const goToShop = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (categoryId && categoryId !== "all") params.set("categoryId", categoryId)
    const qs = params.toString()
    router.push(qs ? `/shop?${qs}` : "/shop")
  }

  return (
    <div className="container mx-auto px-4 pt-6">
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  goToShop()
                }
              }}
            />
          </div>

          <div className="w-full md:w-[260px]">
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categoryOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={goToShop} className="gap-2">
            <Search className="w-4 h-4" />
            Rechercher
          </Button>
        </div>
      </div>
    </div>
  )
}
