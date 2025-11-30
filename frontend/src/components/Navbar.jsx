import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Navbar({ session }) {
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // FIXED: Read role from metadata (no DB query, no RLS)
      const role = session.user.user_metadata?.role
      setIsAdmin(role === 'admin')
    } else {
      setIsAdmin(false)
    }
  }, [session])

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="container header">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div className="brand">Theatre</div>
          <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link to="/">Home</Link>
            <Link to="/checkin">Check-in</Link>
            <Link to="/dashboard">Dashboard</Link>
            {isAdmin && <Link to="/admin" style={{ fontWeight: 'bold' }}>Admin</Link>}
          </nav>
        </div>

        <div className="nav-actions">
          {session?.user ? (
            <>
              <div className="small">
                Welcome, {session.user.user_metadata?.full_name || session.user.email}
              </div>
              <button className="btn" onClick={signOut}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn">Login</button></Link>
              <Link to="/signup"><button className="btn btn-primary">Sign up</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}