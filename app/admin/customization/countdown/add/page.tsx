"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddCountdownPage() {
  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <Card className="border-0 shadow-sm max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle className="heading-responsive-h3">Add Countdown</CardTitle>
        </CardHeader>
        <CardContent className="card-responsive space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" placeholder="Enter your title" className="h-10 sm:h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Subtitle <span className="text-red-500">*</span>
            </Label>
            <Input id="subtitle" placeholder="Enter your subtitle" className="h-10 sm:h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Slug
            </Label>
            <Input id="slug" placeholder="sample-slug" className="h-10 sm:h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countdown-image" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Countdown Image (Recommended Size 65 × 75) <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Button type="button" variant="default" className="bg-[#4F46E5] hover:bg-[#4338CA] btn-responsive w-full sm:w-auto">
                Choose File
              </Button>
              <span className="text-responsive-sm text-slate-500">No file chosen</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-slug" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Product Slug <span className="text-red-500">*</span>
            </Label>
            <Input id="product-slug" placeholder="Enter your product slug" className="h-10 sm:h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countdown-date" className="text-responsive-sm font-medium text-slate-700 dark:text-slate-300">
              Countdown Date <span className="text-red-500">*</span>
            </Label>
            <Input id="countdown-date" type="datetime-local" className="h-10 sm:h-11" />
          </div>

          <div className="pt-4">
            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white btn-responsive w-full sm:w-auto">
              Save Countdown
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
