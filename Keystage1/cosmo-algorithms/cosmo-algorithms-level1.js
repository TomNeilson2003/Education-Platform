// Canvas setup
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

// Draw functions
function drawGrid() {
    ctx.strokeStyle = '#444';
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
}

function drawCosmo() {
    ctx.drawImage(currentRocketImage, cosmo.x, cosmo.y, cosmo.width, cosmo.height);
}

function drawMoon() {
    ctx.drawImage(moonImage, moon.x, moon.y, moon.width, moon.height);
}

function drawMeteors() {
    meteors.forEach(meteor => {
        ctx.drawImage(meteorImage, meteor.x, meteor.y, meteor.width, meteor.height);
    });
}

// Game logic
function moveCosmo(command) {
    if (gameOver || !gameStarted) return;

    stepsTaken++;
    document.getElementById('stepsLeft').textContent = stepsTaken;

    if (command === 'forward') {
        if (cosmo.direction === 0) cosmo.y -= gridSize; // Move up
        if (cosmo.direction === 90) cosmo.x += gridSize; // Move right
        if (cosmo.direction === 180) cosmo.y += gridSize; // Move down
        if (cosmo.direction === 270) cosmo.x -= gridSize; // Move left
    } else if (command === 'backward') {
        if (cosmo.direction === 0) cosmo.y += gridSize; // Move down
        if (cosmo.direction === 90) cosmo.x -= gridSize; // Move left
        if (cosmo.direction === 180) cosmo.y -= gridSize; // Move up
        if (cosmo.direction === 270) cosmo.x += gridSize; // Move right
    } else if (command === 'right') {
        cosmo.direction = (cosmo.direction + 90) % 360;
        currentRocketImage = rocketImages[cosmo.direction]; // Update image
    } else if (command === 'left') {
        cosmo.direction = (cosmo.direction + 270) % 360; // Left turn = -90 degrees
        currentRocketImage = rocketImages[cosmo.direction]; // Update image
    }

    // Keep Cosmo within grid bounds
    cosmo.x = Math.max(0, Math.min(canvas.width - cosmo.width, cosmo.x));
    cosmo.y = Math.max(0, Math.min(canvas.height - cosmo.height, cosmo.y));

    checkCollision();
    checkVictory();
    update();
}


function checkCollision() {
    meteors.forEach(meteor => {
        if (cosmo.x === meteor.x && cosmo.y === meteor.y) {
            gameOver = true;
            updateSpeechBubble("Oops! I hit a meteor! Let's try again.");
            resetToOriginalPosition();
            if (studentId) {
                recordGameCompletion('cosmo-level1', false, stepsTaken, 'keystage1');
            }
        }
    });
}

function checkVictory() {
    if (cosmo.x === moon.x && cosmo.y === moon.y) {
        gameOver = true;
        updateSpeechBubble("Hooray! You reached the moon in " + stepsTaken + " steps!");
        document.getElementById('anotherGoButton').style.display = 'inline-block';
        document.getElementById('startButton').disabled = false;
        if (studentId) {
            recordGameCompletion('cosmo-level1', true, stepsTaken, 'keystage1');
        }
    }
}

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


function resetGame() {
    gameOver = false;
    stepsTaken = 0;
    document.getElementById('stepsLeft').textContent = stepsTaken;
    updateSpeechBubble("Let's go, astronaut! Guide me to the moon! Press Start to begin my journey!");

    let rocketPlaced = false;
    while (!rocketPlaced) {
        const randomX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        const randomY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        const isOnMoon = randomX === moon.x && randomY === moon.y;
        const isOnMeteor = meteors.some(meteor => meteor.x === randomX && meteor.y === randomY);

        if (!isOnMoon && !isOnMeteor) {
            cosmo = {
                x: randomX,
                y: randomY,
                width: gridSize,
                height: gridSize,
                direction: 0,
                initialX: randomX,
                initialY: randomY
            };
            currentRocketImage = rocketImages[0];
            rocketPlaced = true;
        }
    }

    moon = {
        x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
        y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
        width: gridSize,
        height: gridSize,
    };

    meteors = generateMeteors();

    document.getElementById('commandArea').innerHTML = '';

    update();
}


function generateMeteors() {
    const newMeteors = [];
    while (newMeteors.length < numMeteors) {
        const randomX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
        const randomY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        const isOnCosmo = randomX === cosmo.x && randomY === cosmo.y;
        const isOnMoon = randomX === moon.x && randomY === moon.y;

        if (!isOnCosmo && !isOnMoon) {
            newMeteors.push({ x: randomX, y: randomY, width: gridSize, height: gridSize });
        }
    }
    return newMeteors;
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawCosmo();
    drawMoon();
    drawMeteors();
}

function getDraggedCommands() {
    return Array.from(document.querySelectorAll('#commandArea .command'))
        .map(cmd => cmd.textContent.trim());
}

function runCode() {
    if (!gameStarted) {
        updateSpeechBubble("Press 'Start' to begin!");
        return;
    }

    const commands = getDraggedCommands();
    let index = 0;

    if (commands.length === 0) {
        updateSpeechBubble("You forgot to give me commands! Drag some in!");
        return;
    }

    function executeNext() {
        if (index < commands.length && !gameOver) {
            moveCosmo(commands[index]);
            index++;
            setTimeout(executeNext, 500);
        } else if (!gameOver) {
            updateSpeechBubble("Great try! Try again!");
            resetToOriginalPosition();
        }
    }

    executeNext();
}

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

document.getElementById('refreshButton').addEventListener('click', () => {
    if (!resetGame.isonmoon){
    document.getElementById('commandArea').innerHTML = '';
    updateSpeechBubble('Commands have been refreshed! Start again.');
    resetToOriginalPosition();
    }
});

document.getElementById('menuButton').addEventListener('click', () => {
    window.location.href = '../KS1-SG.html';
});

document.getElementById('level2Button').addEventListener('click', () => {
    window.location.href = 'cosmo-level2.html';
});

// Drag-and-drop functionality
const availableCommands = document.querySelectorAll('#availableCommands .command');
const commandArea = document.getElementById('commandArea');

availableCommands.forEach(cmd => {
    cmd.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', e.target.textContent);
    });
});

commandArea.addEventListener('dragover', e => e.preventDefault());

commandArea.addEventListener('drop', e => {
    e.preventDefault();
    const cmdText = e.dataTransfer.getData('text/plain');
    if (cmdText) {
        const cmdElement = document.createElement('div');
        cmdElement.textContent = cmdText;
        cmdElement.classList.add('command');
        cmdElement.setAttribute('draggable', 'false');
        commandArea.appendChild(cmdElement);
    }
});


// Get studentId from session storage
const studentData = JSON.parse(sessionStorage.getItem('studentData'));
const studentId = studentData ? studentData.id : null;

if (!studentId) {
    console.error('Student ID not found. Progress tracking disabled.');
    // Consider redirecting to login if studentId is essential
}

// In cosmo-algorithms-level1.js
async function recordGameCompletion(gameName, completed, stepsTaken) {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    const studentId = studentData ? studentData.id : null;

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
                gameName: gameName,
                stepsTaken: stepsTaken,
                completed: completed,
                keystage: 'Keystage1' // Ensure this matches exactly
            }),
        });

        if (!response.ok) {
            console.error('Failed to record game completion:', await response.text());
        }
    } catch (error) {
        console.error('Error recording game completion:', error);
    }
}


// Initialize the game
resetGame();