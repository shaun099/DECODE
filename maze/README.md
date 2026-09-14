# CSE Maze — Key Fragment Challenge

A TypeScript + Vite browser game. The maze is real HTML/CSS Grid geometry: blue wall blocks, corridors, locked doors, player and glowing exit are DOM elements. No maze image is used.

## Requirements
- Node.js 18+ recommended
- VS Code (optional but recommended)

## Run
```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, normally `http://localhost:5173/`.

For a production build:
```bash
npm run build
npm run preview
```

## Game rules
- Press **START GAME**.
- Total time: **5 minutes** for both levels.
- Movement is only **Arrow Keys** or **W/A/S/D**.
- **Level 1:** exactly 5 locked doors, with simple CSE questions.
- **Level 2:** exactly 10 locked doors, with slightly harder CSE questions.
- Correct answers open doors. Wrong answers cost a life.
- Reach the exit to finish a level.
- Completing Level 1 awards **Key Fragment 1/2**.
- Completing Level 2 awards the **final key fragment** and completes the mission.

## Important
The maze is generated as actual DOM cells with CSS Grid. There is no background maze image and no Canvas dependency.
