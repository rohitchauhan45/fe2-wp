import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isTokenValid, getUserType, removeToken } from '../utils/auth.js'
import { getAllCustomer, ChnageCustomerStatus } from '../Services/AdminDashboard.js'
import { Search, Phone, User, File } from 'lucide-react'

function AdminDashboard() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // Check if user is authenticated and is Admin
    if (!isTokenValid()) {
      navigate('/login')
      return
    }

    const userType = getUserType()
    if (userType !== 'Admin') {
      // Redirect to regular dashboard if not Admin
      navigate('/dashboard')
      return
    }

    // Fetch all customers
    fetchCustomers('')
  }, [navigate])

  const fetchCustomers = async (query) => {
    try {
      setIsLoading(true)
      setError('')
      const data = await getAllCustomer(query ?? '')
      
      if (data.success && data.customers) {
        setCustomers(data.customers)
      } else {
        setError(data.message || 'Failed to fetch customers')
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to load customers. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (customerId) => {
    try {
      setSuccessMessage('')
      setError('')
      const data = await ChnageCustomerStatus(customerId)
      
      if (data.success) {
        setSuccessMessage(data.message || 'Customer status updated successfully')
        // Refresh the customer list
        await fetchCustomers(searchTerm)
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.message || 'Failed to update customer status')
      }
    } catch (err) {
      console.error('Error changing customer status:', err)
      setError('Failed to update customer status. Please try again.')
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomers(searchTerm)
    }, 400)

    return () => clearTimeout(delayDebounce)
  }, [searchTerm])

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <div className="flex-1 min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pt-28 flex flex-col items-center">
        {/* Success Message */}
        {successMessage && (
          <div className="w-full mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Customers Table */}
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">All Customers</h2>
            <div className="flex items-stretch gap-2 w-full sm:w-auto">
              <div className="flex items-center flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-3xl focus-within:ring-2 focus-within:ring-blue-500 bg-white">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search by user name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DOCS
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {customer.phoneNumber.slice(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-4 h-4 text-gray-500" />
                          {customer.userName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1 text-[15px] font-semibold rounded-full ${
                            customer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center w-36">
                        <div className="flex items-center justify-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          {customer._count?.documents || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {customer.createdAt
                          ? (() => {
                              const date = new Date(customer.createdAt)
                              const day = date.getDate()
                              const month = date
                                .toLocaleString('en-GB', { month: 'short' })
                                .replace(/^\w/, (c) => c.toUpperCase())
                              const year = date.getFullYear()
                              return `${day}-${month}-${year}`
                            })()
                          : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => handleStatusChange(customer.id)}
                          className={`px-3 py-1 rounded-lg transition-colors ${
                            customer.status === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {customer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard

