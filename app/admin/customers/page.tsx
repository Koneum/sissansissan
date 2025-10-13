"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Eye, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: "USER" | "ADMIN"
  createdAt: string
  _count: {
    orders: number
  }
}

const ITEMS_PER_PAGE = 10

export default function CustomersPage() {
  const { t } = useLocale()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("name-asc")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      const data = await response.json()
      setCustomers(data.customers || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast.error(t.admin.errorCreate)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSortedCustomers = useMemo(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "orders-desc":
          return b._count.orders - a._count.orders
        case "orders-asc":
          return a._count.orders - b._count.orders
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [customers, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredAndSortedCustomers.length / ITEMS_PER_PAGE)
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.admin.allCustomers}</h1>
        <p className="text-sm text-muted-foreground">{t.common.total}: {customers.length} {t.admin.customers.toLowerCase()}</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={t.admin.searchByName}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-9 h-11"
            />
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={t.admin.sortBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">{t.admin.nameAZ}</SelectItem>
              <SelectItem value="name-desc">{t.admin.nameZA}</SelectItem>
              <SelectItem value="orders-desc">{t.admin.ordersHighLow}</SelectItem>
              <SelectItem value="orders-asc">{t.admin.ordersLowHigh}</SelectItem>
              <SelectItem value="date-desc">{t.admin.dateNewest}</SelectItem>
              <SelectItem value="date-asc">{t.admin.dateOldest}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.name}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.email}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.phone}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.role}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.ordersCount}</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.admin.joined}</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700 dark:text-slate-300">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t.admin.noData}
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer, index) => (
                  <tr
                    key={customer.id}
                    className={index !== paginatedCustomers.length - 1 ? "border-b border-slate-200 dark:border-slate-800" : ""}
                  >
                    <td className="py-4 px-6">
                      <span className="font-medium text-slate-900 dark:text-white">{customer.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">{customer.email}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">{customer.phone || "-"}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={customer.role === "ADMIN" ? "default" : "secondary"}>
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="outline">{customer._count.orders} {t.admin.orders.toLowerCase()}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t.admin.view}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {t.admin.showing} {(currentPage - 1) * ITEMS_PER_PAGE + 1} {t.admin.to}{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedCustomers.length)} {t.admin.of}{" "}
              {filteredAndSortedCustomers.length} {t.admin.customers.toLowerCase()}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {t.admin.previous}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t.admin.next}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.admin.customerDetails}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.name}</p>
                  <p className="text-lg font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.email}</p>
                  <p className="text-lg">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.phone}</p>
                  <p className="text-lg">{selectedCustomer.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.role}</p>
                  <Badge variant={selectedCustomer.role === "ADMIN" ? "default" : "secondary"}>
                    {selectedCustomer.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.totalOrders}</p>
                  <p className="text-lg font-semibold">{selectedCustomer._count.orders}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.admin.joined}</p>
                  <p className="text-lg">{new Date(selectedCustomer.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
