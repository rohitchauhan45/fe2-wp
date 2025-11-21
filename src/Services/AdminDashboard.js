import axios from 'axios'

export const getAllCustomer = async (userName = '', time = '') => {
    try {

        const token = localStorage.getItem('whatsappDocsToken')
        const params = new URLSearchParams()

        if (userName && userName.trim()) {
            params.append('userName', userName.trim())
        }

        if (time) {
            params.append('time', time)
        }

        const queryString = params.toString()
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
        const response = await axios.get(`${apiUrl}/admin${queryString ? `?${queryString}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.data
        console.log("data : ", data)
        return data
    } catch (error) {
        console.error("Error getting all customers:", error)
        return { success: false, message: 'Error fetching customers' }
    }
}

export const getLastLoginRegister = async (time = 'today') => {
    try {
        const token = localStorage.getItem('whatsappDocsToken')
        const params = new URLSearchParams()

        if (time) {
            params.append('time', time)
        }

        const queryString = params.toString()
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
        const response = await axios.get(`${apiUrl}/admin/last-login-register${queryString ? `?${queryString}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.data
        return data
    } catch (error) {
        console.error("Error getting last login/register:", error)
        return { success: false, message: 'Error getting last login/register' }
    }
}

export const getUserDocuments = async (time) => {
    try {
        const token = localStorage.getItem('whatsappDocsToken')
        const params = new URLSearchParams()

        if (time) {
            params.append('time', time)
        }

        const queryString = params.toString()
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
        const response = await axios.get(`${apiUrl}/admin/documents${queryString ? `?${queryString}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.data
        return data
    } catch (error) {
        console.error("Error getting user documents:", error)
        return { success: false, message: 'Error getting user documents' }
    }
}

export const ChnageCustomerStatus = async(id)=>{
    try {
        const token = localStorage.getItem('whatsappDocsToken')
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
        const response = await axios.put(`${apiUrl}/admin/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.data
        return data
    }
    catch (error) {
        console.error("Error changing customer status:", error)
        return { success: false, message: 'Error changing customer status' }
    }
}

