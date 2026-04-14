import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().min(0.01, 'Price must be greater than zero.'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative.'),
  categoryId: z.string().min(1, 'Choose a category.'),
  status: z.enum(['active', 'draft', 'out_of_stock']),
  image: z.string().default(''),
})

export type ProductSchemaValues = z.infer<typeof productSchema>
