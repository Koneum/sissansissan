"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus } from "lucide-react"
import Link from "next/link"

export default function HeroBannerPage() {
  const banners = [
    {
      id: 1,
      title: "iPhone 16 Pro & 16 Pro Max",
      image: "/modern-smartphone.png",
    },
    {
      id: 2,
      title: "Macbook Pro M4",
      image: "/macbook.jpg",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="heading-responsive-h2 text-slate-900 dark:text-white">All Hero Banners</h1>
            <Link href="/admin/customization/hero-banner/add">
              <Button className="bg-[#1e293b] hover:bg-[#334155] text-white btn-responsive w-full sm:w-auto gap-2">
                <Plus className="icon-responsive" />
                Add Hero Banner
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="card-responsive">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-responsive-sm font-medium text-slate-600 dark:text-slate-400">Image</th>
                  <th className="text-left py-2 px-2 sm:py-3 sm:px-4 text-responsive-sm font-medium text-slate-600 dark:text-slate-400">Title</th>
                  <th className="text-right py-2 px-2 sm:py-3 sm:px-4 text-responsive-sm font-medium text-slate-600 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="border-b last:border-0">
                    <td className="py-3 px-2 sm:py-4 sm:px-4">
                      <img
                        src={banner.image || "/placeholder.svg"}
                        alt={banner.title}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                      />
                    </td>
                    <td className="py-3 px-2 sm:py-4 sm:px-4 text-responsive-sm text-slate-700 dark:text-slate-300">{banner.title}</td>
                    <td className="py-3 px-2 sm:py-4 sm:px-4">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-transparent">
                          <Trash2 className="icon-responsive" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 bg-transparent">
                          <Pencil className="icon-responsive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


