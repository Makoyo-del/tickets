import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()

  async function handleSignup(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role }  // FIXED: Store role in metadata (no RLS loop)
        }
      })

      if (error) throw error

      if (!data.user) {
        setErrorMsg('Check your email for confirmation!')
        return
      }

      // No upsert to public.users – metadata is enough for admin checks

      alert('Account created! Check your email to confirm, then log in.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container card" style={{ maxWidth: '420px', margin: '40px auto' }}>
      <h2>Create account</h2>

      <form onSubmit={handleSignup}>
        <div className="form-row">
          <label>Full name</label>
          <input
            className="input"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

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
          <label>Password (min 6 chars)</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength="6"
            required
          />
        </div>

        <div className="form-row">
          <label>Role</label>
          <select className="input" value={role} onChange={e => setRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Sign up'}
          </button>
          <Link to="/login">
            <button className="btn" type="button">Back to login</button>
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