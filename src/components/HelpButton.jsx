import React, { useState } from 'react'
import HelpModal from './HelpModal'
import './HelpButton.css'

function HelpButton() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <button
        className="help-button"
        onClick={() => setShowHelp(true)}
        aria-label="Show help"
        title="Show help"
      >
        ?
      </button>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  )
}

export default HelpButton


