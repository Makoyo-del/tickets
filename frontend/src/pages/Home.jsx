import React, { useEffect, useState } from 'react'
import EventCard from '../components/EventCard'
import { supabase } from '../lib/supabaseClient'

export default function Home({ session }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true })
      .limit(50)

    setLoading(false)

    if (error) {
      console.error(error)
      return
    }

    setEvents(data || [])
  }

  return (
    <div>
      <div className="header">
        <div>
          <h1>Upcoming events</h1>
          <div className="small">Browse events and reserve seats</div>
        </div>

        <div>
          {session?.user ? (
            <div className="small">
              Welcome, {session.user.user_metadata?.full_name || session.user.email}
            </div>
          ) : null}
        </div>
      </div>

      <div className="events-list">
        {loading ? (
          <div className="card">Loading...</div>
        ) : events.length ? (
          events.map(ev => <EventCard key={ev.id} event={ev} />)
        ) : (
          <div className="card">No upcoming events.</div>
        )}
      </div>
    </div>
  )
}
