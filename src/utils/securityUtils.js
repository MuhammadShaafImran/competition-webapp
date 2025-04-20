/**
 * Security utilities for preventing common vulnerabilities
 */

/**
 * Sanitizes string input to prevent XSS attacks
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') {
    return input;
  }
  
  // Replace potentially dangerous characters with HTML entities
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitizes an object's string properties recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle array case
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  // Handle object case
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validates and sanitizes form data
 * @param {Object} data - Form data
 * @param {Array} allowedFields - List of allowed field names
 * @returns {Object} Sanitized data with only allowed fields
 */
export const sanitizeFormData = (data, allowedFields = []) => {
  if (!data || typeof data !== 'object') {
    return {};
  }
  
  const sanitized = {};
  
  // Only include allowed fields
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (typeof data[field] === 'string') {
        sanitized[field] = sanitizeString(data[field]);
      } else if (typeof data[field] === 'object' && data[field] !== null) {
        sanitized[field] = sanitizeObject(data[field]);
      } else {
        sanitized[field] = data[field];
      }
    }
  }
  
  return sanitized;
};

/**
 * Generates a Content Security Policy header value
 * @returns {string} CSP header value
 */
export const generateCSP = () => {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
};

/**
 * Securely processes URL parameters
 * @param {string} paramValue - URL parameter value
 * @returns {string} Sanitized parameter value
 */
export const sanitizeUrlParam = (paramValue) => {
  if (!paramValue || typeof paramValue !== 'string') {
    return '';
  }
  
  // Remove any characters that could be used for XSS
  return paramValue.replace(/[<>'"&]/g, '');
};

export default {
  sanitizeString,
  sanitizeObject,
  sanitizeFormData,
  generateCSP,
  sanitizeUrlParam
};