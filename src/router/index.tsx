import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from '../pages/Auth/SignUp'
import Login from '../pages/Auth/Login'
import Customer from '../Component/Customer'
import Admin from '../Component/Admin'
import ProtectedRoute from '../Component/ProtectedRoute'
import React from 'react'

function Router() {
  return (
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
  )
}

export default Router
