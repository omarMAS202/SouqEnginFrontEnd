import { z } from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
  description: z.string().min(5, 'Description must be at least 5 characters.'),
})

export type CategorySchemaValues = z.infer<typeof categorySchema>
