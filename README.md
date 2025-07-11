# Open City - GTA 5 Inspired Game

A web-based 3D open-world game inspired by Grand Theft Auto 5, built with Three.js and Cannon.js physics engine.

## 🎮 Features

### Core Gameplay
- **3D Open World**: Procedurally generated city with buildings, roads, and vehicles
- **Player Movement**: Walk, run, and explore the city in third-person view
- **Vehicle System**: Enter and drive multiple vehicles with realistic physics
- **Real-time Physics**: Collision detection, gravity, and vehicle dynamics
- **Dynamic Camera**: Smooth third-person camera that follows player and vehicles

### Game Systems
- **Health System**: Player health with visual health bar
- **Money System**: In-game currency tracking
- **Wanted Level**: 5-star wanted system (visual feedback)
- **Minimap**: Real-time minimap showing buildings, vehicles, and player position
- **Weather & Lighting**: Dynamic lighting with shadows and fog effects

### Visual Features
- **Modern UI**: GTA-style HUD with health, money, and wanted level
- **Realistic Graphics**: 3D shadows, lighting, and weather effects
- **Loading Screen**: Professional loading animation
- **Responsive Design**: Works on desktop and mobile devices

## 🕹️ Controls

### On Foot
- **WASD** - Move (W: Forward, S: Backward, A: Left, D: Right)
- **Shift** - Run (hold while moving)
- **Mouse** - Look around (click to enable mouse lock)
- **F** - Enter nearby vehicle

### In Vehicle
- **W** - Accelerate
- **S** - Brake/Reverse
- **A/D** - Steer left/right
- **Space** - Handbrake
- **F** - Exit vehicle

### UI Controls
- **Click Controls Panel** - Hide control instructions
- **Mouse Movement** - Camera control (after clicking screen)

## 🚀 How to Run

### Option 1: Direct Browser
1. Download all files (`index.html`, `style.css`, `game.js`)
2. Open `index.html` in a modern web browser
3. Click on the game screen to start playing

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have it)
npx serve .

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## 🛠️ Technical Details

### Technologies Used
- **Three.js** - 3D graphics and rendering
- **Cannon.js** - Physics simulation
- **HTML5 Canvas** - Minimap rendering
- **CSS3** - UI styling and animations
- **Vanilla JavaScript** - Game logic and controls

### Performance Features
- Optimized rendering with frustum culling
- Efficient physics simulation
- Shadow mapping for realistic lighting
- LOD (Level of Detail) for distant objects

### Browser Compatibility
- Chrome 80+ (Recommended)
- Firefox 75+
- Safari 13+
- Edge 80+

## 🎯 Game Mechanics

### Player System
- **Health**: 100% health system with visual feedback
- **Movement**: Realistic walking and running speeds
- **Physics**: Collision detection with buildings and vehicles

### Vehicle System
- **Multiple Vehicles**: Different colored cars spawned around the city
- **Realistic Physics**: Acceleration, braking, steering, and momentum
- **Entry/Exit**: Seamless vehicle entry and exit system
- **Camera**: Dynamic camera that follows vehicles

### World Generation
- **Procedural City**: Buildings generated in a grid pattern
- **Road Network**: Main roads for vehicle navigation
- **Collision Bounds**: All objects have proper collision detection

## 🌟 Features Comparison to GTA 5

| Feature | Open City | GTA 5 |
|---------|-----------|--------|
| Open World | ✅ Basic City | ✅ Los Santos |
| Vehicle Driving | ✅ Multiple Cars | ✅ 200+ Vehicles |
| Player Movement | ✅ Walk/Run | ✅ Walk/Run/Combat |
| Physics Engine | ✅ Cannon.js | ✅ RAGE Engine |
| Minimap | ✅ Real-time | ✅ Detailed Map |
| Wanted System | ✅ Visual Only | ✅ Police Chase |
| Mission System | ❌ | ✅ Story Mode |
| Multiplayer | ❌ | ✅ GTA Online |

## 🔧 Customization

### Adding New Vehicles
```javascript
// In game.js, modify the spawnVehicles() function
const newVehiclePositions = [
    [x, y, z], // Add new coordinates
];
```

### Modifying City Layout
```javascript
// In createCity(), adjust the building generation
for (let i = -30; i <= 30; i += 4) { // Increase city size
    for (let j = -30; j <= 30; j += 4) {
        // Building generation logic
    }
}
```

### Changing Player Stats
```javascript
// In constructor, modify player object
this.player = {
    speed: 5,        // Walking speed
    runSpeed: 8,     // Running speed
    health: 100,     // Max health
    money: 1000      // Starting money
};
```

## 🐛 Known Issues & Future Enhancements

### Current Limitations
- No NPCs or traffic
- No missions or objectives
- No weapons or combat system
- No police chase mechanics
- No sound effects or music

### Planned Features
- AI-controlled vehicles and pedestrians
- Mission system with objectives
- Sound effects and background music
- Police chase system with actual wanted mechanics
- Weapon system and combat mechanics
- Save/load game functionality
- Mobile touch controls optimization

## 📱 Mobile Support

The game includes responsive design and works on mobile devices, though the experience is optimized for desktop with keyboard and mouse controls.

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Add sound effects
- Implement NPC traffic
- Create missions and objectives
- Add new vehicle types
- Improve graphics and textures

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy exploring Open City! 🏙️🚗**
