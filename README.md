# Midnight Pursuit

A lightweight browser-based driving game built with Three.js. Evade police, collect cash, and survive the night.

**Quick Start**

- Open `index.html` in a modern browser (Chrome/Edge/Firefox). Double-click the file or drag it into the browser.
- Recommended: serve the folder with Live Server (VS Code) or a simple HTTP server to avoid local file restrictions.

  - VS Code Live Server: Right-click `index.html` → "Open with Live Server".
  - Python (from project folder):

```bash
python -m http.server 8000
# then open http://localhost:8000/
```

**Controls**

- **W / S**: Accelerate / Brake
- **A / D**: Steer Left / Right
- **Space**: Drift / Handbrake
- Click the **DRIVE** button to start the game

**Audio behavior**

- `crash.mp3` is used as the game's background track and is configured to play when you click the **DRIVE** button.
- The audio element is set with `preload="auto"` and `loop`, so the track restarts automatically when it finishes.
- Note: Most browsers block autoplay of unmuted audio. Since playback is triggered by the user clicking the DRIVE button, the sound should start reliably.

**Where to change the audio**

- Replace `crash.mp3` file in the project root with your preferred MP3 (use the same filename), or update the `src` attribute in `index.html`.
- For additional sound effects (siren, crash impact), add new `<audio>` elements and play them from `Game.js` where appropriate.

**Project structure**

- `index.html` — main page and audio elements
- `style.css` — HUD and UI styling
- `Game.js` — main game loop and logic
- `Car.js`, `PlayerCar.js`, `PoliceCar.js`, `TrafficCar.js` — entity classes
- `RoadChunk.js` — procedural road segments
- `GameObject3D.js` — base class for 3D game objects
- `crash.mp3` — background audio (replaceable)

**Troubleshooting**

- Blank screen on start: make sure you click the **DRIVE** button. The game loop begins on start; if the screen remains blank, check the browser console for errors.
- Audio won't play: ensure you clicked the DRIVE button (user gesture) and the file `crash.mp3` exists in the same folder as `index.html`.
- Three.js issues: the project imports Three.js from a CDN using an importmap — ensure you have an internet connection or swap to a local Three.js build.

**Tech stack**

- HTML, CSS, JavaScript
- Three.js (CDN)
- Optional: VS Code Live Server for local testing

**License & credits**

Use assets (audio, images) with appropriate licenses. This project is provided as-is for learning and experimentation.
