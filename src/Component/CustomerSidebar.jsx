import { useEffect, useState } from "react"
import { getUserDetails } from "../Services/Customer"
import { User } from "lucide-react"

const menuItems = [
  { id: 'details', label: 'Your Details' },
  { id: 'google-drive', label: 'Google-Drive' }
]

function CustomerSidebar({ activeTab, onTabChange }) {

  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchCustomer = async () => {
      const response = await getUserDetails()
      if (response?.success && response?.user) {
        setUserName(response.user.userName)
      }
    }

    fetchCustomer()
  }, [])

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen h-screen sticky top-0 flex flex-col">
      <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200">
        <div className="flex items-center gap-1">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          <p className="text-sm sm:text-[17px] font-semibold text-blue-600 tracking-wide">{userName ? `${userName}` : 'Loading...'}</p>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">Store Docs</h1>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span className="text-sm sm:text-base font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-gray-200">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-blue-900">Need Help?</p>
          <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
            Switch between your details and Google Drive settings anytime.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default CustomerSidebar