/**
 * Schémas de validation Zod pour Sissan-Sissan
 * Utilisés pour valider les entrées utilisateur côté serveur
 */

import { z } from 'zod'

// ============================================
// PRODUCT SCHEMAS
// ============================================

export const createProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(200, "Le nom est trop long"),
  slug: z.string().min(1, "Le slug est requis").max(200).regex(/^[a-z0-9-]+$/, "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"),
  description: z.string().optional().nullable(),
  shortDesc: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]).transform(val => parseFloat(String(val))).refine(val => val > 0, "Le prix doit être positif"),
  discountPrice: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? parseFloat(String(val)) : null),
  salePercentage: z.union([z.string(), z.number()]).optional().nullable().transform(val => val ? parseInt(String(val)) : null),
  sku: z.string().optional().nullable(),
  stock: z.union([z.string(), z.number()]).optional().transform(val => val ? parseInt(String(val)) : 0),
  categoryId: z.string().min(1, "La catégorie est requise"),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional().nullable(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).optional().nullable(),
})

export const updateProductSchema = createProductSchema.partial()

// ============================================
// ORDER SCHEMAS
// ============================================

export const orderItemSchema = z.object({
  productId: z.string().min(1, "L'ID du produit est requis"),
  quantity: z.number().int().positive("La quantité doit être positive"),
  variantId: z.string().optional().nullable(),
})

export const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  district: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

export const createOrderSchema = z.object({
  userId: z.string().min(1, "L'ID utilisateur est requis"),
  items: z.array(orderItemSchema).min(1, "Au moins un article est requis"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethod: z.string().optional(),
  couponCode: z.string().optional().nullable(),
  customerNotes: z.string().optional().nullable(),
})

export const updateOrderSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  trackingNumber: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  paymentId: z.string().optional().nullable(),
})

// ============================================
// CUSTOMER SCHEMAS
// ============================================

export const updateCustomerRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'], {
    message: "Rôle invalide"
  }),
})

// ============================================
// CATEGORY SCHEMAS
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  slug: z.string().min(1, "Le slug est requis").max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export const updateCategorySchema = createCategorySchema.partial()

// ============================================
// STAFF SCHEMAS
// ============================================

export const createStaffSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']),
  permissions: z.array(z.object({
    permissionId: z.string(),
    canView: z.boolean().optional().default(false),
    canCreate: z.boolean().optional().default(false),
    canEdit: z.boolean().optional().default(false),
    canDelete: z.boolean().optional().default(false),
  })).optional().default([]),
})

export const updateStaffSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional().nullable(),
  role: z.enum(['PERSONNEL', 'MANAGER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  permissions: z.array(z.object({
    permissionId: z.string(),
    canView: z.boolean().optional().default(false),
    canCreate: z.boolean().optional().default(false),
    canEdit: z.boolean().optional().default(false),
    canDelete: z.boolean().optional().default(false),
  })).optional(),
})

// ============================================
// USER PROFILE SCHEMAS
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  phone: z.string().optional().nullable(),
})

// ============================================
// CONTACT SCHEMA
// ============================================

export const contactMessageSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").max(50),
  lastName: z.string().optional().nullable(),
  email: z.string().email("Email invalide"),
  phone: z.string().optional().nullable(),
  subject: z.string().optional().default("Contact général"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères").max(5000),
})

// ============================================
// CHECKOUT SCHEMA (Guest checkout)
// ============================================

export const guestInfoSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional().nullable(),
})

export const checkoutSchema = z.object({
  userId: z.string().optional().nullable(),
  guestInfo: guestInfoSchema.optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().optional(),
  })).min(1, "Le panier est vide"),
  subtotal: z.number().optional(),
  shipping: z.number().optional(),
  total: z.number().optional(),
  promoCode: z.string().optional().nullable(),
}).refine(
  data => data.userId || data.guestInfo,
  { message: "Utilisateur ou informations invité requis" }
)

// ============================================
// ID PARAM VALIDATION
// ============================================

export const idParamSchema = z.object({
  id: z.string().min(1, "ID invalide"),
})

// ============================================
// PAGINATION SCHEMA
// ============================================

export const paginationSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
})

// ============================================
// HELPER FUNCTION
// ============================================

/**
 * Valide les données avec un schéma Zod et retourne le résultat formaté
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  error?: string
  issues?: z.ZodIssue[]
} {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    error: result.error.issues[0]?.message || "Données invalides",
    issues: result.error.issues,
  }
}
