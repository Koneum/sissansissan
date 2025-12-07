/**
 * Utilitaire pour formater les prix en FCFA (Franc CFA)
 * Format : 1.000 FCFA, 10.000 FCFA, 100.000 FCFA
 */

/**
 * Formate un nombre en prix FCFA avec séparateur de milliers (point)
 * @param amount - Le montant à formater
 * @param showCurrency - Afficher "FCFA" après le montant (par défaut: true)
 * @returns Prix formaté (ex: "1.000 FCFA")
 */
export function formatPrice(amount: number, showCurrency: boolean = true): string {
  // Arrondir à l'entier le plus proche (FCFA n'utilise pas de centimes)
  const roundedAmount = Math.round(amount)
  
  // Formater avec séparateur de milliers (point)
  const formatted = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  
  // Ajouter la devise si demandé
  return showCurrency ? `${formatted} FCFA` : formatted
}

/**
 * Formate un prix avec devise en petit format (pour les cartes produits)
 * @param amount - Le montant à formater
 * @returns Prix formaté court (ex: "1.000 F")
 */
export function formatPriceShort(amount: number): string {
  const roundedAmount = Math.round(amount)
  const formatted = roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted} F`
}

/**
 * Formate un prix sans devise (pour les inputs)
 * @param amount - Le montant à formater
 * @returns Prix formaté sans devise (ex: "1.000")
 */
export function formatPriceInput(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  const roundedAmount = Math.round(num)
  return roundedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Parse un prix formaté en nombre
 * @param formattedPrice - Prix formaté avec points (ex: "1.000" ou "1.000 FCFA")
 * @returns Nombre (ex: 1000)
 */
export function parsePrice(formattedPrice: string): number {
  // Enlever tous les espaces, points et texte
  const cleaned = formattedPrice.replace(/[.\sFCFA]/g, '')
  const num = parseInt(cleaned, 10)
  return isNaN(num) ? 0 : num
}

/**
 * Formate un intervalle de prix
 * @param min - Prix minimum
 * @param max - Prix maximum
 * @returns Intervalle formaté (ex: "1.000 - 10.000 FCFA")
 */
export function formatPriceRange(min: number, max: number): string {
  const minFormatted = formatPriceInput(min)
  const maxFormatted = formatPriceInput(max)
  return `${minFormatted} - ${maxFormatted} FCFA`
}

/**
 * Calcule et formate une réduction
 * @param originalPrice - Prix original
 * @param discountPrice - Prix après réduction
 * @returns Texte de réduction (ex: "Économisez 1.000 FCFA (10%)")
 */
export function formatDiscount(originalPrice: number, discountPrice: number): string {
  const savings = originalPrice - discountPrice
  const percentage = Math.round((savings / originalPrice) * 100)
  
  return `Économisez ${formatPrice(savings)} (${percentage}%)`
}

/**
 * Constantes pour la devise
 */
export const CURRENCY = {
  code: 'XOF', // Code ISO pour le Franc CFA (Afrique de l'Ouest)
  symbol: 'FCFA',
  shortSymbol: 'F',
  name: 'Franc CFA',
  locale: 'fr-FR'
}

/**
 * Valide qu'un montant est valide pour FCFA (pas de centimes)
 * @param amount - Montant à valider
 * @returns true si valide
 */
export function isValidFCFAAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 0
}







