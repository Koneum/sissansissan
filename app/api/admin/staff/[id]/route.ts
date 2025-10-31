import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // Get current session to verify access
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Fetch user with permissions
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // Get current session to verify admin access
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { name, email, password, role, permissions } = body

    // Update user basic info
    const updateData: any = {
      name,
      email,
      role,
    }

    // Only update password if provided
    if (password && password.length > 0) {
      // Note: Better Auth handles password hashing
      // We'll need to update via Better Auth API if password changes
      updateData.password = password
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Update permissions
    if (permissions) {
      // Delete existing permissions
      await prisma.userPermission.deleteMany({
        where: { userId: id }
      })

      // Create new permissions
      if (permissions.length > 0) {
        await prisma.userPermission.createMany({
          data: permissions.map((perm: any) => ({
            userId: id,
            permissionId: perm.permissionId,
            canView: perm.canView || false,
            canCreate: perm.canCreate || false,
            canEdit: perm.canEdit || false,
            canDelete: perm.canDelete || false,
          }))
        })
      }
    }

    // Fetch complete user with permissions
    const completeUser = await prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(completeUser)
  } catch (error) {
    console.error("Error updating staff:", error)
    return NextResponse.json(
      { error: "Failed to update staff member" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Get current session to verify admin access
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await context.params

    // Delete user (permissions will be cascade deleted)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json(
      { error: "Failed to delete staff member" },
      { status: 500 }
    )
  }
}
