// src/pages/AdminPanel.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function AdminPanel({ session }) {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [venue, setVenue] = useState('')
  const [rows, setRows] = useState('A,B,C,D,E')
  const [seatsPerRow, setSeatsPerRow] = useState('10')
  const [pricePerRow, setPricePerRow] = useState('80,70,60,50,40')

  useEffect(() => {
    if (!session?.user) {
      navigate('/login')
      return
    }

    // FIXED: No DB query – read role directly from auth metadata
    const userRole = session.user.user_metadata?.role
    if (userRole !== 'admin') {
      alert('Access denied. Only admins can use this page.')
      navigate('/')
      return
    }

    fetchEvents()
  }, [session, navigate])

  async function fetchEvents() {
    const { data } = await supabase
      .from('events')
      .select('id, title, start_time, venue, total_seats')
      .order('start_time', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  async function createEvent(e) {
    e.preventDefault()
    if (!title || !venue || !startTime) return alert('Please fill Title, Venue and Date/Time')

    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        start_time: startTime,
        venue,
        total_seats: 0
      })
      .select()
      .single()

    if (error) return alert('Error creating event: ' + error.message)

    await generateSeats(newEvent.id)
    alert(`Event "${title}" created successfully with seats!`)
    fetchEvents()
    setTitle('')
    setDescription('')
    setStartTime('')
    setVenue('')
  }

  async function generateSeats(eventId) {
    const rowArray = rows.split(',').map(r => r.trim())
    const priceArray = pricePerRow.split(',').map(p => parseFloat(p.trim()) || 40)
    const seatsPer = parseInt(seatsPerRow) || 10

    const seatsToInsert = []
    rowArray.forEach((row, index) => {
      for (let i = 1; i <= seatsPer; i++) {
        seatsToInsert.push({
          event_id: eventId,
          seat_label: row + i,
          price: priceArray[index] || 40,
          is_reserved: false
        })
      }
    })

    const { error } = await supabase.from('seats').insert(seatsToInsert)
    if (error) console.error('Seat insert error:', error)
  }

  if (loading) return <div className="card">Loading admin panel...</div>

  return (
    <div>
      <h1>Admin Panel</h1>
      <p className="small">Create new events and generate seats</p>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginTop: 0 }}>Create New Event</h3>
        <form onSubmit={createEvent}>
          <div className="form-row">
            <label>Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Description</label>
            <textarea className="input" rows="2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Date & Time *</label>
            <input className="input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Venue *</label>
            <input className="input" value={venue} onChange={e => setVenue(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Rows (comma-separated)</label>
            <input className="input" value={rows} onChange={e => setRows(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Seats per row</label>
            <input className="input" type="number" value={seatsPerRow} onChange={e => setSeatsPerRow(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Price per row (comma-separated)</label>
            <input className="input" value={pricePerRow} onChange={e => setPricePerRow(e.target.value)} />
          </div>

          <button className="btn btn-primary" type="submit" style={{ marginTop: '12px' }}>
            Create Event + Generate Seats
          </button>
        </form>
      </div>

      <h3>Existing Events</h3>
      {events.length === 0 ? (
        <div className="card">No events yet. Create one above!</div>
      ) : (
        <div className="events-list">
          {events.map(ev => (
            <div key={ev.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px' }}>
              <div>
                <strong>{ev.title}</strong><br />
                <span className="small">
                  {new Date(ev.start_time).toLocaleString()} • {ev.venue}
                </span>
              </div>
              <div className="small">
                {ev.total_seats || '??'} seats
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}