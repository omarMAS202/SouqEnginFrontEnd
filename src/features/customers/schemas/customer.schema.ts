import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required.'),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().min(6, 'Phone number is required.'),
})

export type CustomerSchemaValues = z.infer<typeof customerSchema>
