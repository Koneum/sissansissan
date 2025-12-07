import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Get current session to verify admin access
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']
        }
      },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current session to verify admin access
    const session = await auth.api.getSession({ headers: request.headers })
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, role, permissions } = body

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }

    // Create user using Better Auth sign-up
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      }
    })

    if (!signUpResult) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      )
    }

    // Update user role
    const user = await prisma.user.update({
      where: { email },
      data: { role }
    })

    // Create permissions if provided
    if (permissions && permissions.length > 0) {
      await prisma.userPermission.createMany({
        data: permissions.map((perm: any) => ({
          userId: user.id,
          permissionId: perm.permissionId,
          canView: perm.canView || false,
          canCreate: perm.canCreate || false,
          canEdit: perm.canEdit || false,
          canDelete: perm.canDelete || false,
        }))
      })
    }

    // Fetch complete user with permissions
    const completeUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    return NextResponse.json(completeUser, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    )
  }
}

