import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isTokenValid, getUserType } from '../utils/auth'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Check if user is already logged in (has valid token)
  useEffect(() => {
    if (isTokenValid()) {
      const userType = getUserType()
      // Redirect based on userType
      if (userType === 'Admin') {
        navigate('/admin-dashboard')
      } else {
        navigate('/dashboard')
      }
    }
  }, [navigate])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    // Clear messages when user starts typing
    if (successMessage) setSuccessMessage('')
    if (errorMessage) setErrorMessage('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password
        })
      })

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        // Try to parse error message from response
        try {
          const errorData = await response.json()
          setErrorMessage(errorData.message || 'Login failed. Please try again.')
        } catch {
          setErrorMessage(`Server error: ${response.status} ${response.statusText}`)
        }
        return
      }

      const data = await response.json()

      if (data.success) {
        // Store token in localStorage with name "whatsappDocsToken"
        if (data.token) {
          localStorage.setItem('whatsappDocsToken', data.token)
        }
        setSuccessMessage(data.message || 'Login successful!')
        setFormData({ email: '', password: '' })
        // Redirect based on userType from token
        setTimeout(() => {
          const userType = getUserType()
          if (userType === 'Admin') {
            navigate('/admin-dashboard')
          } else {
            navigate('/dashboard')
          }
        }, 1500)
      } else {
        setErrorMessage(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      setErrorMessage(err.message || 'Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full m-0 p-0 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-auto" style={{ margin: 0, padding: 0 }}>
      <div className="w-full min-h-screen m-0 p-0 bg-white shadow-2xl overflow-auto animate-fade-in flex flex-col md:flex-row" style={{ margin: 0, padding: 0 }}>
        {/* Left Side - Image with Overlay */}
        <div className="relative w-full md:w-1/2 h-96 md:h-auto m-0 p-0 bg-gray-100 overflow-hidden">
          <img 
            src="/wag.jpeg" 
            alt="WhatsApp and Google Drive" 
            className="w-full h-full object-cover object-center"
          />
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
          {/* Text Overlay */}
          
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 flex flex-col items-center md:items-start justify-center bg-white max-w-sm sm:max-w-md md:max-w-2xl mx-auto md:mx-0">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8 w-full text-center md:text-left">
            <h1 className="text-4xl sm:text-4xl md:text-4xl lg:text-5xl font-bold text-indigo-600 mb-2">
              Welcome
            </h1>
            <p className="text-lg sm:text-lg md:text-lg text-gray-600 font-medium">
              Login with Email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-xs sm:max-w-sm md:max-w-md">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-left text-lg sm:text-sm md:text-base font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 md:py-3.5 text-lg sm:text-base md:text-lg border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 sm:mt-2 text-sm  text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-left text-lg sm:text-sm md:text-base font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3 md:py-3.5 text-lg sm:text-base md:text-lg border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                    errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  } ${isLoading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 sm:mt-2 text-sm  text-red-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 sm:py-3 md:py-3.5 lg:py-4 text-lg sm:text-base md:text-lg font-semibold text-white rounded-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
              } shadow-md`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                'LOGIN'
              )}
            </button>
          </form>

          {/* Link to Signup */}
          <div className="mt-4 sm:mt-5 md:mt-6 text-center">
            <p className="text-sm md:text-base text-gray-600 font-medium">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg animate-slide-down">
              <p className="text-sm md:text-base text-green-700 font-semibold flex items-center gap-2">
                <span className="text-lg">✓</span>
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 sm:mt-5 md:mt-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-down">
              <p className="text-sm sm:text-sm md:text-base text-red-700 font-semibold flex items-center gap-2">
                <span className="text-lg">✕</span>
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        #root {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-in;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Login

