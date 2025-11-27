import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'

const buildError = (error, fallbackMessage) => {
  const message = error?.response?.data?.message || fallbackMessage
  return new Error(message)
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('whatsappDocsToken')
  const headers = {
    'Content-Type': 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

/**
* Utility functions for authentication and token management
*/

/**
* Decode JWT token without verification (to check expiration)
* Note: This only checks expiration, not signature validity
*/
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if token exists and is not expired
 * @returns {boolean} true if token is valid, false otherwise
 */
export const isTokenValid = () => {
  const token = localStorage.getItem('whatsappDocsToken')
  
  if (!token) {
    return false
  }

  try {
    const decoded = decodeToken(token)
    
    if (!decoded || !decoded.exp) {
      return false
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Date.now() / 1000
    if (decoded.exp < currentTime) {
      // Token expired, remove it
      localStorage.removeItem('whatsappDocsToken')
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating token:', error)
    localStorage.removeItem('whatsappDocsToken')
    return false
  }
}


export const getToken = () => {
  return localStorage.getItem('whatsappDocsToken')
}

/**
 * Remove the token from storage
 */
export const removeToken = () => {
  localStorage.removeItem('whatsappDocsToken')
}

export const isTokenExpiredResponse = (response) => {
  return response.status === 401
}

export const getUserType = () => {
  const token = localStorage.getItem('whatsappDocsToken')
  
  if (!token) {
    return null
  }

  try {
    const decoded = decodeToken(token)
    return decoded?.userType || null
  } catch (error) {
    console.error('Error getting userType from token:', error)
    return null
  }
}

export const forgetPassword = async (email) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/auth/forget-password`,
      email ? { email } : {},
      { headers: getAuthHeaders() }
    )
    return response.data
  } catch (error) {
    console.error('Error forgetting Password:', error)
    throw buildError(error, 'Unable to start password reset')
  }
}

export const verifyOtp = async (token, otp) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
      token,
      otp
    })
    return response.data
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw buildError(error, 'Invalid OTP, please try again')
  }
}

export const resetPassword = async ({ token, otp, password }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
      token,
      password
    })
    return response.data
  } catch (error) {
    console.error('Error resetting Password:', error)
    throw buildError(error, 'Unable to reset password')
  }
}