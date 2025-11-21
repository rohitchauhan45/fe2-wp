import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUser } from 'lucide-react'
import { removeToken } from '../utils/auth'
import { getUserDetails } from '../Services/Customer'

function Navbar({ variant = 'default' }) {
  const navigate = useNavigate()
  const [customerEmail, setCustomerEmail] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await getUserDetails()
      if (response?.success && response?.user?.email) {
        setCustomerEmail(response.user.email)
      }
    }

    fetchCustomer()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const isAdminVariant = variant === 'admin'
  const headerPadding = isAdminVariant ? 'px-8' : 'px-4'
  const containerClasses = isAdminVariant ? 'max-w-[1105px] mx-auto w-full' : 'max-w-4xl mx-auto'
  const headerPositionClasses = isAdminVariant
    ? 'fixed right-0 left-64 top-0 z-50'
    : 'fixed right-0 left-0 top-0 z-50'

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 pt-4 pb-3 py-2 ${headerPadding} ${headerPositionClasses}`}
    >
      <div className={containerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            
            <div>
              <h1 className="text-[22px] font-semibold text-gray-900">WhatsAppBotDocs</h1>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={toggleMenu}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-gray-100"
              aria-label="Account menu" 
            >
              <CircleUser className="w-7 h-7 text-gray-700" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-3 w-auto bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 text-center uppercase tracking-wide">Welcome</p>
                  <p className="mt-1 text-base text-center font-medium text-gray-900 break-words">
                    {customerEmail || 'Loading...'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

