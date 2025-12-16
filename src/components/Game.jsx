import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  
  // CRITICAL FIX: Use ref to track current state for immediate access
  // This ensures we always use the latest state, even before React re-renders
  const gameStateRef = useRef(gameState)
  
  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState
    if (import.meta.env.DEV) {
      console.log('📌 State ref updated:', {
        bookshelfExamined: gameState.roomState.bookshelfExamined,
        diaryFound: gameState.roomState.diaryFound
      })
    }
  }, [gameState])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // DEBUG: Monitor state changes for bookshelf
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🔄 Game state updated:', {
        bookshelfExamined: gameState.roomState.bookshelfExamined,
        diaryFound: gameState.roomState.diaryFound,
        inventory: gameState.inventory.map(i => i.name)
      })
    }
  }, [gameState.roomState.bookshelfExamined, gameState.roomState.diaryFound, gameState.inventory])

  const addMessage = (type, text) => {
    setMessages(prev => [...prev, { type, text, timestamp: Date.now() }])
  }

  const updateGameState = (updates) => {
    setGameState(prev => {
      const newState = {
        ...prev,
        inventory: updates.inventory !== undefined ? updates.inventory : prev.inventory,
        roomState: updates.roomState ? { ...prev.roomState, ...updates.roomState } : prev.roomState,
        hintsUsed: updates.hintsUsed !== undefined ? updates.hintsUsed : prev.hintsUsed,
        moves: updates.moves !== undefined ? updates.moves : prev.moves
      }
      
      // CRITICAL FIX: Update ref immediately so next command uses latest state
      gameStateRef.current = newState
      
      // DEBUG: Log state update
      if (import.meta.env.DEV) {
        console.log('🔄 State update:', {
          before: prev.roomState,
          after: newState.roomState,
          updates: updates
        })
        if (updates.roomState?.bookshelfExamined !== undefined) {
          console.log('✅ Bookshelf examined flag set to:', updates.roomState.bookshelfExamined)
          console.log('📌 Ref updated immediately - next command will use new state')
        }
      }
      
      return newState
    })
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
      // CRITICAL FIX: Use ref to get the LATEST state, not the stale closure value
      // This ensures we use the state that was just updated by the previous command
      const currentState = gameStateRef.current
      const ruleResult = processGameRule(parsed, { roomState: currentState.roomState }, currentState.inventory)
      
      // DEBUG: Verify we're using the latest state
      if (import.meta.env.DEV) {
        console.log('🔍 State used for rule check:', {
          fromRef: currentState.roomState.bookshelfExamined,
          fromState: gameState.roomState.bookshelfExamined,
          match: currentState.roomState.bookshelfExamined === gameState.roomState.bookshelfExamined
        })
      }
      
      // DEBUG: Log rule result
      if (import.meta.env.DEV) {
        console.log('✅ Rule result:', ruleResult)
        console.log('📊 Current state before update:', gameState.roomState)
      }
      
      if (ruleResult.success) {
        // Update game state with rule results IMMEDIATELY
        if (ruleResult.stateUpdates) {
          // DEBUG: Log what we're about to update
          if (import.meta.env.DEV) {
            console.log('🔄 About to apply state updates:', ruleResult.stateUpdates)
            if (ruleResult.stateUpdates.roomState?.bookshelfExamined !== undefined) {
              console.log('📚 Setting bookshelfExamined to:', ruleResult.stateUpdates.roomState.bookshelfExamined)
            }
          }
          
          // Apply state updates - React will batch this
          updateGameState(ruleResult.stateUpdates)
          
          // DEBUG: Verify update was scheduled
          if (import.meta.env.DEV) {
            console.log('✅ State update function called - React will apply on next render')
          }
        }

        // If win condition met
        if (ruleResult.win) {
          setShowWinScreen(true)
          addMessage('system', '🎉 The door creaks open! You\'ve escaped!')
          setIsLoading(false)
          return
        }

        // STEP 3: Get AI description (AI only generates description, not logic)
        // CRITICAL FIX: Use ref to get latest state, then merge with updates
        const currentStateForAI = gameStateRef.current
        const updatedInventory = ruleResult.stateUpdates?.inventory || currentStateForAI.inventory
        const updatedRoomState = ruleResult.stateUpdates?.roomState 
          ? { ...currentStateForAI.roomState, ...ruleResult.stateUpdates.roomState }
          : currentStateForAI.roomState

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

