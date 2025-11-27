import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isTokenValid, getUserType, removeToken } from '../utils/auth.js'
import Navbar from './Navbar.jsx'
import AdminSideBar from './AdminSideBar.jsx'
import AdminAnalyting from './AdminAnalyting.jsx'
import AdminDashboard from './AdminDashboard.jsx'

const TABS = {
  CUSTOMER: 'customer',
  ANALYTICS: 'analytics'
}

const TAB_TITLES = {
  [TABS.CUSTOMER]: 'Customer',
  [TABS.ANALYTICS]: 'Analytics'
}

function Admin() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('customer')

  useEffect(() => {
    if (!isTokenValid()) {
      navigate('/login')
      return
    }

    const userType = getUserType()
    if (userType !== 'Admin') {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const renderContent = () => {
    if (activeTab === 'analytics') {
      return <AdminAnalyting />
    }
    return <AdminDashboard />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSideBar activeTab={activeTab} onSelectTab={setActiveTab} onLogout={handleLogout} />
      <div className="flex-1 min-h-screen">
        <Navbar variant="admin" title={TAB_TITLES[activeTab] || 'WhatsAppBotDocs'} />
        {renderContent()}
      </div>
    </div>
  )
}

export default Admin
