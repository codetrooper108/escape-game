import React, { useEffect } from 'react'
import './HelpModal.css'

function HelpModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const commands = [
    {
      command: 'examine [object]',
      description: 'Look closely at something',
      examples: ['examine desk', 'look at clock', 'check bookshelf', 'inspect painting']
    },
    {
      command: 'open [object]',
      description: 'Try to open or unlock something',
      examples: ['open desk', 'unlock door', 'open safe']
    },
    {
      command: 'use [item] on [object]',
      description: 'Use an item from your inventory',
      examples: ['use key on desk', 'use desk key', 'use golden key on door']
    },
    {
      command: 'read [item]',
      description: 'Read a book, diary, or document',
      examples: ['read diary', 'read book']
    },
    {
      command: 'set [object] to [value]',
      description: 'Adjust or set something to a specific value',
      examples: ['set clock to midnight', 'set clock to 12:00', 'adjust clock']
    },
    {
      command: 'remove [object]',
      description: 'Take down or remove something',
      examples: ['remove painting', 'take down picture']
    }
  ]

  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>📖 Help - Available Commands</h2>
          <button className="help-modal-close" onClick={onClose} aria-label="Close help">
            ×
          </button>
        </div>
        
        <div className="help-modal-body">
          <p className="help-intro">
            Type commands naturally - the game understands various phrasings. Here are the main command types:
          </p>
          
          {commands.map((cmd, idx) => (
            <div key={idx} className="help-command-item">
              <div className="help-command-header">
                <span className="help-command-name">• {cmd.command}</span>
                <span className="help-command-desc">- {cmd.description}</span>
              </div>
              <div className="help-examples">
                <span className="help-examples-label">Examples:</span>
                {cmd.examples.map((example, exIdx) => (
                  <code key={exIdx} className="help-example">
                    "{example}"
                  </code>
                ))}
              </div>
            </div>
          ))}
          
          <div className="help-tips">
            <h3>💡 Tips</h3>
            <ul>
              <li>You can use synonyms - "examine", "look at", "check", and "inspect" all work the same way</li>
              <li>If you have a key in your inventory, you can just say "open desk" - you don't need to specify using the key</li>
              <li>Click the hint button (💡) once per game if you're stuck</li>
              <li>Your inventory shows all items you've collected</li>
              <li>Press ESC or click outside this window to close</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal


