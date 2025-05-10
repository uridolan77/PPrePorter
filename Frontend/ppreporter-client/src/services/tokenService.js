/**
 * Token Service
 * Handles JWT token operations including storage, retrieval, decoding, and expiration checking
 */

// Constants
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_BUFFER = 60; // seconds before expiration to refresh token

/**
 * Parse JWT token to get payload
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded token payload or null if invalid
 */
const parseJwt = (token) => {
  try {
    // Split the token and get the payload part (second part)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Get access token from storage
 * @returns {string|null} - Access token or null if not found
 */
const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from storage
 * @returns {string|null} - Refresh token or null if not found
 */
const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Set access token in storage
 * @param {string} token - Access token
 */
const setAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

/**
 * Set refresh token in storage
 * @param {string} token - Refresh token
 */
const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Remove tokens from storage
 */
const removeTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Set tokens in storage
 * @param {Object} tokens - Object containing access and refresh tokens
 */
const setTokens = (tokens) => {
  if (tokens.accessToken) {
    setAccessToken(tokens.accessToken);
  }
  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken);
  }
};

/**
 * Check if access token is expired
 * @param {number} bufferSeconds - Seconds before actual expiration to consider token expired
 * @returns {boolean} - True if token is expired or about to expire
 */
const isTokenExpired = (bufferSeconds = TOKEN_EXPIRY_BUFFER) => {
  const token = getAccessToken();
  if (!token) return true;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return true;

  // Get current time in seconds
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Check if token is expired or about to expire within buffer time
  return decoded.exp < currentTime + bufferSeconds;
};

/**
 * Get token expiration time
 * @returns {number|null} - Token expiration timestamp in seconds or null if invalid
 */
const getTokenExpirationTime = () => {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return null;

  return decoded.exp;
};

/**
 * Calculate time until token expiration
 * @returns {number} - Seconds until token expiration (negative if expired)
 */
const getTimeUntilExpiration = () => {
  const expTime = getTokenExpirationTime();
  if (!expTime) return -1;

  const currentTime = Math.floor(Date.now() / 1000);
  return expTime - currentTime;
};

/**
 * Get user info from token
 * @returns {Object|null} - User info from token or null if invalid
 */
const getUserFromToken = () => {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = parseJwt(token);
  if (!decoded) return null;

  return {
    id: decoded.sub || decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
    permissions: decoded.permissions
  };
};

const tokenService = {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  removeTokens,
  setTokens,
  isTokenExpired,
  getTokenExpirationTime,
  getTimeUntilExpiration,
  getUserFromToken,
  parseJwt
};

export default tokenService;
