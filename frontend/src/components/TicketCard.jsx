import React from 'react'

export default function TicketCard({ ticket, qrDataUrl, onDownload }) {
  return (
    <div className="ticket-card card">
      <h3>{ticket.event_title}</h3>
      <div className="small">Seat: {ticket.seat_label}</div>
      <div className="small">Code: {ticket.code}</div>
      <div className="small">Name: {ticket.full_name}</div>
      <div className="small">Email: {ticket.email}</div>

      <div className="center">
        {qrDataUrl ? <img className="ticket-qr" src={qrDataUrl} alt="qr" /> : <div className="small">Generating QR…</div>}
      </div>

      <div style={{display:'flex',gap:8, justifyContent:'center'}}>
        <button className="btn" onClick={onDownload}>Download PDF</button>
      </div>
    </div>
  )
}
