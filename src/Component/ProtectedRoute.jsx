import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isTokenValid } from '../utils/auth'
import Navbar from './Navbar'

/**
 * ProtectedRoute component that checks token validity before rendering children
 * Redirects to login if token is missing or expired
 */
function ProtectedRoute({ children, navbarVariant }) {
  const [isValidating, setIsValidating] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check token validity
    const isValid = isTokenValid()
    setIsAuthenticated(isValid)
    setIsValidating(false)
  }, [])

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-indigo-500 via-purple-500 to-purple-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // For admin layout, children handle their own header/sidebar
  if (navbarVariant === 'admin') {
    return <>{children}</>
  }

  // Render protected content with default Navbar
  return (
    <>
      <Navbar variant={navbarVariant} />
      {children}
    </>
  )
}

export default ProtectedRoute

