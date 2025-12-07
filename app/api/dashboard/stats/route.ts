import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get current date ranges
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // Prepare all monthly data queries (parallel)
    const monthlyQueries = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      monthlyQueries.push({
        monthStart,
        monthEnd,
        monthName: monthStart.toLocaleString('en-US', { month: 'short' })
      })
    }

    // Execute all basic stats queries in parallel
    const [
      totalRevenueResult,
      thisMonthRevenue,
      lastMonthRevenue,
      totalOrders,
      thisMonthOrders,
      lastMonthOrders,
      pendingOrders,
      lastMonthPending,
      totalCustomers,
      thisMonthCustomers,
      lastMonthCustomers,
      recentOrders,
      bestSelling,
      // Monthly data (parallel)
      ...monthlyDataResults
    ] = await Promise.all([
      // Revenue queries
      prisma.order.aggregate({
        where: { status: { in: ["DELIVERED", "SHIPPED"] } },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["DELIVERED", "SHIPPED"] },
          createdAt: { gte: firstDayOfMonth }
        },
        _sum: { total: true }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ["DELIVERED", "SHIPPED"] },
          createdAt: { gte: lastMonth, lte: lastMonthEnd }
        },
        _sum: { total: true }
      }),

      // Order queries
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      prisma.order.count({
        where: { createdAt: { gte: lastMonth, lte: lastMonthEnd } }
      }),

      // Pending orders
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({
        where: {
          status: "PENDING",
          createdAt: { gte: lastMonth, lte: lastMonthEnd }
        }
      }),

      // Customer queries
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
      prisma.user.count({
        where: { createdAt: { gte: lastMonth, lte: lastMonthEnd } }
      }),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { id: true } }
        }
      }),

      // Best selling products
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { price: true, quantity: true },
        orderBy: { _sum: { price: "desc" } },
        take: 4
      }),

      // Monthly analytics (parallel queries for all months)
      ...monthlyQueries.map(({ monthStart, monthEnd }) =>
        Promise.all([
          // Revenue
          prisma.order.aggregate({
            where: {
              status: { in: ["DELIVERED", "SHIPPED"] },
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { total: true }
          }),
          // Orders
          prisma.order.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } }
          }),
          // Customers
          prisma.user.count({
            where: { createdAt: { gte: monthStart, lte: monthEnd } }
          })
        ])
      )
    ])

    // Process results
    const totalRevenue = totalRevenueResult._sum.total || 0
    const thisMonthRev = thisMonthRevenue._sum.total || 0
    const lastMonthRev = lastMonthRevenue._sum.total || 1
    const revenueChange = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100

    const ordersChange = ((thisMonthOrders - (lastMonthOrders || 1)) / (lastMonthOrders || 1)) * 100
    const pendingChange = ((pendingOrders - (lastMonthPending || 1)) / (lastMonthPending || 1)) * 100
    const customersChange = ((thisMonthCustomers - (lastMonthCustomers || 1)) / (lastMonthCustomers || 1)) * 100

    // Get product details for best selling
    const productIds = bestSelling.map(item => item.productId)
    const products = productIds.length > 0 ? await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { category: { select: { name: true } } }
    }) : []

    const bestSellingProducts = bestSelling.map((item) => {
      const product = products.find(p => p.id === item.productId)
      const totalRevenue = item._sum.price || 0
      const totalUnits = item._sum.quantity || 0

      return {
        name: product?.category?.name || product?.name || "Unknown",
        value: totalRevenue,
        units: totalUnits,
        percentage: 0
      }
    })

    // Calculate percentages
    const totalBestSellingRevenue = bestSellingProducts.reduce((sum, p) => sum + p.value, 0)
    bestSellingProducts.forEach(product => {
      product.percentage = totalBestSellingRevenue > 0
        ? Math.round((product.value / totalBestSellingRevenue) * 100)
        : 0
    })

    // Process monthly data
    const monthlyRevenue: Array<{ month: string; value: number }> = []
    const monthlyOrders: Array<{ month: string; value: number }> = []
    const monthlyCustomers: Array<{ month: string; value: number }> = []

    monthlyQueries.forEach(({ monthName }, index) => {
      const [revenueData, ordersCount, customersCount] = monthlyDataResults[index]
      monthlyRevenue.push({ month: monthName, value: revenueData._sum.total || 0 })
      monthlyOrders.push({ month: monthName, value: ordersCount })
      monthlyCustomers.push({ month: monthName, value: customersCount })
    })

    return NextResponse.json({
      stats: {
        totalRevenue: {
          value: totalRevenue,
          change: revenueChange.toFixed(1),
          trend: revenueChange >= 0 ? "up" : "down"
        },
        totalOrders: {
          value: totalOrders,
          change: ordersChange.toFixed(1),
          trend: ordersChange >= 0 ? "up" : "down"
        },
        pendingOrders: {
          value: pendingOrders,
          change: pendingChange.toFixed(1),
          trend: pendingChange >= 0 ? "up" : "down"
        },
        totalCustomers: {
          value: totalCustomers,
          change: customersChange.toFixed(1),
          trend: customersChange >= 0 ? "up" : "down"
        }
      },
      recentOrders: recentOrders.map(order => ({
        id: order.orderNumber,
        customer: order.user.name,
        email: order.user.email,
        date: order.createdAt.toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          year: 'numeric' 
        }),
        status: order.status,
        total: order.total,
        items: order.items.length
      })),
      bestSellingProducts,
      monthlyAnalytics: {
        revenue: monthlyRevenue,
        orders: monthlyOrders,
        customers: monthlyCustomers
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    )
  }
}


