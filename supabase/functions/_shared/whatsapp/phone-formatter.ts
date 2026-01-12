// ============================================
// WhatsApp Phone Number Formatter
// Formats any phone number to Brazilian standard: 55 + DDD + number
// ============================================

/**
 * Formats a phone number to Brazilian WhatsApp standard.
 * 
 * Input formats supported:
 * - "11999999999" → "5511999999999"
 * - "5511999999999" → "5511999999999"
 * - "+55 11 99999-9999" → "5511999999999"
 * - "(11) 99999-9999" → "5511999999999"
 * - "011999999999" → "5511999999999"
 * - "+5511999999999" → "5511999999999"
 * 
 * @param phone - Phone number in any format
 * @returns Formatted phone number (55 + DDD + number) or null if invalid
 */
export function formatPhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If empty after cleaning, invalid
  if (!cleaned) {
    return null;
  }
  
  // Remove leading zeros (common in some formats like 011...)
  while (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 55, it already has country code
  if (cleaned.startsWith('55')) {
    // Validate length: 55 + DDD (2) + number (8-9) = 12-13 digits
    if (cleaned.length >= 12 && cleaned.length <= 13) {
      return cleaned;
    }
    // If too long, might have extra digits
    if (cleaned.length > 13) {
      // Try to extract valid number
      cleaned = cleaned.substring(0, 13);
      if (cleaned.length >= 12) {
        return cleaned;
      }
    }
  }
  
  // Add country code 55
  cleaned = '55' + cleaned;
  
  // Validate final length: 55 + DDD (2) + number (8-9) = 12-13 digits
  if (cleaned.length >= 12 && cleaned.length <= 13) {
    return cleaned;
  }
  
  // If still invalid length, return null
  return null;
}

/**
 * Validates if a phone number is in valid Brazilian format.
 * 
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) {
    return false;
  }
  
  // Must start with 55
  if (!formatted.startsWith('55')) {
    return false;
  }
  
  // Extract DDD (area code)
  const ddd = formatted.substring(2, 4);
  const dddNum = parseInt(ddd, 10);
  
  // Valid DDDs are 11-99 (excluding some invalid ranges)
  // Main valid ranges: 11-19 (SP), 21-28 (RJ/ES), 31-38 (MG), 41-49 (PR/SC), 51-55 (RS), 61-69 (Centro-Oeste), 71-79 (Nordeste), 81-89 (Nordeste), 91-99 (Norte)
  if (dddNum < 11 || dddNum > 99) {
    return false;
  }
  
  // Extract number (after DDD)
  const number = formatted.substring(4);
  
  // Mobile numbers start with 9 and have 9 digits
  // Landlines have 8 digits
  if (number.length === 9) {
    // Mobile: must start with 9
    if (!number.startsWith('9')) {
      return false;
    }
  } else if (number.length === 8) {
    // Landline: valid
  } else {
    return false;
  }
  
  return true;
}

/**
 * Formats phone for display (with formatting characters).
 * 
 * @param phone - Phone number (formatted or not)
 * @returns Formatted display string like "+55 (11) 99999-9999"
 */
export function formatPhoneForDisplay(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) {
    return phone; // Return original if can't format
  }
  
  const countryCode = formatted.substring(0, 2);
  const ddd = formatted.substring(2, 4);
  const number = formatted.substring(4);
  
  if (number.length === 9) {
    // Mobile: 9 9999-9999
    return `+${countryCode} (${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
  } else if (number.length === 8) {
    // Landline: 9999-9999
    return `+${countryCode} (${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`;
  }
  
  return `+${countryCode} (${ddd}) ${number}`;
}

/**
 * Masks phone number for privacy (shows only last 4 digits).
 * 
 * @param phone - Phone number
 * @returns Masked phone like "+55 (11) *****-9999"
 */
export function maskPhoneNumber(phone: string): string {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) {
    return '***';
  }
  
  const countryCode = formatted.substring(0, 2);
  const ddd = formatted.substring(2, 4);
  const lastFour = formatted.substring(formatted.length - 4);
  
  return `+${countryCode} (${ddd}) *****-${lastFour}`;
}

/**
 * Extracts DDD (area code) from phone number.
 * 
 * @param phone - Phone number
 * @returns DDD string or null if invalid
 */
export function extractDDD(phone: string): string | null {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) {
    return null;
  }
  
  return formatted.substring(2, 4);
}

/**
 * Checks if phone number is mobile (starts with 9 after DDD).
 * 
 * @param phone - Phone number
 * @returns true if mobile, false if landline or invalid
 */
export function isMobileNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  if (!formatted) {
    return false;
  }
  
  const number = formatted.substring(4);
  return number.length === 9 && number.startsWith('9');
}
