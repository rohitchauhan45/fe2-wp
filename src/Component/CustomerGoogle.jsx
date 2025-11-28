import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { isTokenValid, isTokenExpiredResponse, removeToken, getUserType } from '../utils/auth'
import { getUserDetails, checkUserExists } from '../Services/Customer'

function Dashboard() {
  const navigate = useNavigate()
  const backendBaseUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'

  // Google Drive states
  const [hasGoogleToken, setHasGoogleToken] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [userProfile, setUserProfile] = useState({ phoneNumber: '', email: '' })

  // Phone number modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const countryCode = '91' // Fixed to India (91)
  const [phoneError, setPhoneError] = useState('')
  const [isPhoneSubmitting, setIsPhoneSubmitting] = useState(false)

  const urlParams = new URLSearchParams(window.location.search)
  const driveConnectedParam = urlParams.get('drive_connected') === 'true'
  const error = urlParams.get('error')
  const errorMessage = urlParams.get('error_message') || urlParams.get('error_description')

  // Helper function to handle token expiration
  const handleTokenExpiration = () => {
    removeToken()
    navigate('/login')
  }

  // Check Google connection status using userId from token
  const checkGoogleConnectionWithPhone = async () => {
    try {
      setIsGoogleLoading(true)

      const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
      const response = await fetch(`${apiUrl}/googleAuth/token`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('whatsappDocsToken') || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (isTokenExpiredResponse(response)) {
        handleTokenExpiration()
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Google connection check result:', data)

      // Check if Google Drive is connected by verifying accessToken exists
      // After disconnect, accessToken is set to null, so hasAccessToken will be false
      const isConnected = data.hasAccessToken === true

      setHasGoogleToken(isConnected)
    } catch (err) {
      console.error('Error checking Google connection:', err)
      setHasGoogleToken(false)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)

      const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
      const response = await fetch(`${apiUrl}/googleAuth/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('whatsappDocsToken') || ''}`,
          'Content-Type': 'application/json'
        }
      })

      if (isTokenExpiredResponse(response)) {
        handleTokenExpiration()
        return
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to disconnect Google Drive')
      }

      const data = await response.json()
      if (data.success) {
        setHasGoogleToken(false)
      } else {
        throw new Error(data.message || 'Failed to disconnect Google Drive')
      }
    } catch (err) {
      console.error('Error disconnecting Google Drive:', err)
      // Silently handle error - UI will show disconnected state
    } finally {
      setIsDisconnecting(false)
      setIsGoogleLoading(false)
    }
  }

  // Check authentication on mount
  useEffect(() => {
    // Token validation is now handled by ProtectedRoute, but we check here too for safety
    if (!isTokenValid()) {
      navigate('/login')
      return
    }

    // Check if user is Admin and redirect to AdminDashboard
    const userType = getUserType()
    if (userType === 'Admin') {
      navigate('/admin-dashboard')
      return
    }

    // Check Google connection status directly using token
    checkGoogleConnectionWithPhone()

    // Clean URL params after reading
    if (driveConnectedParam || error) {
      window.history.replaceState({}, document.title, window.location.pathname)
      // Refresh connection status after successful connection
      if (driveConnectedParam) {
        // Wait a bit for database to be updated, then check connection
        setTimeout(() => {
          checkGoogleConnectionWithPhone()
        }, 1000)
      }
    }
  }, [])

  const formatPhoneNumberWithCountryCode = (phone, countryCode) => {
    // Remove all non-digit characters
    const digitsOnly = phone.replace(/\D/g, '')
    // Combine country code with phone number (remove leading zeros from phone if present)
    const cleanPhone = digitsOnly.replace(/^0+/, '')
    return countryCode + cleanPhone
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    if (isPhoneSubmitting) {
      return
    }

    setPhoneError('')

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required')
      return
    }

    // Validate phone number (digits only, 7-15 digits total)
    const digitsOnly = phoneNumber.replace(/\D/g, '')
    if (digitsOnly.length !== 10) {
      setPhoneError('Please enter a valid phone number (10 digits)')
      return
    }

    // Format phone number with country code (e.g., "917698489306")
    const formattedPhone = formatPhoneNumberWithCountryCode(phoneNumber, countryCode)

    // Get token from localStorage
    const token = localStorage.getItem('whatsappDocsToken')
    if (!token) {
      alert('Authentication token not found. Please login again.')
      navigate('/login')
      return
    }

    setIsPhoneSubmitting(true)
    try {
      const existsResponse = await checkUserExists(formattedPhone)
      console.log("existsResponse", existsResponse)
      if (!existsResponse?.success) {
        setPhoneError(existsResponse?.message || 'Phone number not found. Please verify and try again.')
        return
      }

      // Redirect to Google OAuth with phone number and token
      const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
      window.location.href = `${apiUrl}/googleAuth/google?phone=${encodeURIComponent(formattedPhone)}&token=${encodeURIComponent(token)}`
    } catch (err) {
      console.error('Error verifying phone number:', err)
      setPhoneError('Unable to verify phone number right now. Please try again.')
    } finally {
      setIsPhoneSubmitting(false)
    }
  }

  const connectGoogleDrive = () => {
    setShowPhoneModal(true)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await getUserDetails()
      if (response?.success && response?.user) {
        setUserProfile({
          phoneNumber: response.user.phoneNumber || '',
          email: response.user.googleMail || response.user.email || ''
        })
      }
    }

    fetchProfile()
  }, [])




  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="flex justify-center items-center max-w-[990px] mx-auto min-h-screen px-3 sm:px-4 pt-20 sm:pt-28 pb-6 sm:pb-10">

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 w-full ">
          {/* Google Drive Connection Card */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200">


            {!isGoogleLoading && hasGoogleToken && (

              <div className="mb-1 w-full grid grid-cols-[1fr_auto_1fr] items-center gap-5 sm:gap-8">

                {/* WhatsApp */}
                <div className="flex items-center justify-end gap-4 min-w-0">
                  <img
                    src="/whatsapp.png"
                    alt="WhatsApp"
                    className="h-9 w-9 flex-shrink-0"
                  />
                  <p className="text-lg font-semibold text-gray-900 truncate max-w-[160px] text-right">
                    {userProfile.phoneNumber.slice(2)}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center px-3">
                  <ArrowRightLeft className="h-9 w-9 text-gray-600" />
                </div>

                {/* Google Drive */}
                <div className="flex items-center justify-start gap-4 min-w-0">
                  <img
                    src="/google-drive.png"
                    alt="Google Drive"
                    className="h-9 w-9 flex-shrink-0"
                  />
                  <p className="text-lg font-semibold text-gray-900 truncate max-w-[235px] text-left">
                    {userProfile.email || "Email not available"}
                  </p>
                </div>

              </div>

            )}

            {(isGoogleLoading || !hasGoogleToken) && (
              <div className="mb-4 flex sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
                <div className="flex items-center gap-2 h-12 sm:h-14 w-auto">
                  <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10">
                    <img src="/whatsapp.png" alt="WhatsApp" className="h-10 w-10 object-contain" />
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-gray-800 tracking-wide">
                    WhatsApp
                  </span>
                </div>

                <div className="flex items-center justify-center h-10 w-10 flex-shrink-0">
                  <ArrowRightLeft className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 h-12 sm:h-14 w-auto">
                  <div className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 ">
                    <img src="/google-drive.png" alt="Google Drive" className="h-10 w-10 object-contain" />
                  </div>
                  <span className="text-sm sm:text-lg font-semibold text-gray-800 tracking-wide">
                    Google Drive
                  </span>
                </div>
              </div>
            )}

            {isGoogleLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : hasGoogleToken ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <div className="mb-3 sm:mb-4">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-600 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm sm:text-base font-medium">Google Drive Connected</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 px-2">
                    Enjoy with WhatsAppBot in your WhatsApp! 🎉
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                    Your Google Drive is connected and ready. Start Conversations via WhatsApp!
                  </p>
                  <button
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                    className={`w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isDisconnecting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                      }`}
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect Google Drive'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connectGoogleDrive}
                className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-sm sm:text-base text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Connect Google Drive
              </button>
            )}

            {/* Connection Success Message */}
            {driveConnectedParam && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-green-800">
                  ✅ Google Drive connected successfully!
                </p>
              </div>
            )}

            {/* Connection Error */}
            {error && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs sm:text-sm font-medium text-red-800">❌ Connection Failed</p>
                <p className="text-xs sm:text-sm text-red-600 mt-1">{errorMessage || `Error: ${error}`}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-fade-in max-h-[90vh] overflow-y-auto">

            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Connect Google Drive
            </h3>

            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Enter your phone number to connect Google Drive.
              This number will be used to conversessions with WhatsApp.
            </p>

            {/* PHONE INPUT + PERMISSION */}
            <form onSubmit={handlePhoneSubmit}>

              {/* STEP 1: PHONE INPUT FIELD */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>

                <div className="flex gap-2">
                  {/* Country Code */}
                  <div className="w-24 sm:w-32 px-2 sm:px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center text-xs sm:text-sm text-gray-700 font-medium">
                    India +91
                  </div>

                  {/* Number Input */}
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      setPhoneError('')
                    }}
                    placeholder="7********6"
                    className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${phoneError ? "border-red-500" : "border-gray-300"
                      }`}
                  />
                </div>

                {phoneError && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600">{phoneError}</p>
                )}
              </div>

              {/* STEP 3: ACTION BUTTONS */}
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4">

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPhoneModal(false);
                    setPhoneNumber("");
                    setPhoneError("");
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                {/* Continue to Google Login */}
                <button
                  type="submit"
                  disabled={isPhoneSubmitting}
                  className={`flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg ${isPhoneSubmitting ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isPhoneSubmitting ? 'Checking...' : 'Continue'}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  )
}

export default Dashboard

