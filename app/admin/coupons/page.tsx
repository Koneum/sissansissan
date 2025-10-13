"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Plus } from "lucide-react"

interface Coupon {
  id: string
  code: string
  discount: string
  uses: number
  limit: number
  status: "active" | "expired" | "disabled"
  discountType?: "percentage" | "fixed" | "free-shipping"
  discountValue?: number
}

const initialCoupons: Coupon[] = [
  { id: "1", code: "SAVE20", discount: "20%", uses: 145, limit: 500, status: "active", discountType: "percentage", discountValue: 20 },
  { id: "2", code: "WELCOME10", discount: "10%", uses: 89, limit: 200, status: "active", discountType: "percentage", discountValue: 10 },
  { id: "3", code: "SUMMER50", discount: "50%", uses: 200, limit: 200, status: "expired", discountType: "percentage", discountValue: 50 },
  { id: "4", code: "FREESHIP", discount: "Free Shipping", uses: 456, limit: 1000, status: "active", discountType: "free-shipping", discountValue: 0 },
]

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [couponToEdit, setCouponToEdit] = useState<Coupon | null>(null)

  // États pour le formulaire
  const [formCode, setFormCode] = useState("")
  const [formDiscountType, setFormDiscountType] = useState<string>("percentage")
  const [formDiscountValue, setFormDiscountValue] = useState("")
  const [formLimit, setFormLimit] = useState("")
  const [formStatus, setFormStatus] = useState<string>("active")

  const resetForm = () => {
    setFormCode("")
    setFormDiscountType("percentage")
    setFormDiscountValue("")
    setFormLimit("")
    setFormStatus("active")
  }

  const handleCreateCoupon = () => {
    const newCoupon: Coupon = {
      id: String(coupons.length + 1),
      code: formCode.toUpperCase(),
      discount: formDiscountType === "free-shipping" ? "Free Shipping" : `${formDiscountValue}${formDiscountType === "percentage" ? "%" : "$"}`,
      uses: 0,
      limit: parseInt(formLimit) || 100,
      status: formStatus as "active" | "expired" | "disabled",
      discountType: formDiscountType as "percentage" | "fixed" | "free-shipping",
      discountValue: parseFloat(formDiscountValue) || 0,
    }
    setCoupons([...coupons, newCoupon])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setCouponToEdit(coupon)
    setFormCode(coupon.code)
    setFormDiscountType(coupon.discountType || "percentage")
    setFormDiscountValue(String(coupon.discountValue || ""))
    setFormLimit(String(coupon.limit))
    setFormStatus(coupon.status)
  }

  const handleSaveEdit = () => {
    if (couponToEdit) {
      setCoupons(coupons.map(c => 
        c.id === couponToEdit.id 
          ? {
              ...c,
              code: formCode.toUpperCase(),
              discount: formDiscountType === "free-shipping" ? "Free Shipping" : `${formDiscountValue}${formDiscountType === "percentage" ? "%" : "$"}`,
              limit: parseInt(formLimit) || 100,
              status: formStatus as "active" | "expired" | "disabled",
              discountType: formDiscountType as "percentage" | "fixed" | "free-shipping",
              discountValue: parseFloat(formDiscountValue) || 0,
            }
          : c
      ))
      setCouponToEdit(null)
      resetForm()
    }
  }

  const handleDeleteCoupon = () => {
    if (couponToDelete) {
      setCoupons(coupons.filter(c => c.id !== couponToDelete.id))
      setCouponToDelete(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-muted-foreground">Create and manage discount coupons</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Discount</th>
                  <th className="text-left py-3 px-4">Uses</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="py-3 px-4 font-mono font-bold">{coupon.code}</td>
                    <td className="py-3 px-4">{coupon.discount}</td>
                    <td className="py-3 px-4">
                      {coupon.uses} / {coupon.limit}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={coupon.status === "active" ? "default" : "secondary"}>{coupon.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCoupon(coupon)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCouponToDelete(coupon)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
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

      {/* Dialog de création de coupon */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon Code</Label>
              <Input
                id="coupon-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g., SAVE20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select value={formDiscountType} onValueChange={setFormDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="free-shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formDiscountType !== "free-shipping" && (
                <div className="space-y-2">
                  <Label htmlFor="discount-value">Discount Value</Label>
                  <Input
                    id="discount-value"
                    type="number"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    placeholder={formDiscountType === "percentage" ? "20" : "50"}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage-limit">Usage Limit</Label>
                <Input
                  id="usage-limit"
                  type="number"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateCoupon}>
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition de coupon */}
      <Dialog open={!!couponToEdit} onOpenChange={() => { setCouponToEdit(null); resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-coupon-code">Coupon Code</Label>
              <Input
                id="edit-coupon-code"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="e.g., SAVE20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discount-type">Discount Type</Label>
                <Select value={formDiscountType} onValueChange={setFormDiscountType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    <SelectItem value="free-shipping">Free Shipping</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formDiscountType !== "free-shipping" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-discount-value">Discount Value</Label>
                  <Input
                    id="edit-discount-value"
                    type="number"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    placeholder={formDiscountType === "percentage" ? "20" : "50"}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-usage-limit">Usage Limit</Label>
                <Input
                  id="edit-usage-limit"
                  type="number"
                  value={formLimit}
                  onChange={(e) => setFormLimit(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCouponToEdit(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!couponToDelete} onOpenChange={() => setCouponToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the coupon <span className="font-semibold">{couponToDelete?.code}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCoupon}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Coupon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
