"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { usePages } from "@/lib/pages-context"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/lib/locale-context"

export default function TermsConditionsPage() {
  const { pagesData, updatePagesData } = usePages()
  const { t } = useLocale()
  const [content, setContent] = useState("")

  useEffect(() => {
    setContent(pagesData.termsConditions)
  }, [pagesData])

  const handleSave = () => {
    updatePagesData({
      ...pagesData,
      termsConditions: content
    })
    toast.success(t.admin.termsSaved)
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.admin.termsConditions}</h1>
          <p className="text-muted-foreground">{t.admin.manageTermsContent}</p>
        </div>
        <Button onClick={handleSave} className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveChanges}
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-xl font-semibold">{t.admin.termsConditionsContent}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="edit">
            <TabsList>
              <TabsTrigger value="edit">{t.admin.edit}</TabsTrigger>
              <TabsTrigger value="preview">{t.admin.preview}</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms-content">{t.admin.contentMarkdownSupported}</Label>
                <Textarea
                  id="terms-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {t.admin.markdownFormatting}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-4">
              <div className="prose dark:prose-invert max-w-none p-6 border rounded-lg bg-muted/30">
                <div className="whitespace-pre-wrap">{content}</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" className="bg-[#4F46E5] hover:bg-[#4338CA]">
          <Save className="w-4 h-4 mr-2" />
          {t.admin.saveTermsConditions}
        </Button>
      </div>
    </div>
  )
}
