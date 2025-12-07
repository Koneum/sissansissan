import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Default terms content (markdown format)
const defaultTermsContent = `# Conditions Générales de Vente

## Préambule

Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les ventes de produits effectuées par Sissan-Sissan au travers de son site Internet.

## Article 1 : Objet

Les présentes Conditions Générales de Vente déterminent les droits et obligations des parties dans le cadre de la vente en ligne de produits proposés par Sissan-Sissan.

## Article 2 : Prix

Les prix des produits sont indiqués en Francs CFA (XOF) toutes taxes comprises.

## Article 3 : Commande

La confirmation de la commande emporte formation du contrat.

## Article 4 : Livraison

Les produits sont livrés à l'adresse indiquée par le Client lors de la commande.

## Article 5 : Droit de rétractation

L'Acheteur dispose d'un délai de quatorze (14) jours pour exercer son droit de rétractation.`;

export async function GET() {
  try {
    // Try to get from siteSettings with key "pages"
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "pages" }
    });
    
    if (setting?.value) {
      try {
        const pagesData = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
        if (pagesData.termsConditions) {
          return NextResponse.json({
            success: true,
            data: {
              content: pagesData.termsConditions,
              lastUpdated: setting.updatedAt || new Date()
            }
          });
        }
      } catch (e) {
        console.error("Error parsing pages data:", e);
      }
    }
    
    // Return default content
    return NextResponse.json({
      success: true,
      data: {
        content: defaultTermsContent,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("Error fetching terms:", error);
    return NextResponse.json({
      success: true,
      data: {
        content: defaultTermsContent,
        lastUpdated: new Date()
      }
    });
  }
}
