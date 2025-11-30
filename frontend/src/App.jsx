import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import EventDetails from './pages/EventDetails'
import Checkout from './pages/Checkout'
import Ticket from './pages/Ticket'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import AdminPanel from './pages/AdminPanel'   // <-- NEW

export default function App() {
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session && window.location.pathname.startsWith('/dashboard')) {
      navigate('/login')
    }
  }, [session, navigate])

  return (
    <div className="app-root">
      <Navbar session={session} />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/event/:id" element={<EventDetails session={session} />} />
          <Route path="/checkout/:ticketId" element={<Checkout session={session} />} />
          <Route path="/ticket/:code" element={<Ticket session={session} />} />
          <Route path="/dashboard" element={<Dashboard session={session} />} />
          <Route path="/checkin" element={<CheckIn session={session} />} />
          <Route path="/admin" element={<AdminPanel session={session} />} />  {/* NEW */}
        </Routes>
      </main>
    </div>
  )
}