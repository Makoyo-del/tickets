import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({ sales: 0, unclaimed: 0, checked_in: 0 })
  const [unclaimedList, setUnclaimedList] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const { count: salesCount } = await supabase.from('payments').select('*', { count: 'exact' })
    const { data: unclaimed } = await supabase.from('tickets').select('id,code,created_at,seat_id,event_id').eq('status', 'reserved')
    const { data: checked } = await supabase.from('tickets').select('*').eq('status', 'checked_in')
    setStats({ sales: salesCount || 0, unclaimed: unclaimed?.length || 0, checked_in: checked?.length || 0 })
    setUnclaimedList(unclaimed || [])
  }

  return (
    <div>
      <div className="header">
        <div>
          <h2>Dashboard</h2>
          <div className="small">Sales and ticket management</div>
        </div>
      </div>

      <div className="grid cols-3">
        <div className="card"> <div className="small">Sales</div> <div style={{fontWeight:700}}>{stats.sales}</div> </div>
        <div className="card"> <div className="small">Unclaimed</div> <div style={{fontWeight:700}}>{stats.unclaimed}</div> </div>
        <div className="card"> <div className="small">Checked in</div> <div style={{fontWeight:700}}>{stats.checked_in}</div> </div>
      </div>

      <div style={{marginTop:16}}>
        <h3>Unclaimed tickets</h3>
        <div className="card">
          {unclaimedList.length ? (
            <ul>
              {unclaimedList.map(t => <li key={t.id} className="small">{t.code} — {new Date(t.created_at).toLocaleString()}</li>)}
            </ul>
          ) : <div className="small">No unclaimed tickets</div>}
        </div>
      </div>
    </div>
  )
}
