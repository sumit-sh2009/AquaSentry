import { z } from "zod"

export const addressSchema = z.object({
  address: z
    .string()
    .trim()
    .min(3, "Enter a street address in Newark.")
    .max(240, "Use 240 characters or fewer."),
})

export type AddressInput = z.infer<typeof addressSchema>
