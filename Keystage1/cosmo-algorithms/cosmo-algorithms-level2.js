const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let gridSize = 50;
let numMeteors = 10;
let stepsTaken = 0;
let gameStarted = false;
let gameOver = false;

// Rocket and Moon setup
let cosmo = {
    x: 0,
    y: 0,
    width: gridSize,
    height: gridSize,
    direction: 0,
    initialX: 0,
    initialY: 0,
};

let moon = {
    x: 0,
    y: 0,
    width: gridSize,
    height: gridSize,
};

let meteors = [];

// Load rocket images
const rocketImages = {
    0: new Image(),
    90: new Image(),
    180: new Image(),
    270: new Image(),
};

rocketImages[0].src = 'cosmo-rocket-0.png';
rocketImages[90].src = 'cosmo-rocket-90.png';
rocketImages[180].src = 'cosmo-rocket-180.png';
rocketImages[270].src = 'cosmo-rocket-270.png';

let currentRocketImage = rocketImages[0];

const moonImage = new Image();
moonImage.src = 'moon.png';

const meteorImage = new Image();
meteorImage.src = 'meteor.png';

// Draw grid
function drawGrid() {
    ctx.strokeStyle = '#444';
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

// Draw Cosmo
function drawCosmo() {
    ctx.drawImage(currentRocketImage, cosmo.x, cosmo.y, cosmo.width, cosmo.height);
}

// Draw the moon
function drawMoon() {
    ctx.drawImage(moonImage, moon.x, moon.y, moon.width, moon.height);
}

// Draw meteors
function drawMeteors() {
    meteors.forEach(meteor => {
        ctx.drawImage(meteorImage, meteor.x, meteor.y, meteor.width, meteor.height);
    });
}

// Update game visuals
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCosmo();
    drawMoon();
    drawMeteors();
}

// Reset the game to its initial state
function resetGame() {
    gameOver = false;
    stepsTaken = 0;
    document.getElementById('stepsLeft').textContent = stepsTaken;
    updateSpeechBubble("Type commands to guide me! Press 'Run' to execute them.");

    // Place Cosmo
    let placed = false;
    while (!placed) {
        const randomX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        const randomY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        if (!meteors.some(m => m.x === randomX && m.y === randomY)) {
            cosmo = { x: randomX, y: randomY, width: gridSize, height: gridSize, direction: 0, initialX: randomX, initialY: randomY };
            currentRocketImage = rocketImages[0];
            placed = true;
        }
    }

    // Place the moon
    moon = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        width: gridSize,
        height: gridSize,
    };

    // Generate meteors
    meteors = generateMeteors();
    document.getElementById('codeInput').value = '';
    document.getElementById('anotherGoButton').style.display = 'none';
    update();
}

// Generate random meteors
function generateMeteors() {
    const newMeteors = [];
    while (newMeteors.length < numMeteors) {
        const x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        if ((x !== cosmo.x || y !== cosmo.y) && (x !== moon.x || y !== moon.y)) {
            newMeteors.push({ x, y, width: gridSize, height: gridSize });
        }
    }
    return newMeteors;
}

// Move Cosmo
function moveCosmo(command, repeat = 1) {
    for (let i = 0; i < repeat; i++) {
        if (gameOver || !gameStarted) return;

        stepsTaken++;
        document.getElementById('stepsLeft').textContent = stepsTaken;

        if (command === 'forward') {
            if (cosmo.direction === 0) cosmo.y -= gridSize;
            if (cosmo.direction === 90) cosmo.x += gridSize;
            if (cosmo.direction === 180) cosmo.y += gridSize;
            if (cosmo.direction === 270) cosmo.x -= gridSize;
        } else if (command === 'backward') {
            if (cosmo.direction === 0) cosmo.y += gridSize;
            if (cosmo.direction === 90) cosmo.x -= gridSize;
            if (cosmo.direction === 180) cosmo.y -= gridSize;
            if (cosmo.direction === 270) cosmo.x += gridSize;
        } else if (command === 'right') {
            cosmo.direction = (cosmo.direction + 90) % 360;
            currentRocketImage = rocketImages[cosmo.direction];
        } else if (command === 'left') {
            cosmo.direction = (cosmo.direction + 270) % 360;
            currentRocketImage = rocketImages[cosmo.direction];
        }

        cosmo.x = Math.max(0, Math.min(canvas.width - cosmo.width, cosmo.x));
        cosmo.y = Math.max(0, Math.min(canvas.height - cosmo.height, cosmo.y));

        checkCollision();
        checkVictory();
        update();
    }
}

