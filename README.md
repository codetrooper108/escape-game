# Escape Room Adventure Game

A text-based mobile escape room adventure game built with React and Hugging Face AI. Solve puzzles, collect items, and escape "The Locked Study"!

## Features

- 🎮 Text-based adventure gameplay
- 🤖 AI-powered responses using Mistral-7B-Instruct
- 📱 Mobile-first responsive design
- 🎒 Inventory system
- 📊 Move counter
- 💡 Hint system (one hint per game)
- 🏆 Win screen with stats

## Game Overview

You find yourself trapped in "The Locked Study". Your goal is to escape by solving puzzles and finding the golden key. Type commands like:
- `examine desk`
- `look at clock`
- `read diary`
- `set clock to midnight`
- `open door`

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Hugging Face API token (get one at [huggingface.co](https://huggingface.co))

### Installation

1. **Clone or download this repository**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your API token:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and replace `your_api_token_here` with your actual Hugging Face API token:
     ```
     VITE_HUGGINGFACE_API_TOKEN=your_actual_token_here
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - The app will automatically open at `http://localhost:3000`
   - Or manually navigate to the URL shown in the terminal

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## How to Play

1. **Read the initial scene description** - You'll see what's in the room
2. **Type commands** - Use natural language like "examine desk" or "open door"
3. **Solve puzzles** - Find clues, collect items, and unlock doors
4. **Use your inventory** - Keep track of items you've collected
5. **Get hints** - Click the hint button once per game if you're stuck
6. **Escape!** - Find the golden key and unlock the door to win

## Game Solution (Spoilers!)

<details>
<summary>Click to reveal solution</summary>

1. Examine the bookshelf → Find the diary
2. Read the diary → Get clue: "Time stands still at midnight"
3. Set the clock to 12:00 (midnight) → Clock opens, revealing desk key
4. Use desk key on desk → Get golden key
5. (Optional) Examine painting → Remove it → Find safe → Open with code 1200 (red herring)
6. Use golden key on door → WIN!

</details>

## Technical Details

- **Framework:** React 18 with Vite
- **AI Model:** mistralai/Mistral-7B-Instruct-v0.2
- **API:** Hugging Face Inference API
- **Styling:** CSS3 with mobile-first approach

## Project Structure

```
escape-game/
├── src/
│   ├── components/       # React components
│   │   ├── Game.jsx      # Main game component
│   │   ├── Inventory.jsx # Inventory display
│   │   ├── Stats.jsx     # Move counter
│   │   ├── WinScreen.jsx # Victory screen
│   │   └── HintButton.jsx
│   ├── services/
│   │   └── huggingFaceAPI.js  # API integration
│   ├── utils/
│   │   └── gameLogic.js       # Game state & logic
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## Troubleshooting

### API Token Issues
- Make sure your `.env` file is in the root directory
- Verify the token starts with `hf_`
- Restart the dev server after changing `.env`

### API Rate Limits
- Hugging Face free tier has rate limits
- If you hit limits, wait a few minutes and try again
- Consider upgrading your Hugging Face account for higher limits

### Game Not Responding
- Check browser console for errors
- Verify your API token is correct
- Make sure you're connected to the internet

## License

This project is open source and available for personal use.

## Credits

- Built with React and Vite
- AI powered by Hugging Face Mistral-7B-Instruct
- Game design and puzzles by the developer

Enjoy escaping! 🎮🔐





