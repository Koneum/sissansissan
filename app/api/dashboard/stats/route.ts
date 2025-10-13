import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get current date ranges
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    // 1. Total Revenue (all time)
    const totalRevenueResult = await prisma.order.aggregate({
      where: {
        status: {
          in: ["DELIVERED", "SHIPPED"]
        }
      },
      _sum: {
        total: true
      }
    })

    // Revenue this month
    const thisMonthRevenue = await prisma.order.aggregate({
      where: {
        status: {
          in: ["DELIVERED", "SHIPPED"]
        },
        createdAt: {
          gte: firstDayOfMonth
        }
      },
      _sum: {
        total: true
      }
    })

    // Revenue last month
    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        status: {
          in: ["DELIVERED", "SHIPPED"]
        },
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd
        }
      },
      _sum: {
        total: true
      }
    })

    const totalRevenue = totalRevenueResult._sum.total || 0
    const thisMonthRev = thisMonthRevenue._sum.total || 0
    const lastMonthRev = lastMonthRevenue._sum.total || 1 // Avoid division by 0
    const revenueChange = ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100

    // 2. Total Orders
    const totalOrders = await prisma.order.count()
    const thisMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    })
    const lastMonthOrders = await prisma.order.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd
        }
      }
    }) || 1
    const ordersChange = ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100

    // 3. Pending Orders
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING"
      }
    })
    const lastMonthPending = await prisma.order.count({
      where: {
        status: "PENDING",
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd
        }
      }
    }) || 1
    const pendingChange = ((pendingOrders - lastMonthPending) / lastMonthPending) * 100

    // 4. Total Customers
    const totalCustomers = await prisma.user.count()
    const thisMonthCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    })
    const lastMonthCustomers = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastMonth,
          lte: lastMonthEnd
        }
      }
    }) || 1
    const customersChange = ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100

    // 5. Recent Orders (last 5)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc"
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        items: {
          select: {
            id: true
          }
        }
      }
    })

    // 6. Best Selling Products (by revenue)
    const bestSelling = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        price: true,
        quantity: true
      },
      orderBy: {
        _sum: {
          price: "desc"
        }
      },
      take: 4
    })

    // Get product details for best selling
    const productIds = bestSelling.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    })

    const bestSellingProducts = bestSelling.map((item, index) => {
      const product = products.find(p => p.id === item.productId)
      const totalRevenue = item._sum.price || 0
      const totalUnits = item._sum.quantity || 0
      
      return {
        name: product?.category?.name || product?.name || "Unknown",
        value: totalRevenue,
        units: totalUnits,
        percentage: 0 // Will calculate after
      }
    })

    // Calculate percentages
    const totalBestSellingRevenue = bestSellingProducts.reduce((sum, p) => sum + p.value, 0)
    bestSellingProducts.forEach(product => {
      product.percentage = totalBestSellingRevenue > 0 
        ? Math.round((product.value / totalBestSellingRevenue) * 100)
        : 0
    })

    // 7. Monthly Analytics (last 12 months)
    const monthlyRevenue = []
    const monthlyOrders = []
    const monthlyCustomers = []
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = monthStart.toLocaleString('en-US', { month: 'short' })
      
      // Revenue
      const monthRevenueData = await prisma.order.aggregate({
        where: {
          status: {
            in: ["DELIVERED", "SHIPPED"]
          },
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: {
          total: true
        }
      })

      monthlyRevenue.push({
        month: monthName,
        value: monthRevenueData._sum.total || 0
      })

      // Orders
      const monthOrdersCount = await prisma.order.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      monthlyOrders.push({
        month: monthName,
        value: monthOrdersCount
      })

      // Customers
      const monthCustomersCount = await prisma.user.count({
        where: {
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })

      monthlyCustomers.push({
        month: monthName,
        value: monthCustomersCount
      })
    }

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