// Check if Cosmo reached the moon
function checkVictory() {
    if (cosmo.x === moon.x && cosmo.y === moon.y) {
        gameOver = true;
        updateSpeechBubble(`Hooray! You reached the moon in ${stepsTaken} steps!`);
        document.getElementById('anotherGoButton').style.display = 'inline-block';
        if (studentId) {
            recordGameCompletion('cosmo-level2', true, stepsTaken, 'keystage1'); // Game name for level 2
        }
    }
}

// Check for collisions with meteors
function checkCollision() {
    meteors.forEach(meteor => {
        if (cosmo.x === meteor.x && cosmo.y === meteor.y) {
            gameOver = true;
            updateSpeechBubble("Oh no! You hit a meteor. Try again!");
            resetToOriginalPosition();
            if (studentId) {
                recordGameCompletion('cosmo-level2', false, stepsTaken, 'keystage1'); // Game name for level 2, completion false
            }
        }
    });
}

// Reset Cosmo to its initial position
function resetToOriginalPosition() {
    cosmo.x = cosmo.initialX;
    cosmo.y = cosmo.initialY;
    cosmo.direction = 0;
    currentRocketImage = rocketImages[0];
    stepsTaken = 0;
    document.getElementById('stepsLeft').textContent = stepsTaken;
    gameOver = false;
    update();
}

// Parse typed commands
function parseCommand(command) {
    const match = command.match(/(\w+)\((\d+)\)/);
    if (match) {
        return { command: match[1], repeat: parseInt(match[2], 10) };
    }
    return { command, repeat: 1 };
}

// Run typed commands
function runCode() {
    const commands = document.getElementById('codeInput').value.split('\n').map(cmd => cmd.trim());
    let index = 0;

    if (commands.length === 0) {
        updateSpeechBubble("No commands provided! Type commands to move me.");
        return;
    }

    function executeNext() {
        if (index < commands.length && !gameOver) {
            const { command, repeat } = parseCommand(commands[index]);
            moveCosmo(command, repeat);
            index++;
            setTimeout(executeNext, 500);
        } else if (!gameOver) {
            updateSpeechBubble("Great job! Check where I ended up!");
            resetToOriginalPosition();
        }
    }

    executeNext();
}

// Speech bubble typing effect
let isTyping = false;

function updateSpeechBubble(message) {
    if (isTyping) return;

    const speechText = document.getElementById('speech-text');
    const cosmoCharacter = document.getElementById('cosmo-character');
    const originalImage = 'character.png';
    const talkingImage = 'character-open.png';

    speechText.textContent = '';
    isTyping = true;

    cosmoCharacter.src = talkingImage;
    document.querySelectorAll('button').forEach(btn => btn.disabled = true);

    let i = 0;

    function typeNext() {
        if (i < message.length) {
            speechText.textContent += message.charAt(i);
            i++;
            cosmoCharacter.src = i % 3 === 0 ? talkingImage : originalImage;
            setTimeout(typeNext, 50);
        } else {
            cosmoCharacter.src = originalImage;
            isTyping = false;
            document.querySelectorAll('button').forEach(btn => btn.disabled = false);
        }
    }

    typeNext();
}

// Event listeners
document.getElementById('startButton').addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        resetGame();
    }
});

document.getElementById('runButton').addEventListener('click', runCode);

document.getElementById('anotherGoButton').addEventListener('click', () => {
    resetGame();
    document.getElementById('anotherGoButton').style.display = 'none';
});

document.getElementById('menuButton').addEventListener('click', () => {
    window.location.href = '../KS1-SG.html';
});

document.getElementById('level1Button').addEventListener('click', () => {
    window.location.href = 'cosmo-level1.html';
});


// Get studentId from session storage
const studentData = JSON.parse(sessionStorage.getItem('studentData'));
const studentId = studentData ? studentData.id : null;

if (!studentId) {
    console.warn('Student ID not found, progress not recorded.');
}

async function recordGameCompletion(gameName, completed, stepsTaken, keystage) {
    if (!studentId) {
        console.warn('Student ID missing, progress not recorded.');
        return;
    }
    try {
        const response = await fetch('/api/game/record-completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                gameName: gameName, // 'cosmo-level2'
                stepsTaken: stepsTaken,
                completed: completed,
                keystage: keystage  // Pass keystage here
            }),
        });

        if (!response.ok) {
            console.error('Failed to record game completion:', response.statusText);
        } else {
            const data = await response.json();
            console.log('Game completion recorded:', data);
        }
    } catch (error) {
        console.error('Error recording game completion:', error);
    }
}



// Initialize the game
resetGame();