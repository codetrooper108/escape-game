import React from 'react'
import './Stats.css'

function Stats({ moves }) {
  return (
    <div className="stats-container">
      <div className="stat-item">
        <span className="stat-icon">👣</span>
        <span className="stat-label">Moves:</span>
        <span className="stat-value">{moves}</span>
      </div>
    </div>
  )
}

export default Stats





