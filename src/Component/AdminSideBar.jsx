import { Users, BarChart2, LogOut } from 'lucide-react'

const menuItems = [
  { id: 'customer', label: 'Customer', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
]

function AdminSideBar({ activeTab, onSelectTab, onLogout }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200">
        <p className="text-sm font-semibold text-blue-600 tracking-wide">Admin Panel</p>
        <h1 className="text-[20px] font-bold text-gray-900 mt-1">WhatsappDocSync</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
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

export default AdminSideBar
