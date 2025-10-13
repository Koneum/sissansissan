"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddHeroBannerPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-0 shadow-sm max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">Add Hero Banner</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="banner-name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Banner Name
            </Label>
            <Input id="banner-name" placeholder="Enter banner name" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Subtitle <span className="text-red-500">*</span>
            </Label>
            <Input id="subtitle" placeholder="Enter subtitle" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Slug
            </Label>
            <Input id="slug" placeholder="banner-slug" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-image" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Banner Image (Recommended: 255x315) <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="default" className="bg-[#4F46E5] hover:bg-[#4338CA]">
                Choose File
              </Button>
              <span className="text-sm text-slate-500">No file chosen</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Product Slug <span className="text-red-500">*</span>
            </Label>
            <Input id="product-slug" placeholder="Enter your product slug" className="h-11" />
          </div>

          <div className="pt-4">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8" size="lg">
              Save Hero Banner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
