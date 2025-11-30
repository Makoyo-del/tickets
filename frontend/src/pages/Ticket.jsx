import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import QRCode from 'qrcode'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Ticket() {
  const { code } = useParams()
  const [ticket, setTicket] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTicket()
  }, [code])

  async function loadTicket() {
    setLoading(true)
    try {
      // FIXED: Separate queries – no joins, no FK dependency, no 400/500
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('id, code, seat_id, event_id')
        .eq('code', code)
        .single()

      if (ticketError || !ticketData) throw new Error('Ticket not found')

      const { data: seatData, error: seatError } = await supabase
        .from('seats')
        .select('seat_label, price')
        .eq('id', ticketData.seat_id)
        .single()

      if (seatError || !seatData) throw new Error('Seat details not found')

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('title, start_time, venue')
        .eq('id', ticketData.event_id)
        .single()

      if (eventError || !eventData) throw new Error('Event details not found')

      setTicket({
        code: ticketData.code,
        seat_label: seatData.seat_label,
        price: seatData.price,
        event_title: eventData.title,
        venue: eventData.venue,
        date: new Date(eventData.start_time).toLocaleDateString(),
        full_name: 'Guest',  // Optional: Fetch from session or metadata
        email: 'N/A'
      })

      // Generate QR
      const payload = JSON.stringify({ code: ticketData.code, ticketId: ticketData.id })
      const url = await QRCode.toDataURL(payload)
      setQrDataUrl(url)
    } catch (err) {
      console.error('Ticket load error:', err)
      alert('Invalid or expired ticket: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function downloadPdf() {
    const node = document.querySelector('#ticket-card')
    if (!node) return
    const canvas = await html2canvas(node, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`ticket-${ticket?.code || 'ticket'}.pdf`)
  }

  if (loading) return <div className="card center">Loading ticket...</div>
  if (!ticket) return <div className="card center">Invalid ticket</div>

  return (
    <div className="center" style={{ padding: '20px' }}>
      <div id="ticket-card" className="ticket-card card">
        <h3>{ticket.event_title}</h3>
        <div className="small">Seat: {ticket.seat_label}</div>
        <div className="small">Code: {ticket.code}</div>
        <div className="small">Name: {ticket.full_name}</div>
        <div className="small">Email: {ticket.email}</div>

        <div className="center">
          {qrDataUrl ? <img className="ticket-qr" src={qrDataUrl} alt="QR" /> : <div className="small">Generating QR…</div>}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn" onClick={downloadPdf}>Download PDF</button>
        </div>
      </div>
    </div>
  )
}