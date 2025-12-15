const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2'

export async function callHuggingFaceAPI(command, baseDescription, roomState, inventory, room) {
  const apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN

  if (!apiToken) {
    console.error('Hugging Face API token not found')
    return baseDescription || 'The room seems to respond mysteriously...'
  }

  // Build context for the AI - AI ONLY generates descriptions, NOT game logic
  const inventoryList = inventory.length > 0 
    ? `Inventory: ${inventory.map(i => i.name).join(', ')}`
    : 'Inventory: Empty'

  const context = `You are the narrator for a text-based escape room game. The player is in "${room}".

Current room state:
- Clock examined: ${roomState.clockExamined}
- Clock opened: ${roomState.clockOpened}
- Desk examined: ${roomState.deskExamined}
- Desk unlocked: ${roomState.deskUnlocked}
- Desk opened: ${roomState.deskOpened}
- Bookshelf examined: ${roomState.bookshelfExamined}
- Diary found: ${roomState.diaryFound}
- Diary read: ${roomState.diaryRead}
- Painting examined: ${roomState.paintingExamined}
- Painting removed: ${roomState.paintingRemoved}
- Safe found: ${roomState.safeFound}
- Safe opened: ${roomState.safeOpened}
- Door examined: ${roomState.doorExamined}
- Door unlocked: ${roomState.doorUnlocked}
${inventoryList}

The player just executed: "${command}"

Base description (what happened): "${baseDescription}"

YOUR TASK: Write a mysterious, atmospheric 2-3 sentence description based on the base description above. 
- DO NOT make game logic decisions - the game has already decided what happened
- DO enhance the description with atmosphere, mystery, and engaging prose
- Match the tone of an escape room adventure
- Be creative but stay true to what actually happened
- Keep it concise (2-3 sentences max)`

  const prompt = `<s>[INST] ${context} [/INST]`

  try {
    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Hugging Face API error:', response.status, errorText)
      
      // Fallback to game response if API fails
      return gameResponse || 'The room seems to respond mysteriously...'
    }

    const data = await response.json()
    
    // Extract the generated text
    let aiText = ''
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text.trim()
    } else if (data.generated_text) {
      aiText = data.generated_text.trim()
    } else if (typeof data === 'string') {
      aiText = data.trim()
    }

    // Clean up the response (remove any prompt artifacts)
    aiText = aiText.replace(/\[INST\].*?\[\/INST\]/g, '').trim()
    aiText = aiText.split('\n')[0].trim() // Take first paragraph

    // Fallback if AI response is empty or too short
    if (!aiText || aiText.length < 10) {
      return gameResponse || 'Something interesting happens...'
    }

    return aiText
  } catch (error) {
    console.error('Error calling Hugging Face API:', error)
    // Fallback to game response
    return gameResponse || 'The room seems to respond mysteriously...'
  }
}




