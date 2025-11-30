import React from 'react'

export default function SeatGrid({ seats, selected, onToggle }) {
  return (
    <div className="seat-grid">
      {seats.map(s => {
        const taken = s.is_reserved
        const isSel = selected.includes(s.id)
        return (
          <div
            key={s.id}
            className={`seat ${taken ? 'taken' : ''} ${isSel ? 'selected' : ''}`}
            onClick={() => { if (!taken) onToggle(s) }}
            title={`${s.seat_label} — ${s.price}`}
          >
            {s.seat_label}
          </div>
        )
      })}
    </div>
  )
}
