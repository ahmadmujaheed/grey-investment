import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from "./pages/Login"
import DashboardLayout from "./layout/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Investment from "./pages/Investment"
import Users from "./pages/Users"
import Settings from './pages/Settings'
import Profile from './pages/Profile'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<DashboardLayout />} >
      <Route path="" element={<Dashboard />} />
      <Route path="investment" element={<Investment />} />
      <Route path="users" element={<Users />} />
      <Route path="settings" element={<Settings />} />
      <Route path="profile" element={<Profile />} />
      </Route>
      
    </Routes>
  )
}
export default App
