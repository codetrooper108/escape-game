// Game Rules Engine - JavaScript handles all game logic decisions
// AI only generates descriptions after rules are validated

// Helper function to check if player has an item in inventory
function hasItem(inventory, itemNames) {
  return inventory.some(item => 
    itemNames.some(name => 
      item.name.toLowerCase().includes(name.toLowerCase())
    )
  )
}

// Helper function to find item in inventory
function findItem(inventory, itemNames) {
  return inventory.find(item => 
    itemNames.some(name => 
      item.name.toLowerCase().includes(name.toLowerCase())
    )
  )
}

// Game Rules Engine - validates actions and updates state
export function processGameRule(action, gameState, inventory) {
  const { type, object, value, target } = action
  const roomState = gameState.roomState || gameState

  // RULE: Examine Clock
  if (type === 'examine' && object === 'clock') {
    if (!roomState.clockExamined) {
      return {
        success: true,
        description: 'The grandfather clock stands tall, its pendulum swinging rhythmically. The clock face shows the current time, and you notice it can be adjusted.',
        stateUpdates: {
          roomState: { clockExamined: true }
        }
      }
    }
    return {
      success: true,
      description: 'The clock continues its steady tick-tock, its hands pointing to the current time.'
    }
  }

  // RULE: Set Clock to Midnight (12:00)
  if (type === 'set' && object === 'clock') {
    const isMidnight = value === '1200' || value === '12:00' || 
                      action.originalCommand?.toLowerCase().includes('midnight') ||
                      action.originalCommand?.toLowerCase().includes('12')
    
    if (isMidnight) {
      if (!roomState.clockOpened) {
        return {
          success: true,
          description: 'You carefully turn the clock hands to midnight (12:00). With a soft click, a hidden compartment in the clock opens, revealing a small key!',
          stateUpdates: {
            roomState: { clockOpened: true, clockExamined: true },
            inventory: [...inventory, { name: 'Desk Key', icon: '🗝️' }]
          }
        }
      }
      return {
        success: true,
        description: 'The clock is already set to midnight, its secret already revealed.'
      }
    }
    return {
      success: false,
      error: 'You adjust the clock, but nothing happens. Perhaps you need to set it to a specific time?'
    }
  }

  // RULE: Open Clock
  if (type === 'open' && object === 'clock') {
    if (!roomState.clockExamined) {
      return {
        success: false,
        error: 'You should examine the clock more carefully first.'
      }
    }
    if (!roomState.clockOpened) {
      return {
        success: false,
        error: 'The clock appears to be locked or needs something specific to open it.'
      }
    }
    return {
      success: true,
      description: 'The clock compartment is already open and empty.'
    }
  }

  // RULE: Examine Bookshelf
  if (type === 'examine' && object === 'bookshelf') {
    if (!roomState.bookshelfExamined) {
      return {
        success: true,
        description: 'You scan the dusty bookshelf filled with old books. Among them, a leather-bound diary catches your eye. You can now examine or read it.',
        stateUpdates: {
          roomState: { bookshelfExamined: true, diaryFound: true }
        }
      }
    }
    return {
      success: true,
      description: 'You have already examined the bookshelf. The leather diary is still visible among the books.'
    }
  }

  // RULE: Read/Examine Diary
  if (object === 'diary' && (type === 'read' || type === 'examine' || type === 'open')) {
    const diaryAvailable = roomState.bookshelfExamined || roomState.diaryFound
    
    if (!diaryAvailable) {
      return {
        success: false,
        error: 'You do not see a diary here. Try examining the bookshelf first.'
      }
    }
    
    if (!roomState.diaryRead) {
      return {
        success: true,
        description: 'You carefully open the worn diary. Inside, written in elegant script: Time stands still at midnight. The old clock holds secrets for those who listen.',
        stateUpdates: {
          roomState: { diaryRead: true }
        }
      }
    }
    
    return {
      success: true,
      description: 'The diary message echoes in your mind: Time stands still at midnight.'
    }
  }

  // RULE: Examine Desk
  if (type === 'examine' && object === 'desk') {
    if (!roomState.deskExamined) {
      return {
        success: true,
        description: 'The desk is made of dark mahogany wood. It has a single drawer that appears to be locked.',
        stateUpdates: {
          roomState: { deskExamined: true }
        }
      }
    }
    return {
      success: true,
      description: 'The locked desk sits silently in the corner, waiting for the right key.'
    }
  }

  // RULE: Open Desk
  if (type === 'open' && object === 'desk') {
    if (roomState.deskOpened) {
      return {
        success: true,
        description: 'The desk drawer is already open and empty.'
      }
    }

    const hasDeskKey = hasItem(inventory, ['Desk Key', 'desk key'])
    if (hasDeskKey) {
      const deskKey = findItem(inventory, ['Desk Key', 'desk key'])
      return {
        success: true,
        description: 'You insert the desk key into the lock. It turns smoothly, and the drawer slides open. Inside, you find a gleaming golden key!',
        stateUpdates: {
          roomState: { deskOpened: true, deskUnlocked: true },
          inventory: inventory.filter(item => item.name !== deskKey.name).concat([{ name: 'Golden Key', icon: '🔑' }])
        }
      }
    }

    return {
      success: false,
      error: 'The desk is locked. You need to find a key.'
    }
  }

  // RULE: Use Key on Desk
  if (type === 'use' && (object === 'key' || object === 'desk key') && (target === 'desk' || !target)) {
    const hasDeskKey = hasItem(inventory, ['Desk Key', 'desk key'])
    if (hasDeskKey && !roomState.deskOpened) {
      const deskKey = findItem(inventory, ['Desk Key', 'desk key'])
      return {
        success: true,
        description: 'You use the desk key on the locked drawer. It opens smoothly, revealing a golden key inside!',
        stateUpdates: {
          roomState: { deskOpened: true, deskUnlocked: true },
          inventory: inventory.filter(item => item.name !== deskKey.name).concat([{ name: 'Golden Key', icon: '🔑' }])
        }
      }
    }
    if (roomState.deskOpened) {
      return {
        success: true,
        description: 'The desk is already open.'
      }
    }
    return {
      success: false,
      error: 'You do not have a desk key. You need to find it first.'
    }
  }

  // RULE: Examine Painting
  if (type === 'examine' && object === 'painting') {
    if (!roomState.paintingExamined) {
      return {
        success: true,
        description: 'The painting depicts a serene moonlit scene. You notice it is hanging loosely and could be removed.',
        stateUpdates: {
          roomState: { paintingExamined: true }
        }
      }
    }
    return {
      success: true,
      description: 'The moon painting watches over the room.'
    }
  }

  // RULE: Remove Painting
  if (type === 'remove' && object === 'painting') {
    if (!roomState.paintingRemoved) {
      return {
        success: true,
        description: 'You carefully lift the painting from the wall. Behind it, hidden in the shadows, you discover a safe embedded in the wall!',
        stateUpdates: {
          roomState: { paintingRemoved: true, safeFound: true }
        }
      }
    }
    return {
      success: true,
      description: 'The painting has already been removed, revealing the safe behind it.'
    }
  }

  // RULE: Examine Safe
  if (type === 'examine' && object === 'safe') {
    if (!roomState.safeFound) {
      return {
        success: false,
        error: 'You do not see a safe here. Try examining the painting.'
      }
    }
    return {
      success: true,
      description: 'The safe is embedded in the wall. It has a numeric keypad awaiting a 4-digit code.'
    }
  }

  // RULE: Open Safe
  if ((type === 'open' && object === 'safe') || (type === 'enter' && object === 'safe')) {
    if (!roomState.safeFound) {
      return {
        success: false,
        error: 'You do not see a safe here. Try examining the painting first.'
      }
    }
    if (value === '1200') {
      if (!roomState.safeOpened) {
        return {
          success: true,
          description: 'You enter the code 1200. The safe clicks open, but it is empty inside. A red herring!',
          stateUpdates: {
            roomState: { safeOpened: true }
          }
        }
      }
      return {
        success: true,
        description: 'The safe is already open and empty.'
      }
    }
    if (value) {
      return {
        success: false,
        error: 'The code does not work. The safe remains locked.'
      }
    }
    return {
      success: false,
      error: 'The safe requires a 4-digit code. Try open safe 1200 or enter 1200.'
    }
  }

  // RULE: Examine Door
  if (type === 'examine' && object === 'door') {
    if (!roomState.doorExamined) {
      return {
        success: true,
        description: 'The exit door is solid and locked. A golden keyhole glints in the dim light.',
        stateUpdates: {
          roomState: { doorExamined: true }
        }
      }
    }
    return {
      success: true,
      description: 'The locked door awaits the golden key.'
    }
  }

  // RULE: Open Door - WIN CONDITION
  if (type === 'open' && object === 'door') {
    const hasGoldenKey = hasItem(inventory, ['Golden Key', 'golden key'])
    if (hasGoldenKey || roomState.doorUnlocked) {
      return {
        success: true,
        win: true,
        description: 'You insert the golden key into the door lock. It turns with a satisfying click, and the door swings open!'
      }
    }
    return {
      success: false,
      error: 'The door is locked. You need a golden key to unlock it.'
    }
  }

  // RULE: Use Golden Key on Door - WIN CONDITION
  if (type === 'use' && (object === 'golden key' || object === 'key') && target === 'door') {
    const hasGoldenKey = hasItem(inventory, ['Golden Key', 'golden key'])
    if (hasGoldenKey) {
      return {
        success: true,
        win: true,
        description: 'You use the golden key on the door. The lock clicks open, and freedom awaits!'
      }
    }
    return {
      success: false,
      error: 'You do not have a golden key. You need to find it first.'
    }
  }

  // RULE: Examine Fireplace
  if (type === 'examine' && (object === 'fireplace' || action.originalCommand?.toLowerCase().includes('fireplace'))) {
    return {
      success: true,
      description: 'The stone fireplace is cold and has not been used in years. Ashes and dust fill the hearth. Nothing useful here.'
    }
  }

  // Default: Unknown command
  const validObjects = ['clock', 'desk', 'bookshelf', 'diary', 'painting', 'safe', 'door', 'fireplace']
  
  if (type && !object) {
    return {
      success: false,
      error: `What would you like to ${type}? Try: ${validObjects.slice(0, 5).map(obj => `${type} ${obj}`).join(', ')}`
    }
  }
  
  if (object && !validObjects.includes(object)) {
    return {
      success: false,
      error: `You do not see ${object} here. Visible objects: ${validObjects.join(', ')}. Try examining one of these.`
    }
  }
  
  return {
    success: false,
    error: 'I did not understand that. Try: examine [object], open [object], use [item] on [object], or type ? for help.'
  }
}