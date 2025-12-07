import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type - accepter tous les types d'images
    const allowedTypes = [
      "image/jpeg", 
      "image/jpg", 
      "image/png", 
      "image/webp", 
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/tiff",
      "image/avif",
      "image/heic",
      "image/heif"
    ]
    
    // Extraire l'extension du fichier
    const fileExtension = file.name.toLowerCase().split('.').pop()
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'tiff', 'tif', 'avif', 'heic', 'heif']
    
    // Déterminer le type MIME (iOS Photos peut envoyer un type vide)
    let mimeType = file.type
    
    // Si pas de type MIME ou type générique, détecter depuis l'extension
    if (!mimeType || mimeType === '' || mimeType === 'application/octet-stream') {
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp',
        'svg': 'image/svg+xml',
        'tiff': 'image/tiff',
        'tif': 'image/tiff',
        'avif': 'image/avif',
        'heic': 'image/heic',
        'heif': 'image/heif'
      }
      mimeType = mimeTypes[fileExtension || ''] || 'image/jpeg' // Défaut: JPEG
    }
    
    // Validation plus permissive pour iOS
    const isValidExtension = validExtensions.includes(fileExtension || '')
    const isValidMimeType = allowedTypes.includes(mimeType)
    
    // Accepter si l'extension OU le type MIME est valide
    if (!isValidExtension && !isValidMimeType) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed" },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      )
    }

    // Read file data
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s/g, "-")
    const filename = `${timestamp}-${originalName}`

    // Sauvegarder l'image dans PostgreSQL
    const image = await prisma.image.create({
      data: {
        filename: filename,
        mimeType: mimeType,
        size: file.size,
        data: buffer,
      },
    })

    // Return the image ID as URL
    const imageUrl = `/api/images/${image.id}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
      id: image.id,
      filename: filename
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}


