import React from 'react'
import './HintButton.css'

function HintButton({ onHint, used }) {
  return (
    <button
      className={`hint-button ${used ? 'hint-used' : ''}`}
      onClick={onHint}
      disabled={used}
    >
      <span className="hint-icon">💡</span>
      <span className="hint-text">{used ? 'Hint Used' : 'Get Hint'}</span>
    </button>
  )
}

export default HintButton





