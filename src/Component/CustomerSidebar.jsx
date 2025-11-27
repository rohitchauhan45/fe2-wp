import { useEffect, useState } from "react"
import { getUserDetails } from "../Services/Customer"
import { User, ArrowRightLeft , FileCheckCorner  } from "lucide-react"

const menuItems = [
  { id: 'my-documents', label: 'My Documents', icon: FileCheckCorner  },
  { id: 'connect', label: 'Connect', icon: ArrowRightLeft  }
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
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        
        <h1 className="text-xl sm:text-[19px] font-bold text-gray-900 ">WhatsappDocSync</h1>
      </div>

      <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm sm:text-base font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-3 sm:px-4 py-4 sm:py-6 border-t border-gray-200">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-semibold text-blue-900">Need Help?</p>
          <p className="text-[10px] sm:text-xs text-blue-700 mt-1">
            Contact Admin for any help.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default CustomerSidebar