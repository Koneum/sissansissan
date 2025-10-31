import { NextRequest, NextResponse } from "next/server"
import { translateText, translateContent } from "@/lib/translation-service"

// POST /api/translate - Traduit un texte ou un objet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, content, targetLang, sourceLang } = body

    // Validation
    if (!targetLang) {
      return NextResponse.json(
        { success: false, error: "Target language is required" },
        { status: 400 }
      )
    }

    let result

    if (text) {
      // Traduction simple d'un texte
      result = await translateText(text, targetLang, sourceLang)
    } else if (content) {
      // Traduction d'un objet complet
      result = await translateContent(content)
    } else {
      return NextResponse.json(
        { success: false, error: "Either 'text' or 'content' is required" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Translation API error:", error)
    return NextResponse.json(
      { success: false, error: "Translation failed" },
      { status: 500 }
    )
  }
}




