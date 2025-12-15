import React from 'react'
import './WinScreen.css'

function WinScreen({ moves, inventory, onRestart }) {
  return (
    <div className="win-screen">
      <div className="win-content">
        <div className="win-icon">🎉</div>
        <h1 className="win-title">Congratulations!</h1>
        <p className="win-message">You've successfully escaped The Locked Study!</p>
        
        <div className="win-stats">
          <div className="win-stat">
            <span className="win-stat-label">Total Moves:</span>
            <span className="win-stat-value">{moves}</span>
          </div>
          <div className="win-stat">
            <span className="win-stat-label">Items Collected:</span>
            <span className="win-stat-value">{inventory.length}</span>
          </div>
        </div>

        {inventory.length > 0 && (
          <div className="win-inventory">
            <h3>Your Collection:</h3>
            <div className="win-items">
              {inventory.map((item, idx) => (
                <div key={idx} className="win-item">
                  {item.icon || '📦'} {item.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="restart-button" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  )
}

export default WinScreen





