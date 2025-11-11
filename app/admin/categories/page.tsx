"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"

interface Category {
  id: string
  name: string
  image: string
  slug?: string
  description?: string
}

export default function CategoriesPage() {
  const { t } = useLocale()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [editedName, setEditedName] = useState("")
  const [editedSlug, setEditedSlug] = useState("")
  const [editedDescription, setEditedDescription] = useState("")
  const [editedImage, setEditedImage] = useState("")

  // Fetch categories from API
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error(t.admin.errorCreate)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete category")
      }

      toast.success(t.admin.successDelete)
      setCategories(categories.filter(c => c.id !== categoryToDelete.id))
      setCategoryToDelete(null)
    } catch (error: unknown) {
      console.error("Error deleting category:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorDelete)
    }
  }

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category)
    setEditedName(category.name)
    setEditedSlug(category.slug || "")
    setEditedDescription(category.description || "")
    setEditedImage(category.image || "")
  }

  const handleSaveEdit = async () => {
    if (!categoryToEdit) return

    try {
      const response = await fetch(`/api/categories/${categoryToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editedName,
          slug: editedSlug,
          description: editedDescription,
          image: editedImage,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update category")
      }

      const result = await response.json()
      const updatedCategory = result.data || result
      toast.success(t.admin.successUpdate)
      
      setCategories(categories.map(c => 
        c.id === categoryToEdit.id ? updatedCategory : c
      ))
      setCategoryToEdit(null)
      fetchCategories() // Refresh list
    } catch (error: unknown) {
      console.error("Error updating category:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorUpdate)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="heading-responsive-h2 text-slate-900 dark:text-white">{t.admin.allCategories}</h1>
          <p className="text-responsive-sm text-muted-foreground">{t.common.total}: {categories.length} {t.admin.categories.toLowerCase()}</p>
        </div>
        <Link href="/admin/categories/add">
          <Button className="bg-[#1e293b] hover:bg-[#334155] btn-responsive w-full sm:w-auto">+ {t.admin.addCategory}</Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-responsive-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.categoryImage}</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-responsive-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.categoryName}</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-responsive-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">{t.admin.categorySlug}</th>
                <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-responsive-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t.common.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    {t.admin.noData}
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={index !== categories.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}
                  >
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="relative w-16 h-12 sm:w-20 sm:h-16 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                        <Image
                          src={category.image || "/placeholder.svg"}
                          alt={category.name}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <span className="text-responsive-sm font-medium text-slate-900 dark:text-white">{category.name}</span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6 hidden md:table-cell">
                      <span className="text-responsive-sm text-muted-foreground">{category.slug || "-"}</span>
                    </td>
                    <td className="py-3 px-3 sm:py-4 sm:px-6">
                      <div className="flex gap-1 sm:gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                          onClick={() => setCategoryToDelete(category)}
                        >
                          <Trash2 className="icon-responsive" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="icon-responsive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.admin.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.admin.deleteMessage} <span className="font-semibold">{categoryToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.admin.deleteCategory}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit category dialog */}
      <Dialog open={!!categoryToEdit} onOpenChange={() => setCategoryToEdit(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t.admin.editCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t.admin.categoryName} *</Label>
              <Input
                id="edit-name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder={t.admin.categoryName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-slug">{t.admin.categorySlug} *</Label>
              <Input
                id="edit-slug"
                value={editedSlug}
                onChange={(e) => setEditedSlug(e.target.value)}
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">{t.admin.productImage}</Label>
              <ImageUpload
                value={editedImage}
                onChange={setEditedImage}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t.common.description}</Label>
              <Textarea
                id="edit-description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder={t.common.description}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryToEdit(null)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSaveEdit} className="bg-[#4F46E5] hover:bg-[#4338CA]">
              {t.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
