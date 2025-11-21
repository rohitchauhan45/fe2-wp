import axios from "axios"

export const getUserDetails = async()=>{
    try {
        const token = localStorage.getItem('whatsappDocsToken')
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'
        const response = await axios.get(`${apiUrl}/auth/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        const data = await response.data
        return data
    } catch (error) {
        console.error("Error getting customer detail:", error)
        return { success: false, message: 'Error getting customer detail' }
    }
}

export const getCustomerDetails = async() =>{
    try {
        const token = localStorage.getItem('whatsappDocsToken')
        const apiUrl = import.meta.env.VITE_API_URL || 'https://store-documents.vercel.app/api'

        const response = await axios.get(`${apiUrl}/customer`,{
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        const data = await response.data
        return data
    } catch (error) {
        console.error("Error getting customer details:",error)
        return { success: false, message: 'Error getting customer details' }
    }
}

