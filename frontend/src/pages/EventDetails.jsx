import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import SeatGrid from '../components/SeatGrid'

export default function EventDetails({ session }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvent()
  }, [id])

  async function fetchEvent() {
    setLoading(true)
    const { data: ev } = await supabase.from('events').select('*').eq('id', id).single()
    const { data: seatData } = await supabase.from('seats').select('*').eq('event_id', id).order('seat_label')
    setEvent(ev)
    setSeats(seatData || [])
    setLoading(false)
  }

  function toggleSeat(seat) {
    setSelected(prev => {
      if (prev.includes(seat.id)) return prev.filter(x => x !== seat.id)
      return [...prev, seat.id]
    })
  }

  async function reserve() {
    if (!session) return navigate('/login')
    if (!selected.length) return alert('Please select at least one seat')

    const { data, error } = await supabase.rpc('reserve_seats', {
      p_user_id: session.user.id,
      p_event_id: id,
      p_seat_ids: selected
    })

    // FIXED: Handle both RPC exceptions AND Supabase 409/500 errors
    if (error || !data || !Array.isArray(data) || data.length === 0) {
      console.error('Reservation error:', error)
      const msg = error?.message || 'Reservation failed – please try again'
      alert(msg)
      // Optional: refresh seats to reflect any partial changes
      fetchEvent()
      return
    }

    // Success! data is now uuid[] → take first ticket
    const firstTicketId = data[0]

    alert('Seats reserved successfully!')
    navigate(`/checkout/${firstTicketId}`)
  }

  if (loading) return <div className="card">Loading event...</div>
  if (!event) return <div className="card">Event not found</div>

  return (
    <div>
      <div className="header">
        <div>
          <h2>{event.title}</h2>
          <div className="small">
            {new Date(event.start_time).toLocaleString()} • {event.venue}
          </div>
        </div>
        <div>
          {session?.user && (
            <div className="small">
              Welcome, {session.user.user_metadata?.full_name || session.user.email}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div className="small">Choose your seats</div>
            <div style={{ fontWeight: 700, fontSize: '1.2em' }}>{event.title}</div>
          </div>
          <div className="small">Selected: {selected.length}</div>
        </div>

        <SeatGrid seats={seats} selected={selected} onToggle={toggleSeat} />

        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={reserve} disabled={selected.length === 0}>
            Reserve & Checkout ({selected.length} seat{selected.length !== 1 ? 's' : ''})
          </button>
          <button className="btn" onClick={() => setSelected([])} disabled={selected.length === 0}>
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  )
}