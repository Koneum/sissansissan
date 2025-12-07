"use client"

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface PagesData {
  privacyPolicy: string
  termsConditions: string
}

const defaultPagesData: PagesData = {
  privacyPolicy: `# Politique de Confidentialité

## Introduction

Chez Sissan-Sissan, nous savons que vous prenez soin de votre vie privée. Et comme cela nous concerne également, nous avons adopté les pratiques décrites dans cette Politique de confidentialité. Vous ne devriez pas accéder à ce Site ni utiliser nos services avant d'avoir lu attentivement la présente Politique de confidentialité et avoir accepté les conditions d'utilisation qu'elle décrit.

Nous ne collectons uniquement que les informations personnelles identifiables décrites dans cette Politique et avec votre consentement.

## Comment nous recueillons et utilisons vos informations personnelles

Nous recueillons et utilisons certaines informations vous concernant qui, selon nous, peuvent nous aider raisonnablement à gérer notre activité ou vous fournir des produits, services et autres opportunités. Cela inclut des informations sur votre utilisation de notre Site Web, des informations que vous nous avez fournies (telles que votre nom, vos coordonnées et votre adresse e-mail).

### 1. Informations sur l'utilisation du Site

Vous pouvez visiter le Site Web sans nous dire qui vous êtes ni révéler la moindre information vous concernant. Nos serveurs Web peuvent recueillir les noms de domaine des visiteurs. Ces informations sont agrégées pour mesurer le nombre de visites, le temps moyen passé sur le Site et les pages consultées.

### 2. Les informations que vous nous fournissez

Lorsque vous créez un compte, passez une commande, ou nous contactez, nous pouvons recueillir les informations suivantes :

- Prénom et nom de famille
- Adresse e-mail
- Numéro de téléphone
- Adresse de livraison et de facturation (rue, ville, code postal, pays)
- Informations de paiement (traitées de manière sécurisée)
- Messages et demandes de contact

### 3. Données de session

Pour des raisons de sécurité et d'amélioration de l'expérience utilisateur, nous collectons :

- Adresse IP
- Informations sur l'appareil (navigateur, système d'exploitation)
- Horodatage de connexion

## Utilisation de vos informations

Nous utilisons vos informations personnelles pour :

- Traiter vos commandes et gérer votre compte
- Communiquer avec vous concernant vos commandes ou demandes
- Vous fournir un service client de qualité
- Améliorer nos produits et services
- Assurer la sécurité de votre compte

## Conservation de vos données

Nous conservons vos informations personnellement identifiables que le temps nécessaire aux fins pour lesquelles elles ont été recueillies et traitées, conformément aux obligations légales applicables.

## Confidentialité des enfants

Au vu de la nature de notre activité, nos produits et services ne sont pas prévus pour attirer les mineurs. Seules les personnes de 18 ans ou plus peuvent créer un compte et effectuer des achats sur notre Site.

## Restriction sur la divulgation d'informations à des tiers

Nous ne vendons ni ne louons à des tiers vos informations personnellement identifiables. Nous révélons à des tiers des informations personnellement identifiables vous concernant si et seulement si :

- Vous le demandez ou l'autorisez
- L'information est fournie afin de vous aider à effectuer une transaction
- L'information est fournie pour se conformer aux lois et règlements applicables
- La divulgation se fait dans le cadre d'un transfert d'activité
- L'information est fournie à nos prestataires pour effectuer des actions en notre nom

## Procédures de sécurité pour la protection des informations

Nous avons mis en place diverses normes et procédures de sécurité afin de lutter contre l'accès non autorisé à vos données confidentielles. Notre Site utilise une combinaison de technologie de chiffrement et d'authentification afin d'assurer la protection de vos informations personnellement identifiables.

Il est important pour vous de nous aider à vous protéger contre une utilisation non autorisée en vous déconnectant de notre Site chaque fois que vous avez fini de l'utiliser.

## Sites tiers

Le Site peut contenir des liens vers d'autres sites. Cette Politique de confidentialité ne concerne que l'utilisation et la divulgation par Sissan-Sissan de vos informations personnelles identifiables recueillies sur notre Site. Nous ne sommes pas responsables des pratiques de confidentialité de sites tiers.

## Modifications de notre Politique de confidentialité

Nous avons la possibilité de mettre à jour cette Politique périodiquement. Vous trouverez sur cette page toutes les mises à jour et modifications apportées. Nous vous encourageons à visiter régulièrement notre Site pour consulter la Politique de confidentialité actuelle.

## Vos droits

Vous avez le droit de :

- Recevoir une copie de vos données personnelles
- Corriger des données personnelles inexactes
- Nous demander de supprimer les données vous concernant
- Retirer votre consentement au recueillement de vos informations

## Nous contacter

Pour toute question concernant cette Politique de confidentialité ou pour exercer vos droits, veuillez nous contacter via notre page de contact ou par e-mail.`,
  termsConditions: `# Conditions Générales de Vente

## Préambule

Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les ventes de produits effectuées par Sissan-Sissan au travers de son site Internet. Elles régissent les relations contractuelles entre Sissan-Sissan et l'Acheteur.

En passant commande sur notre site, le Client déclare avoir pris connaissance des présentes CGV et les accepter sans restriction ni réserve.

## Article 1 : Objet

Les présentes Conditions Générales de Vente déterminent les droits et obligations des parties dans le cadre de la vente en ligne de produits proposés par Sissan-Sissan.

## Article 2 : Dispositions générales

Les présentes CGV sont partie intégrante du contrat entre l'Acheteur et le Vendeur. Elles sont pleinement opposables à l'Acheteur qui les a acceptées avant de passer commande.

Le Vendeur se réserve la possibilité de modifier les présentes à tout moment. Les CGV applicables sont celles en vigueur à la date du paiement de la commande.

Le Client déclare être en mesure de contracter légalement en vertu des lois françaises. Seules les personnes de 18 ans ou plus peuvent effectuer des achats sur ce site.

## Article 3 : Prix

Les prix des produits sont indiqués en Francs CFA (XOF) toutes taxes comprises. Les frais de livraison sont indiqués lors du processus de commande avant la validation finale.

Le Vendeur se réserve la possibilité de modifier ses prix à tout moment, tout en garantissant l'application du prix indiqué au moment de la commande.

## Article 4 : Commande

Pour passer commande, le Client doit suivre les étapes suivantes :

- Sélection des produits et ajout au panier
- Vérification du panier et des quantités
- Identification ou création de compte
- Choix de l'adresse de livraison
- Choix du mode de paiement
- Vérification et validation de la commande

La confirmation de la commande emporte formation du contrat. Le Client recevra une confirmation par courrier électronique.

## Article 5 : Produits

Les caractéristiques essentielles des produits sont présentées sur les fiches produits du site. Les photographies des produits sont les plus fidèles possibles mais ne peuvent assurer une similitude parfaite avec le produit offert.

Le Vendeur s'engage à honorer la commande dans la limite des stocks disponibles. En cas d'indisponibilité, le Client en sera informé et pourra demander le remboursement ou un avoir.

## Article 6 : Paiement

Le paiement est exigible immédiatement à la commande. Le Client peut effectuer le règlement par les moyens de paiement proposés sur le site (carte bancaire, mobile money, etc.).

En communiquant ses informations de paiement, le Client autorise le Vendeur à débiter le montant correspondant à sa commande.

## Article 7 : Livraison

Les produits sont livrés à l'adresse indiquée par le Client lors de la commande dans les délais mentionnés sur le site.

En cas de retard de livraison supérieur à 30 jours, le Client dispose de la possibilité de résoudre le contrat et d'obtenir le remboursement des sommes versées.

Les risques liés au transport sont transférés au Client dès la remise du produit au transporteur. Le Client doit vérifier l'état des produits à la réception et signaler toute anomalie.

## Article 8 : Droit de rétractation

Conformément aux dispositions légales, l'Acheteur dispose d'un délai de quatorze (14) jours à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motifs.

Pour exercer ce droit, le Client doit nous contacter via la page de contact du site ou par email.

Les produits doivent être retournés dans leur état d'origine et complets. Les frais de retour sont à la charge du Client. Le remboursement sera effectué dans un délai de 14 jours suivant la réception des produits retournés.

**Exceptions au droit de rétractation :**
- Produits personnalisés ou confectionnés selon les spécifications du Client
- Produits périssables ou susceptibles de se détériorer rapidement
- Produits descellés ne pouvant être renvoyés pour des raisons d'hygiène

## Article 9 : Garanties

Conformément à la loi, le Vendeur est tenu de la garantie légale de conformité et de la garantie des vices cachés.

Le Client dispose d'un délai de 2 ans à compter de la délivrance du bien pour agir en garantie de conformité. En cas de défaut de conformité, le Client peut choisir entre la réparation ou le remplacement du produit.

Pour toute réclamation, le Client peut contacter le service client via la page de contact.

## Article 10 : Responsabilité

Le Vendeur ne saurait être tenu responsable de l'inexécution du contrat en cas de force majeure, de perturbation ou grève des services postaux ou transporteurs.

Les produits proposés sont conformes à la législation en vigueur. La responsabilité du Vendeur ne saurait être engagée en cas de non-respect de la législation du pays de livraison.

## Article 11 : Propriété intellectuelle

L'ensemble des éléments du site (textes, images, logos, etc.) sont protégés par les droits de propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation préalable.

## Article 12 : Protection des données personnelles

Les données personnelles collectées sont traitées conformément à notre Politique de Confidentialité accessible sur le site. Le Client dispose de droits d'accès, de rectification et de suppression de ses données.

## Article 13 : Service client

Pour toute question ou réclamation, le Client peut contacter le service client :
- Via le formulaire de contact sur le site
- Par email à l'adresse indiquée dans le pied de page

## Article 14 : Droit applicable et litiges

Les présentes CGV sont soumises au droit applicable dans le pays d'opération de Sissan-Sissan.

En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut d'accord, les tribunaux compétents seront saisis.

## Article 15 : Modification des CGV

Le Vendeur se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur au moment de la commande.`
}

