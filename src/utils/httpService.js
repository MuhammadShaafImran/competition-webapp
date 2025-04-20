/**
 * HTTP service utility for making API requests with consistent error handling
 */

// Default timeout for requests in milliseconds
const DEFAULT_TIMEOUT = 30000;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Creates an AbortController with timeout
 * @param {number} timeout - Timeout in milliseconds
 * @returns {AbortController} The abort controller
 */
const createAbortController = (timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller;
};

/**
 * Process the API response
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} The processed response data
 * @throws {ApiError} If the response is not ok
 */
const processResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  const data = isJson ? await response.json() : await response.text();
  
  if (!response.ok) {
    throw new ApiError(
      data.message || data.error || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }
  
  return data;
};

/**
 * Makes an HTTP request using fetch
 * @param {string} url - The URL to request
 * @param {Object} options - Fetch options
 * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout in milliseconds
 * @returns {Promise<any>} The response data
 */
const request = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = createAbortController(timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
    });
    
    return await processResponse(response);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    
    // Re-throw ApiErrors
    if (error instanceof ApiError) {
      throw error;
    }
    
    // For network errors
    throw new ApiError(error.message || 'Network error', 0);
  }
};

/**
 * HTTP methods wrapped with consistent error handling
 */
const http = {
  /**
   * HTTP GET request
   * @param {string} url - The URL to request
   * @param {Object} [options={}] - Additional fetch options
   * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
   * @returns {Promise<any>} The response data
   */
  get: (url, options = {}, timeout = DEFAULT_TIMEOUT) => 
    request(url, { ...options, method: 'GET' }, timeout),
  
  /**
   * HTTP POST request
   * @param {string} url - The URL to request
   * @param {Object} data - Data to send in request body
   * @param {Object} [options={}] - Additional fetch options
   * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
   * @returns {Promise<any>} The response data
   */
  post: (url, data, options = {}, timeout = DEFAULT_TIMEOUT) => 
    request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }, timeout),
  
  /**
   * HTTP PUT request
   * @param {string} url - The URL to request
   * @param {Object} data - Data to send in request body
   * @param {Object} [options={}] - Additional fetch options
   * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
   * @returns {Promise<any>} The response data
   */
  put: (url, data, options = {}, timeout = DEFAULT_TIMEOUT) => 
    request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }, timeout),
  
  /**
   * HTTP PATCH request
   * @param {string} url - The URL to request
   * @param {Object} data - Data to send in request body
   * @param {Object} [options={}] - Additional fetch options
   * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
   * @returns {Promise<any>} The response data
   */
  patch: (url, data, options = {}, timeout = DEFAULT_TIMEOUT) => 
    request(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }, timeout),
  
  /**
   * HTTP DELETE request
   * @param {string} url - The URL to request
   * @param {Object} [options={}] - Additional fetch options
   * @param {number} [timeout=DEFAULT_TIMEOUT] - Request timeout
   * @returns {Promise<any>} The response data
   */
  delete: (url, options = {}, timeout = DEFAULT_TIMEOUT) => 
    request(url, { ...options, method: 'DELETE' }, timeout),
};

export default http;