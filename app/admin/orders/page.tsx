"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPrice } from "@/lib/currency"
import { useLocale } from "@/lib/locale-context"
import { Eye, Loader2, Search, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED"

interface Order {
  id: string
  orderNumber: string
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod?: string | null
  customerNotes?: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      thumbnail?: string
    }
  }[]
  shippingAddress?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    district?: string
    country?: string
    street?: string
    state?: string
  }
  billingAddress?: {
    name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    district?: string
    country?: string
    street?: string
    state?: string
    company?: string
  }
}

function hasMeaningfulAddress(addr?: {
  name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  district?: string
  country?: string
  street?: string
  state?: string
  company?: string
} | null) {
  if (!addr) return false
  return Boolean(
    (addr.address && String(addr.address).trim()) ||
    (addr.street && String(addr.street).trim()) ||
    (addr.city && String(addr.city).trim()) ||
    (addr.district && String(addr.district).trim()) ||
    (addr.country && String(addr.country).trim())
  )
}

export default function OrdersPage() {
  const { t } = useLocale()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [editedStatus, setEditedStatus] = useState<OrderStatus>("PENDING")
  const [editedPaymentStatus, setEditedPaymentStatus] = useState<PaymentStatus>("PENDING")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrders(page, limit, filterStatus)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filterStatus])

  const fetchOrders = async (requestedPage = 1, requestedLimit = 20, requestedStatus = "all") => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set("page", String(requestedPage))
      params.set("limit", String(requestedLimit))
      if (requestedStatus !== "all") {
        params.set("status", requestedStatus)
      }

      const response = await fetch(`/api/orders?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data.data || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)
      setSelectedOrderIds([])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error(t.admin.errorCreate)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrders = async (ids: string[]) => {
    if (ids.length === 0) return
    try {
      setCancelling(true)
      const response = await fetch("/api/orders/bulk-cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      })

      const data = await response.json().catch(() => null)
      if (!response.ok || !data?.success) {
        const msg = data?.failed?.[0]?.error || data?.error || t.admin.errorUpdate
        throw new Error(msg)
      }

      toast.success("Commande(s) annulée(s)")
      await fetchOrders(page, limit, filterStatus)
    } catch (error: unknown) {
      console.error("Error cancelling orders:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorUpdate)
    } finally {
      setCancelling(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedOrderIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    const visibleIds = filteredAndSortedOrders.map((o) => o.id)
    setSelectedOrderIds((prev) => (prev.length === visibleIds.length ? [] : visibleIds))
  }

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const searchLower = searchQuery.toLowerCase()
      const orderNumber = order.orderNumber?.toLowerCase() || ""
      const userName = order.user?.name?.toLowerCase() || ""
      const userEmail = order.user?.email?.toLowerCase() || ""
      const status = order.status?.toLowerCase() || ""
      
      const matchesSearch = orderNumber.includes(searchLower) ||
        userName.includes(searchLower) ||
        userEmail.includes(searchLower) ||
        status.includes(searchLower)
      
      const matchesStatus = filterStatus === "all" || order.status === filterStatus

      // Par défaut, on masque les commandes annulées (elles restent visibles via le filtre CANCELLED)
      if (filterStatus === "all" && order.status === "CANCELLED") return false
      
      return matchesSearch && matchesStatus
    })

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "total-desc":
          return b.total - a.total
        case "total-asc":
          return a.total - b.total
        default:
          return 0
      }
    })
  }, [orders, searchQuery, sortBy, filterStatus])

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    try {
      setUpdatingStatus(true)
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: editedStatus,
          paymentStatus: editedPaymentStatus,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.errorUpdate)
      }

      const result = await response.json()
      toast.success(t.admin.successUpdate)
      
      // Use result.data instead of result directly
      if (result.data) {
        setOrders(orders.map(o => o.id === selectedOrder.id ? result.data : o))
      }
      setSelectedOrder(null)
    } catch (error: unknown) {
      console.error("Error updating order:", error)
      toast.error(error instanceof Error ? error.message : t.admin.errorUpdate)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: t.admin.pending },
      PROCESSING: { variant: "default", label: t.admin.processing },
      SHIPPED: { variant: "default", label: t.admin.shipped },
      DELIVERED: { variant: "outline", label: t.admin.delivered },
      CANCELLED: { variant: "destructive", label: t.admin.cancelled },
    }
    const config = variants[status] || variants.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPaymentBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      PENDING: { variant: "secondary", label: t.admin.pending },
      PAID: { variant: "default", label: t.admin.paid },
      FAILED: { variant: "destructive", label: t.admin.failed },
      REFUNDED: { variant: "outline", label: "Remboursé" },
    }
    const config = variants[status] || variants.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
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
      <div>
        <h1 className="heading-responsive-h1 text-slate-900 dark:text-white">{t.admin.allOrders}</h1>
        <p className="text-responsive-sm text-muted-foreground">{t.common.total} : {total} {t.admin.orders.toLowerCase()}</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {selectedOrderIds.length > 0 ? `${selectedOrderIds.length} sélectionnée(s)` : ""}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={toggleSelectAll} disabled={filteredAndSortedOrders.length === 0}>
            Tout sélectionner
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleCancelOrders(selectedOrderIds)}
            disabled={selectedOrderIds.length === 0 || cancelling}
          >
            {cancelling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Annuler
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
        <div className="grid-responsive-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t.admin.searchOrders}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 sm:h-11"
            />
          </div>

          <Select value={filterStatus} onValueChange={(value) => { setPage(1); setFilterStatus(value) }}>
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder={t.admin.filterByStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.admin.allStatuses}</SelectItem>
              <SelectItem value="PENDING">{t.admin.pending}</SelectItem>
              <SelectItem value="PROCESSING">{t.admin.processing}</SelectItem>
              <SelectItem value="SHIPPED">{t.admin.shipped}</SelectItem>
              <SelectItem value="DELIVERED">{t.admin.delivered}</SelectItem>
              <SelectItem value="CANCELLED">{t.admin.cancelled}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-10 sm:h-11">
              <SelectValue placeholder={t.admin.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">{t.admin.dateNewest}</SelectItem>
              <SelectItem value="date-asc">{t.admin.dateOldest}</SelectItem>
              <SelectItem value="total-desc">{t.admin.totalHighLow}</SelectItem>
              <SelectItem value="total-asc">{t.admin.totalLowHigh}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300"> 
                  <input
                    type="checkbox"
                    checked={filteredAndSortedOrders.length > 0 && selectedOrderIds.length === filteredAndSortedOrders.length}
                    onChange={toggleSelectAll}
                    aria-label="select all"
                  />
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.orderNumber}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.customer}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.total}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.status}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.paymentStatus}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.orderDate}</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    {t.admin.noData}
                  </td>
                </tr>
              ) : (
                filteredAndSortedOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={index !== filteredAndSortedOrders.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => toggleSelection(order.id)}
                        aria-label={`select ${order.orderNumber}`}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-semibold">#{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{order.user?.name || "Client invité"}</p>
                        <p className="text-sm text-muted-foreground">{order.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.total)}</span>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6">
                      {getPaymentBadge(order.paymentStatus)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setEditedStatus(order.status)
                            setEditedPaymentStatus(order.paymentStatus)
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t.admin.view}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrders([order.id])}
                          disabled={cancelling || order.status === "CANCELLED"}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Annuler
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

      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          Page {page} / {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(limit)} onValueChange={(value) => { setPage(1); setLimit(parseInt(value, 10)) }}>
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>
            Précédent
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>
            Suivant
          </Button>
        </div>
      </div>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.admin.orderDetailsFor} - #{selectedOrder.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">{t.admin.customer}</Label>
                  <p className="text-lg">{selectedOrder.user?.name || "Client invité"}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user?.email || "-"}</p>
                  {selectedOrder.user?.phone && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.user.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">{t.admin.orderDate}</Label>
                  <p className="text-lg">{new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              {selectedOrder.paymentMethod && (
                <div>
                  <Label className="text-sm font-medium">{((t as any).admin?.paymentMethod as string) || "Mode de paiement"}</Label>
                  <p className="text-sm text-muted-foreground">{selectedOrder.paymentMethod}</p>
                </div>
              )}

              {selectedOrder.customerNotes && String(selectedOrder.customerNotes).trim() && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">{((t as any).admin?.customerNotes as string) || "Notes client"}</Label>
                  <div className="p-4 border rounded-lg bg-muted/30 whitespace-pre-wrap text-sm">
                    {String(selectedOrder.customerNotes)}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium mb-2 block">{t.admin.orderItems}</Label>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">{t.admin.quantity} : {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {(hasMeaningfulAddress(selectedOrder.billingAddress) || hasMeaningfulAddress(selectedOrder.shippingAddress)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">{((t as any).admin?.billingAddress as string) || "Adresse de facturation"}</Label>
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <p>{selectedOrder.billingAddress?.name || selectedOrder.user?.name || "-"}</p>
                      <p>{selectedOrder.billingAddress?.phone || selectedOrder.user?.phone || "-"}</p>
                      <p>{selectedOrder.billingAddress?.email || selectedOrder.user?.email || "-"}</p>
                      {selectedOrder.billingAddress?.company && <p>{selectedOrder.billingAddress.company}</p>}
                      <p>{selectedOrder.billingAddress?.address || selectedOrder.billingAddress?.street || "-"}</p>
                      <p>
                        {selectedOrder.billingAddress?.city || "-"}
                        {selectedOrder.billingAddress?.state ? `, ${selectedOrder.billingAddress.state}` : ""}
                      </p>
                      {selectedOrder.billingAddress?.district && <p>{selectedOrder.billingAddress.district}</p>}
                      <p>{selectedOrder.billingAddress?.country || "-"}</p>
                    </div>
                  </div>

                  {hasMeaningfulAddress(selectedOrder.shippingAddress) && (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">{t.admin.shippingAddress}</Label>
                      <div className="p-4 border rounded-lg bg-muted/30">
                        <p>{selectedOrder.shippingAddress?.name || selectedOrder.user?.name || "-"}</p>
                        <p>{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "-"}</p>
                        <p>{selectedOrder.shippingAddress?.email || selectedOrder.user?.email || "-"}</p>
                        <p>{selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street || "-"}</p>
                        <p>
                          {selectedOrder.shippingAddress?.city || "-"}
                          {selectedOrder.shippingAddress?.state ? `, ${selectedOrder.shippingAddress.state}` : ""}
                        </p>
                        {selectedOrder.shippingAddress?.district && <p>{selectedOrder.shippingAddress.district}</p>}
                        <p>{selectedOrder.shippingAddress?.country || "-"}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-semibold">{t.admin.totalAmount} :</span>
                <span className="text-2xl font-bold">{formatPrice(selectedOrder.total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">{t.common.status}</Label>
                  <Select value={editedStatus} onValueChange={(value) => setEditedStatus(value as OrderStatus)}>
                    <SelectTrigger id="order-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{t.admin.pending}</SelectItem>
                      <SelectItem value="PROCESSING">{t.admin.processing}</SelectItem>
                      <SelectItem value="SHIPPED">{t.admin.shipped}</SelectItem>
                      <SelectItem value="DELIVERED">{t.admin.delivered}</SelectItem>
                      <SelectItem value="CANCELLED">{t.admin.cancelled}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-status">{t.admin.paymentStatus}</Label>
                  <Select value={editedPaymentStatus} onValueChange={(value) => setEditedPaymentStatus(value as PaymentStatus)}>
                    <SelectTrigger id="payment-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{t.admin.pending}</SelectItem>
                      <SelectItem value="PAID">{t.admin.paid}</SelectItem>
                      <SelectItem value="FAILED">{t.admin.failed}</SelectItem>
                      <SelectItem value="REFUNDED">Remboursé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                {t.admin.close}
              </Button>
              <Button 
                onClick={handleUpdateStatus}
                className="bg-[#F97316] hover:bg-[#EA580C]"
                disabled={updatingStatus}
              >
                {updatingStatus && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t.admin.updateStatus}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


