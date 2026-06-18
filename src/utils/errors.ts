import type { ValidationErrors } from '../api/types'

export type { ValidationErrors } from '../api/types'

export function isValidationErrors(data: unknown): data is ValidationErrors {
  return typeof data === 'object' && data !== null && !('status' in data) && !('message' in data)
}

export function parseValidationErrors(err: unknown): ValidationErrors | null {
  const data = (err as { response?: { data?: unknown } })?.response?.data
  if (isValidationErrors(data)) {
    return data
  }
  return null
}

export function parseErrorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string } } })?.response?.data
  return data?.message || 'An unexpected error occurred'
}

export function getHttpStatusCode(err: unknown): number | null {
  return (err as { response?: { status?: number } })?.response?.status ?? null
}
