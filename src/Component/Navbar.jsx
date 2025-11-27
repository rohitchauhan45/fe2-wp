import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleUser, Mail, Phone, User, User as UserIcon } from 'lucide-react'
import { removeToken } from '../utils/auth'
import { getUserDetails } from '../Services/Customer'

const VARIANT_PRESETS = {
  default: {
    headerPadding: 'px-4',
    containerClasses: 'max-w-4xl mx-auto w-full',
    positionClasses: 'fixed right-0 left-0 top-0 z-30',
  },
  admin: {
    headerPadding: 'px-4 sm:px-8',
    containerClasses: 'max-w-[1125px] mx-auto w-full',
    positionClasses: 'fixed right-0 left-0 lg:left-64 top-0 z-30',
  },
  customer: {
    headerPadding: 'px-4 sm:px-6',
    containerClasses: 'max-w-[960px] mx-auto w-full',
    positionClasses: 'fixed right-0 left-0 lg:left-64 top-0 z-30',
  },
}

function Navbar({ variant = 'default', title = 'WhatsAppBotDocs' }) {
  const navigate = useNavigate()
  const [userDetails, setUserDetails] = useState({
    email: '',
    phoneNumber: '',
    userName: ''
  })
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await getUserDetails()
      if (response?.success && response?.user) {
        setUserDetails({
          email: response.user.email || '',
          phoneNumber: response.user.phoneNumber || '',
          userName: response.user.userName || ''
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

  const variantConfig = VARIANT_PRESETS[variant] || VARIANT_PRESETS.default
  const headerPadding = variantConfig.headerPadding
  const containerClasses = variantConfig.containerClasses
  const headerPositionClasses = variantConfig.positionClasses

  return (
    <header
      className={`bg-white shadow-sm border-b border-gray-200 pt-4 pb-3 py-2 ${headerPadding} ${headerPositionClasses}`}
    >
      <div className={containerClasses}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 pl-12 lg:pl-0">

            <div>
              <h1 className="text-lg sm:text-[22px] font-semibold text-gray-900">{title}</h1>
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
              <div className="absolute right-0 mt-3 w-64 sm:w-auto min-w-[250px] bg-white border border-gray-200 rounded-xl shadow-lg p-3 sm:p-4">
                <div className="mb-3 space-y-4">

                  {userDetails.userName ?
                    <div className="flex items-center gap-2 text-gray-800">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-[15px] font-medium">
                        {userDetails.userName}
                      </span>
                    </div>
                    : ""}

                  <div className="flex items-center gap-2 text-gray-800 mb-2">
                    <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-sm sm:text-[15px] font-semibold truncate max-w-[250px] break-all">{userDetails.email || '—'}</span>
                  </div>

                  {userDetails.phoneNumber ?
                    <div className="flex items-center gap-2 text-gray-800">
                      <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm sm:text-[14px] font-medium">
                        {userDetails.phoneNumber.slice(2)}
                      </span>
                    </div>
                    : ""}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-400 hover:bg-red-500 rounded-lg transition-colors"
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

