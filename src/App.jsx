import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './Component/Signup'
import Login from './Component/Login'
import Customer from './Component/Customer'
import Admin from './Component/Admin'
import ProtectedRoute from './Component/ProtectedRoute'
import './App.css'

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute navbarVariant="admin">
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute navbarVariant="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
