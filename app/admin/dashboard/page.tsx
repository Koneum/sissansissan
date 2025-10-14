"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Clock, Truck, CheckCircle2, TrendingUp, DollarSign, ShoppingCart, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"
import { formatPrice } from "@/lib/currency"
import Link from "next/link"

interface DashboardStats {
  totalRevenue: { value: number; change: string; trend: "up" | "down" }
  totalOrders: { value: number; change: string; trend: "up" | "down" }
  pendingOrders: { value: number; change: string; trend: "up" | "down" }
  totalCustomers: { value: number; change: string; trend: "up" | "down" }
}

interface RecentOrder {
  id: string
  customer: string
  email: string
  date: string
  status: string
  total: number
  items: number
}

interface BestSellingProduct {
  name: string
  value: number
  units: number
  percentage: number
}

interface MonthlyData {
  month: string
  value: number
}

interface MonthlyAnalytics {
  revenue: MonthlyData[]
  orders: MonthlyData[]
  customers: MonthlyData[]
}

interface DashboardData {
  stats: DashboardStats
  recentOrders: RecentOrder[]
  bestSellingProducts: BestSellingProduct[]
  monthlyAnalytics: MonthlyAnalytics
}

export default function AdminDashboard() {
  const { t } = useLocale()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<"revenue" | "orders" | "customers">("revenue")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/dashboard/stats")
      if (!response.ok) throw new Error("Failed to fetch dashboard data")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Error fetching dashboard:", error)
      toast.error(t.admin.errorCreate)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 dark:text-blue-400 mx-auto" />
          <p className="text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{t.admin.noData}</p>
          <Button onClick={fetchDashboardData}>{t.admin.refresh}</Button>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: t.admin.totalRevenue,
      value: formatPrice(data.stats.totalRevenue.value),
      change: `${data.stats.totalRevenue.change}%`,
      trend: data.stats.totalRevenue.trend,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500"
    },
    {
      title: t.admin.totalOrders,
      value: data.stats.totalOrders.value.toLocaleString(),
      change: `${data.stats.totalOrders.change}%`,
      trend: data.stats.totalOrders.trend,
      icon: ShoppingCart,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      title: t.admin.pending,
      value: data.stats.pendingOrders.value.toString(),
      change: `${data.stats.pendingOrders.change}%`,
      trend: data.stats.pendingOrders.trend,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-500"
    },
    {
      title: t.admin.totalCustomers,
      value: data.stats.totalCustomers.value.toLocaleString(),
      change: `${data.stats.totalCustomers.change}%`,
      trend: data.stats.totalCustomers.trend,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500"
    },
  ]

  // Get current analytics data based on active tab
  const currentAnalyticsData = data.monthlyAnalytics[activeTab]
  const maxValue = Math.max(...currentAnalyticsData.map(d => d.value), 1)
  
  // Get tab-specific labels
  const tabLabels = {
    revenue: { title: t.admin.monthlyRevenue, description: t.admin.salesOverview },
    orders: { title: t.admin.monthlyOrders, description: t.admin.salesOverview },
    customers: { title: t.admin.monthlyCustomers, description: t.admin.salesOverview }
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
      PROCESSING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
      SHIPPED: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
      DELIVERED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
      CANCELLED: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
    }
    return statusMap[status] || "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
  }

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      PENDING: t.admin.pending,
      PROCESSING: t.admin.processing,
      SHIPPED: t.admin.shipped,
      DELIVERED: t.admin.delivered,
      CANCELLED: t.admin.cancelled
    }
    return statusLabels[status] || status
  }

  const productColors = [
    "bg-blue-500",
    "bg-cyan-500",
    "bg-indigo-500",
    "bg-purple-500"
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-4 sm:pb-6 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{t.admin.dashboard}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">{t.admin.salesOverview}</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-700 text-xs sm:text-sm" onClick={fetchDashboardData}>
            {t.admin.refresh}
          </Button>
          <Link href="/admin/orders">
            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">{t.admin.viewOrders}</span>
              <span className="xs:hidden">Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title} 
              className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-900/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 group"
            >
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start justify-between mb-2 sm:mb-3 md:mb-4">
                  <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${stat.iconColor}`} />
                  </div>
                  <span className={`text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    stat.trend === 'up' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                      : 'bg-red-500/10 text-red-600 dark:text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white truncate">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Monthly Analytics */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-white">{tabLabels[activeTab].title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">{tabLabels[activeTab].description}</p>
              </div>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "revenue" | "orders" | "customers")} className="w-full sm:w-auto">
                <TabsList className="bg-slate-100 dark:bg-slate-800/50 w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
                  <TabsTrigger value="revenue" className="text-xs sm:text-sm">{t.admin.monthlyRevenue}</TabsTrigger>
                  <TabsTrigger value="orders" className="text-xs sm:text-sm">{t.admin.orders}</TabsTrigger>
                  <TabsTrigger value="customers" className="text-xs sm:text-sm">{t.admin.customers}</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6">
            <div className="h-[200px] sm:h-[280px] md:h-[320px] flex items-end justify-between gap-1 sm:gap-2 md:gap-3 px-1 sm:px-2">
              {currentAnalyticsData.map((monthData, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-600 dark:to-blue-500 rounded-t-md sm:rounded-t-lg transition-all duration-500 hover:from-blue-500 hover:to-blue-400 dark:hover:from-blue-500 dark:hover:to-blue-400 cursor-pointer relative overflow-hidden group-hover:shadow-lg group-hover:shadow-blue-500/50"
                      style={{ height: `${(monthData.value / maxValue) * (window.innerWidth < 640 ? 180 : window.innerWidth < 768 ? 240 : 280)}px`, minHeight: '3px' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                    </div>
                    <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-slate-700 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {activeTab === "revenue" ? formatPrice(monthData.value) : monthData.value}
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-500 font-medium">{monthData.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 md:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-white">{t.admin.topProducts}</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">{t.admin.thisMonth}</p>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-4 md:p-6">
            <div className="space-y-4 sm:space-y-6">
              {data.bestSellingProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">{t.admin.noData}</p>
              ) : (
                data.bestSellingProducts.map((product, index) => (
                  <div key={index} className="space-y-2 group">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                        <span className="text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">#{index + 1}</span>
                        <span className="font-medium text-slate-900 dark:text-white truncate">{product.name}</span>
                      </div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400 ml-2 flex-shrink-0 text-xs sm:text-sm">{formatPrice(product.value)}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex-1 h-1.5 sm:h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${productColors[index % productColors.length]} rounded-full transition-all duration-700`}
                          style={{ width: `${product.percentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-500 font-medium w-8 sm:w-12 text-right flex-shrink-0">{product.percentage}%</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-500">{product.units} {t.common.sold}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-white">{t.admin.recentOrders}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.admin.orderDetails}</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 text-xs sm:text-sm">
                {t.admin.allOrders} →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.admin.orderNumber}</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.admin.customer}</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.admin.orderDate}</th>
                  <th className="text-left py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.common.status}</th>
                  <th className="text-center py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.common.items}</th>
                  <th className="text-right py-3 px-3 sm:py-4 sm:px-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">{t.common.total}</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 sm:py-8 text-center text-muted-foreground text-sm">
                      {t.admin.noData}
                    </td>
                  </tr>
                ) : (
                  data.recentOrders.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className={`border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${
                        index === data.recentOrders.length - 1 ? 'border-0' : ''
                      }`}
                    >
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">#{order.id}</span>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">{order.customer}</p>
                          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-500 truncate max-w-[120px] sm:max-w-none">{order.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{order.date}</span>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <span className={`inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-center">
                        <span className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">{order.items}</span>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-right">
                        <span className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">{formatPrice(order.total)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Link href="/admin/products/add">
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/30 dark:to-blue-950/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{t.admin.addProduct}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{t.admin.productDetails}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/customers">
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/30 dark:to-purple-950/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{t.admin.customers}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{t.admin.allCustomers}</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/orders">
          <Card className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/30 dark:to-emerald-950/30 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{t.admin.salesOverview}</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 truncate">{t.admin.monthlyRevenue}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
