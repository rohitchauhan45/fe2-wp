const menuItems = [
  { id: 'details', label: 'Your Details' },
  { id: 'google-drive', label: 'Google-Drive' }
]

function CustomerSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen h-screen sticky top-0 flex flex-col">
      <div className="px-6 py-6 border-b border-gray-200">
        <p className="text-sm font-semibold text-blue-600 tracking-wide">Customer Panel</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Store Docs</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="text-base font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-4 py-6 border-t border-gray-200">
        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-sm font-semibold text-blue-900">Need Help?</p>
          <p className="text-xs text-blue-700 mt-1">
            Switch between your details and Google Drive settings anytime.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default CustomerSidebar