// Command Parser - Interprets player input to extract action, object, and context
// This is pure parsing - no game logic decisions

export function parseCommand(command) {
  // Strip articles (the, a, an) and normalize
  let normalized = command.toLowerCase().trim()
  normalized = normalized.replace(/\b(the|a|an)\s+/gi, ' ')
  normalized = normalized.replace(/\s+/g, ' ').trim()

  const lower = normalized

  // DEBUG MODE: Log parsed command
  if (import.meta.env.DEV) {
    console.log('🔍 Parsing command:', command)
    console.log('📝 Normalized:', normalized)
  }

  // Action verbs with synonyms
  const actionPatterns = {
    examine: ['examine', 'look at', 'look', 'check', 'inspect', 'view', 'see', 'study', 'observe'],
    open: ['open', 'unlock', 'unseal', 'unlatch'],
    use: ['use', 'try', 'apply', 'utilize'],
    read: ['read', 'look through', 'peruse', 'scan'],
    set: ['set', 'adjust', 'change', 'move to', 'turn to', 'set to', 'turn'],
    remove: ['remove', 'take down', 'pull', 'lift', 'take off'],
    take: ['take', 'grab', 'pick up', 'get', 'collect'],
    enter: ['enter', 'type', 'input', 'put in', 'dial'],
  }

  // Objects in the game - expanded with more synonyms
  const objectPatterns = {
    desk: ['desk', 'wooden desk', 'table', 'drawer', 'drawers'],
    clock: ['clock', 'grandfather clock', 'timepiece', 'time', 'grandfather'],
    bookshelf: ['bookshelf', 'shelf', 'bookcase', 'books', 'shelves'],
    diary: ['diary', 'book', 'journal', 'notebook', 'leather diary', 'small diary'],
    painting: ['painting', 'picture', 'moon', 'art', 'frame', 'moon painting', 'picture frame'],
    safe: ['safe', 'vault', 'lockbox'],
    door: ['door', 'exit', 'way out', 'exit door'],
    key: ['key', 'desk key', 'golden key'],
  }

  // List of all valid objects for error messages
  const VALID_OBJECTS = ['clock', 'desk', 'bookshelf', 'diary', 'painting', 'safe', 'door']

  const parsed = { 
    type: null, 
    object: null, 
    value: null, 
    target: null,
    originalCommand: command
  }

  // Determine action type (check longer phrases first)
  const sortedActions = Object.entries(actionPatterns).sort((a, b) => {
    const aMaxLen = Math.max(...a[1].map(k => k.length))
    const bMaxLen = Math.max(...b[1].map(k => k.length))
    return bMaxLen - aMaxLen
  })

  for (const [actionType, keywords] of sortedActions) {
    if (keywords.some(kw => lower.includes(kw))) {
      parsed.type = actionType
      break
    }
  }

  // Check for "use X on Y" pattern first
  const useOnPattern = lower.match(/use\s+(\w+(?:\s+\w+)?)\s+(?:on|with|to|on the)\s+(\w+(?:\s+\w+)?)/)
  if (useOnPattern) {
    parsed.type = 'use'
    const itemName = useOnPattern[1].toLowerCase()
    const targetName = useOnPattern[2].toLowerCase()
    
    // Determine item type
    if (itemName.includes('key')) {
      if (itemName.includes('golden') || itemName.includes('gold')) {
        parsed.object = 'golden key'
      } else if (itemName.includes('desk')) {
        parsed.object = 'desk key'
      } else {
        parsed.object = 'key'
      }
    }
    
    // Determine target object
    for (const [objName, keywords] of Object.entries(objectPatterns)) {
      if (keywords.some(kw => targetName.includes(kw))) {
        parsed.target = objName
        break
      }
    }
  }

  // Determine object (if not already set from use pattern)
  if (!parsed.object) {
    const sortedObjects = Object.entries(objectPatterns).sort((a, b) => {
      const aMaxLen = Math.max(...a[1].map(k => k.length))
      const bMaxLen = Math.max(...b[1].map(k => k.length))
      return bMaxLen - aMaxLen
    })

    for (const [objName, keywords] of sortedObjects) {
      if (keywords.some(kw => lower.includes(kw))) {
        parsed.object = objName
        break
      }
    }
  }

  // Extract numeric value (for codes, times, etc.)
  const numberMatch = lower.match(/\d+/)
  if (numberMatch) {
    parsed.value = numberMatch[0]
  }

  // Special case: safe code
  if (lower.includes('code') || lower.includes('combination')) {
    const codeMatch = lower.match(/(\d{3,5})/)
    if (codeMatch) {
      parsed.value = codeMatch[1]
    }
  }

  // If we have an object but no action, default to examine
  if (parsed.object && !parsed.type) {
    parsed.type = 'examine'
  }

  // DEBUG MODE: Log parsed result
  if (import.meta.env.DEV) {
    console.log('✅ Parsed result:', {
      type: parsed.type,
      object: parsed.object,
      value: parsed.value,
      target: parsed.target
    })
  }

  return parsed
}
