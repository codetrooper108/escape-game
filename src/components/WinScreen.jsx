import React, { useState } from 'react'
import './WinScreen.css'

function WinScreen({ moves, inventory, onRestart }) {
  const [copySuccess, setCopySuccess] = useState(false)
  
  const gameUrl = window.location.origin
  const shareText = `I escaped the room in ${moves} moves! 🎉 Can you beat that?`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(gameUrl)}`
  const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(gameUrl)}&title=${encodeURIComponent(shareText)}`
  
  const copyToClipboard = () => {
    const textToCopy = `${shareText}\n${gameUrl}`
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

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

        <div className="share-section">
          <h3>Share Your Victory!</h3>
          <div className="share-buttons">
            <a 
              href={twitterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="share-button twitter"
            >
              🐦 Twitter
            </a>
            <a 
              href={redditUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="share-button reddit"
            >
              📱 Reddit
            </a>
            <button 
              onClick={copyToClipboard}
              className="share-button copy"
            >
              {copySuccess ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>

        <button className="play-again-button" onClick={onRestart}>
          🔄 Play Again
        </button>
      </div>
    </div>
  )
}

export default WinScreen