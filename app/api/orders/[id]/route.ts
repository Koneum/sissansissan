import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                discountPrice: true
              }
            }
          }
        },
        coupon: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PATCH /api/orders/[id] - Update order (status, tracking, etc.)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (body.status) {
      updateData.status = body.status
      
      // Update timestamps based on status
      if (body.status === "SHIPPED" && !order.shippedAt) {
        updateData.shippedAt = new Date()
      } else if (body.status === "DELIVERED" && !order.deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    if (body.paymentStatus) {
      updateData.paymentStatus = body.paymentStatus
    }

    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber
    }

    if (body.adminNotes !== undefined) {
      updateData.adminNotes = body.adminNotes
    }

    if (body.paymentId !== undefined) {
      updateData.paymentId = body.paymentId
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order updated successfully"
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] - Cancel order
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Only allow cancellation of pending/processing orders
    if (!["PENDING", "PROCESSING"].includes(order.status)) {
      return NextResponse.json(
        { success: false, error: "Cannot cancel order in current status" },
        { status: 400 }
      )
    }

    // Cancel order and restore stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus: order.paymentStatus === "PAID" ? "REFUNDED" : "FAILED"
        }
      })

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        })
      }

      // Restore coupon usage if applicable
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: {
              decrement: 1
            }
          }
        })
      }
    })

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully"
    })
  } catch (error) {
    console.error("Error cancelling order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    )
  }
}

