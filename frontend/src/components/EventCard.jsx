import React from 'react'
import { Link } from 'react-router-dom'

export default function EventCard({ event }) {
  return (
    <div className="event-item card">
      <div className="event-meta">
        <div style={{fontWeight:700}}>{event.title}</div>
        <div className="small">{new Date(event.start_time).toLocaleString()} • {event.venue}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:8}}>
        <div className="small">Seats: {event.total_seats}</div>
        <Link to={`/event/${event.id}`}><button className="btn btn-primary">View</button></Link>
      </div>
    </div>
  )
}
