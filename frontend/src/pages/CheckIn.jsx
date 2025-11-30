import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function CheckIn() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  async function check() {
    setResult(null)
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('code', code)
      .single()
    if (error || !data) return setResult({ ok: false, message: 'Ticket not found' })
    if (data.status === 'checked_in') return setResult({ ok: false, message: 'Ticket already checked in' })

    const { error: e2 } = await supabase
      .from('tickets')
      .update({ status: 'checked_in' })
      .eq('id', data.id)

    if (e2) return setResult({ ok: false, message: 'Failed to check in' })
    setResult({ ok: true, message: `Checked in ${data.code} • seat ${data.seat_id}` })
  }

  return (
    <div className="card">
      <h3>Check-in</h3>
      <div className="form-row">
        <label>Ticket code (or scanned)</label>
        <input className="input" value={code} onChange={e=>setCode(e.target.value)} />
      </div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn btn-primary" onClick={check}>Verify & Check-in</button>
      </div>

      {result && (
        <div style={{marginTop:12}} className="card">
          <div style={{fontWeight:700}}>{result.ok ? 'Success' : 'Error'}</div>
          <div className="small">{result.message}</div>
        </div>
      )}
    </div>
  )
}