interface PagesContextType {
  pagesData: PagesData
  updatePagesData: (data: PagesData) => void
}

const PagesContext = createContext<PagesContextType | undefined>(undefined)

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pagesData, setPagesData] = useState<PagesData>(defaultPagesData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPagesData()
  }, [])

  const fetchPagesData = async () => {
    try {
      const response = await fetch("/api/settings/pages")
      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setPagesData(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading pages data:", error)
      // Fallback to localStorage for backward compatibility
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("pagesCustomization")
        if (stored) {
          try {
            setPagesData(JSON.parse(stored))
          } catch (e) {
            console.error("Error parsing localStorage:", e)
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updatePagesData = async (data: PagesData) => {
    setPagesData(data)
    
    // Save to localStorage as cache
    if (typeof window !== "undefined") {
      localStorage.setItem("pagesCustomization", JSON.stringify(data))
    }

    // Save to database via API
    try {
      await fetch("/api/settings/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error("Error saving pages data to database:", error)
    }
  }

  return (
    <PagesContext.Provider value={{ pagesData, updatePagesData }}>
      {children}
    </PagesContext.Provider>
  )
}

export function usePages() {
  const context = useContext(PagesContext)
  if (context === undefined) {
    throw new Error("usePages must be used within a PagesProvider")
  }
  return context
}




