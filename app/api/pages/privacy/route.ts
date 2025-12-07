import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Default privacy content (markdown format)
const defaultPrivacyContent = `# Politique de Confidentialité

## Introduction

Chez Sissan-Sissan, nous accordons une grande importance à la protection de vos données personnelles.

## Données collectées

Nous collectons les données suivantes :
- Prénom et nom de famille
- Adresse e-mail
- Numéro de téléphone
- Adresse de livraison

## Utilisation des données

Vos données sont utilisées pour :
- Traiter vos commandes
- Vous contacter concernant vos commandes
- Améliorer nos services

## Vos droits

Vous avez le droit de :
- Recevoir une copie de vos données personnelles
- Corriger des données personnelles inexactes
- Nous demander de supprimer les données vous concernant

## Contact

Pour toute question, veuillez nous contacter via notre page de contact.`;

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
        if (pagesData.privacyPolicy) {
          return NextResponse.json({
            success: true,
            data: {
              content: pagesData.privacyPolicy,
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
        content: defaultPrivacyContent,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error("Error fetching privacy:", error);
    return NextResponse.json({
      success: true,
      data: {
        content: defaultPrivacyContent,
        lastUpdated: new Date()
      }
    });
  }
}
