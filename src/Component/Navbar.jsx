import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUser, Mail, Phone, User as UserIcon } from 'lucide-react'
import { removeToken } from '../utils/auth'
import { getUserDetails } from '../Services/Customer'

function Navbar({ variant = 'default' }) {
  const navigate = useNavigate()
  const [userDetails, setUserDetails] = useState({
    email: '',
    phoneNumber: ''
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await getUserDetails()
      if (response?.success && response?.user) {
        setUserDetails({
          email: response.user.email || '',
          phoneNumber: response.user.phoneNumber || ''
        })
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
  const headerPadding = isAdminVariant ? 'px-4 sm:px-8' : 'px-4'
  const containerClasses = isAdminVariant ? 'max-w-[980px] mx-auto w-full' : 'max-w-4xl mx-auto w-full'
  const headerPositionClasses = isAdminVariant
    ? 'fixed right-0 left-0 lg:left-64 top-0 z-30'
    : 'fixed right-0 left-0 top-0 z-30'

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 pt-4 pb-3 py-2 ${headerPadding} ${headerPositionClasses}`}
    >
      <div className={containerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 pl-12 lg:pl-0">
            
            <div>
              <h1 className="text-lg sm:text-[22px] font-semibold text-gray-900">WhatsAppBotDocs</h1>
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
              <div className="absolute right-0 mt-3 w-64 sm:w-auto min-w-[280px] bg-white border border-gray-200 rounded-xl shadow-lg p-3 sm:p-4">
                <div className="mb-3 space-y-4">
                  
                  <div className="flex items-center gap-1 text-gray-800">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-[15px] font-semibold break-all">{userDetails.email || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-800">
                    <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-[14px] font-medium">
                      {userDetails.phoneNumber ? userDetails.phoneNumber.slice(2) : '—'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
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

