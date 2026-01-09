/**
 * Common validation utilities for edge functions
 */

/**
 * Validate that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validate that a value is a valid UUID
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validate that a value is a valid email
 */
export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Validate that a value is a valid phone number (Brazilian format)
 */
export function isValidBrazilianPhone(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const cleanPhone = value.replace(/\D/g, "");
  // Brazilian phones: 10-11 digits (with DDD) or 12-13 (with country code)
  return cleanPhone.length >= 10 && cleanPhone.length <= 13;
}

/**
 * Clean and normalize a phone number
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Validate that a value is a positive number
 */
export function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && value > 0;
}

/**
 * Validate that a value is a non-negative number
 */
export function isNonNegativeNumber(value: unknown): boolean {
  return typeof value === "number" && value >= 0;
}

/**
 * Validate that a value is a valid date string (ISO format)
 */
export function isValidDateString(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Validate required fields in an object
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = obj[field];
    if (value === undefined || value === null || value === "") {
      missingFields.push(String(field));
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Parse and validate JSON from request body
 */
export async function parseJsonBody<T = unknown>(
  req: Request
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await req.json();
    return { data: data as T, error: null };
  } catch (error) {
    return { data: null, error: "Invalid JSON body" };
  }
}
