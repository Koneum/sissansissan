"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

interface Category {
  id: string
  name: string
  slug: string
  image?: string
}

export function CategoryBrowser() {
  const { t } = useLocale()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{t.categories.title}</h2>
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400">{t.common.loading}</p>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">{t.categories.title}</h2>
        <div className="flex gap-2">
          <button className="p-2 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-900 rounded-lg hover:shadow-md transition-all duration-300 cursor-pointer hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              <img src={category.image || "/placeholder.svg"} alt={category.name} className="w-16 h-16 object-cover" />
            </div>
            <span className="text-sm font-medium text-center">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}




