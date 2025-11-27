import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import Navbar from './Navbar'
import CustomerSidebar from './CustomerSidebar'
import CustomerFolder from './CustomerFolder'
import CustomerGoogle from './CustomerGoogle'

const TABS = {
  DETAILS: 'my-documents',
  GOOGLE: 'connect'
}

const TAB_TITLES = {
  [TABS.DETAILS]: 'My Documents',
  [TABS.GOOGLE]: 'Connect'
}

function Customer() {
  const [activeTab, setActiveTab] = useState(TABS.GOOGLE)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const renderContent = () => {
    if (activeTab === TABS.DETAILS) {
      return <CustomerFolder />
    }

    return <CustomerGoogle layout="card" />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <CustomerSidebar 
          activeTab={activeTab} 
          onTabChange={(tab) => {
            setActiveTab(tab)
            setIsSidebarOpen(false)
          }} 
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-50 w-full lg:w-auto">
        {/* Mobile Menu Button - Only show when sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        )}
        <Navbar variant="customer" title={TAB_TITLES[activeTab] || 'WhatsAppBotDocs'} />
        {renderContent()}
      </div>
    </div>
  )
}

export default Customer