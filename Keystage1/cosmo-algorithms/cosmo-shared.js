const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize grid and game variables
function setupGame() {
    // Draw grid, initialize rocket, moon, etc.
}

// Command execution logic
function executeCommands(commands) {
    commands.forEach((cmd, index) => {
        setTimeout(() => {
            moveRocket(cmd);
            updateCanvas();
        }, index * 500);
    });
}

// Game-specific updates
function updateCanvas() {
    // Clear and redraw canvas elements
}
