import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Success → redirect to home
      navigate('/')
    } catch (err) {
      setErrorMsg(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container card" style={{ maxWidth: '420px', margin: '40px auto' }}>
      <h2>Login</h2>
      <p className="small">Sign in to book tickets</p>

      <form onSubmit={handleLogin}>
        <div className="form-row">
          <label>Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <label>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Log in'}
          </button>
          <Link to="/signup">
            <button className="btn" type="button">Sign up</button>
          </Link>
        </div>
      </form>

      {errorMsg && (
        <div style={{ marginTop: '16px', color: 'red', fontSize: '14px' }}>
          {errorMsg}
        </div>
      )}
    </div>
  )
}