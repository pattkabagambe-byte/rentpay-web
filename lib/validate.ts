import { z } from 'zod'

export type FieldErrors = Record<string, string>

export function parseZodErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: FieldErrors; message: string } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors = parseZodErrors(result.error)
  const message = Object.values(errors)[0] ?? 'Please check your input.'
  return { success: false, errors, message }
}
