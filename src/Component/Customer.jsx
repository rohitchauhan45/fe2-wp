import { useState } from 'react'
import Navbar from './Navbar'
import CustomerSidebar from './CustomerSidebar'
import CustomerDetails from './CustomerDetails'
import CustomerGoogle from './CustomerGoogle'

const TABS = {
  DETAILS: 'details',
  GOOGLE: 'google-drive'
}

function Customer() {
  const [activeTab, setActiveTab] = useState(TABS.GOOGLE)

  const renderContent = () => {
    if (activeTab === TABS.DETAILS) {
      return <CustomerDetails />
    }

    return <CustomerGoogle layout="card" />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustomerSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 min-h-screen bg-gray-50">
        <Navbar variant="admin" />
        {renderContent()}
      </div>
    </div>
  )
}

export default Customer