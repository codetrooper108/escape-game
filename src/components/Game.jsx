import React, { useState, useEffect, useRef } from 'react'
import { callHuggingFaceAPI } from '../services/huggingFaceAPI'
import { parseCommand } from '../utils/gameLogic'
import { processGameRule } from '../utils/gameRules'
import Inventory from './Inventory'
import Stats from './Stats'
import WinScreen from './WinScreen'
import HintButton from './HintButton'
import HelpButton from './HelpButton'
import './Game.css'

const INITIAL_STATE = {
  room: 'The Locked Study',
  inventory: [],
  moves: 0,
  hintsUsed: 0,
  roomState: {
    clockExamined: false,
    clockOpened: false,
    deskExamined: false,
    deskUnlocked: false,
    deskOpened: false,
    bookshelfExamined: false,
    diaryFound: false,
    diaryRead: false,
    paintingExamined: false,
    paintingRemoved: false,
    safeFound: false,
    safeOpened: false,
    doorExamined: false,
    doorUnlocked: false
  },
  currentScene: `You find yourself in a dimly lit study. The air is thick with mystery. A locked desk sits in the corner, a grandfather clock ticks steadily, and a bookshelf lines the wall. A painting of a moon hangs above the fireplace. The exit door stands before you, but it's locked tight.`
}

function Game() {
  const [gameState, setGameState] = useState(INITIAL_STATE)
  const [messages, setMessages] = useState([{
    type: 'system',
    text: INITIAL_STATE.currentScene
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showWinScreen, setShowWinScreen] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: Date.now() }])
  }

  const updateGameState = (updates) => {
    setGameState(prev => ({
      ...prev,
      inventory: updates.inventory !== undefined ? updates.inventory : prev.inventory,
      roomState: updates.roomState ? { ...prev.roomState, ...updates.roomState } : prev.roomState,
      hintsUsed: updates.hintsUsed !== undefined ? updates.hintsUsed : prev.hintsUsed,
      moves: updates.moves !== undefined ? updates.moves : prev.moves
    }))
  }

  const handleCommand = async (command) => {
    if (!command.trim()) return

    const lowerCommand = command.toLowerCase().trim()
    
    // Add player command to messages
    addMessage('player', command)

    setIsLoading(true)

    try {
      // STEP 1: Parse command (JavaScript - 100% deterministic)
      const parsed = parseCommand(command)
      
      // DEBUG: Log parsed command in development
      if (import.meta.env.DEV) {
        console.log('📥 Player command:', command)
        console.log('🔍 Parsed:', parsed)
      }
      
      // STEP 2: Process game rule (JavaScript - validates action, updates state)
      const ruleResult = processGameRule(parsed, { roomState: gameState.roomState }, gameState.inventory)
      
      // DEBUG: Log rule result
      if (import.meta.env.DEV) {
        console.log('✅ Rule result:', ruleResult)
      }
      
      if (ruleResult.success) {
        // Update game state with rule results
        if (ruleResult.stateUpdates) {
          updateGameState(ruleResult.stateUpdates)
        }

        // If win condition met
        if (ruleResult.win) {
          setShowWinScreen(true)
          addMessage('system', '🎉 The door creaks open! You\'ve escaped!')
          setIsLoading(false)
          return
        }

        // STEP 3: Get AI description (AI only generates description, not logic)
        const updatedInventory = ruleResult.stateUpdates?.inventory || gameState.inventory
        const updatedRoomState = ruleResult.stateUpdates?.roomState 
          ? { ...gameState.roomState, ...ruleResult.stateUpdates.roomState }
          : gameState.roomState

        const aiDescription = await callHuggingFaceAPI(
          command,
          ruleResult.description,
          updatedRoomState,
          updatedInventory,
          gameState.room
        )

        addMessage('system', aiDescription)
      } else {
        // Invalid command or action - show error (no AI needed)
        addMessage('system', ruleResult.error || 'You can\'t do that right now.')
      }
    } catch (error) {
      console.error('Error processing command:', error)
      addMessage('system', 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      setGameState(prev => ({ ...prev, moves: prev.moves + 1 }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading && !showWinScreen) {
      handleCommand(input)
      setInput('')
    }
  }

  const handleHint = () => {
    if (gameState.hintsUsed >= 1) {
      addMessage('system', 'You\'ve already used your hint for this game.')
      return
    }

    const hints = [
      'The diary mentions something about time standing still...',
      'Check the clock carefully - it might hold a secret.',
      'The desk is locked, but there might be a key somewhere...',
      'Sometimes paintings hide more than they show.',
      'Midnight is a special time...'
    ]

    const randomHint = hints[Math.floor(Math.random() * hints.length)]
    addMessage('system', `💡 Hint: ${randomHint}`)
    updateGameState({ hintsUsed: gameState.hintsUsed + 1 })
  }

  const handleRestart = () => {
    setGameState(INITIAL_STATE)
    setMessages([{
      type: 'system',
      text: INITIAL_STATE.currentScene
    }])
    setShowWinScreen(false)
    setInput('')
  }

  if (showWinScreen) {
    return (
      <WinScreen
        moves={gameState.moves}
        inventory={gameState.inventory}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <div className="game-container">
      <HelpButton />
      <div className="game-header">
        <h1>🔐 Escape Room Adventure</h1>
        <Stats moves={gameState.moves} />
      </div>

      <div className="game-content">
        <div className="messages-container">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.type}`}>
              {msg.type === 'player' && <span className="player-prefix">You: </span>}
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message message-system">
              <span className="typing-indicator">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Inventory items={gameState.inventory} />

        <div className="input-section">
          <HintButton
            onHint={handleHint}
            used={gameState.hintsUsed >= 1}
          />
          <form onSubmit={handleSubmit} className="command-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a command (e.g., 'examine desk', 'open door')..."
              className="command-input"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Game

