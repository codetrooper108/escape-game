import React, { useState, useEffect } from 'react'
import './InstallPrompt.css'

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check if prompt was dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstalled(true)
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('install-prompt-dismissed', Date.now().toString())
    setShowPrompt(false)
  }

  const handleIOSInstructions = () => {
    setShowPrompt(true)
  }

  if (isInstalled) {
    return null
  }

  if (isIOS && !showPrompt) {
    return (
      <button 
        className="install-prompt-ios"
        onClick={handleIOSInstructions}
        aria-label="Show install instructions"
      >
        📱 Install App
      </button>
    )
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="install-prompt-overlay">
      <div className="install-prompt">
        <button 
          className="install-prompt-close"
          onClick={handleDismiss}
          aria-label="Close"
        >
          ×
        </button>
        
        {isIOS ? (
          <div className="install-prompt-content">
            <h3>📱 Install on iOS</h3>
            <p>To install this app on your iPhone/iPad:</p>
            <ol>
              <li>Tap the <strong>Share</strong> button <span className="ios-icon">⎋</span> at the bottom</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top right</li>
            </ol>
            <p className="install-prompt-note">The app will then appear on your home screen!</p>
          </div>
        ) : (
          <div className="install-prompt-content">
            <h3>📱 Install App</h3>
            <p>Install Escape Room Adventure to your device for a better experience!</p>
            <div className="install-prompt-buttons">
              <button 
                className="install-prompt-button install-button"
                onClick={handleInstall}
              >
                Install Now
              </button>
              <button 
                className="install-prompt-button dismiss-button"
                onClick={handleDismiss}
              >
                Maybe Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InstallPrompt

