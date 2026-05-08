import { z } from 'zod'

export const productImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string(),
  kind: z.enum(['gallery', 'thumbnail', 'hero']),
})

export const checkoutSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  firstName: z.string().min(2, 'First name is required.'),
  lastName: z.string().min(2, 'Last name is required.'),
  phone: z.string().min(6, 'Phone number is required.'),
  addressLine1: z.string().min(5, 'Address line is required.'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required.'),
  country: z.string().min(2, 'Country is required.'),
  postalCode: z.string().min(3, 'Postal code is required.'),
  notes: z.string().optional(),
})

export const customerLoginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const customerRegisterSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Enter a valid email address.'),
    phone: z.string().min(6, 'Phone number is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export const customerAddressSchema = z.object({
  label: z.string().min(2, 'Address label is required.'),
  recipientName: z.string().min(2, 'Recipient name is required.'),
  phone: z.string().min(6, 'Phone number is required.'),
  addressLine1: z.string().min(5, 'Address line is required.'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required.'),
  country: z.string().min(2, 'Country is required.'),
  postalCode: z.string().min(3, 'Postal code is required.'),
  isDefault: z.boolean().default(false),
})

export const aiStorefrontPayloadSchema = z.object({
  storeProfile: z.record(z.string(), z.unknown()).optional(),
  theme: z.record(z.string(), z.unknown()).optional(),
  navigation: z.array(z.record(z.string(), z.unknown())).optional(),
  homePage: z
    .object({
      hero: z.record(z.string(), z.unknown()).optional(),
      sections: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .optional(),
  categories: z.array(z.record(z.string(), z.unknown())).optional(),
  products: z.array(z.record(z.string(), z.unknown())).optional(),
  footer: z.record(z.string(), z.unknown()).optional(),
  pages: z.array(z.record(z.string(), z.unknown())).optional(),
  policies: z.array(z.record(z.string(), z.unknown())).optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
export type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>
export type CustomerRegisterFormValues = z.infer<typeof customerRegisterSchema>
export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>
