"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddCountdownPage() {
  return (
    <div className="space-y-6 pb-8">
      <Card className="border-0 shadow-sm max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">Add Countdown</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" placeholder="Enter your title" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Subtitle <span className="text-red-500">*</span>
            </Label>
            <Input id="subtitle" placeholder="Enter your subtitle" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Slug
            </Label>
            <Input id="slug" placeholder="sample-slug" className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countdown-image" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Countdown Image (Recommended Size 65 × 75) <span className="text-red-500">*</span>
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

          <div className="space-y-2">
            <Label htmlFor="countdown-date" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Countdown Date <span className="text-red-500">*</span>
            </Label>
            <Input id="countdown-date" type="datetime-local" className="h-11" />
          </div>

          <div className="pt-4">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-8" size="lg">
              Save Countdown
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
