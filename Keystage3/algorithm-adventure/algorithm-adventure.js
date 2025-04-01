const levels = document.getElementById('level-list');
const instructions = document.getElementById('instructions');
const scoreDisplay = document.getElementById('score'); // Make sure this element exists in your HTML

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let currentLevel = '1'; // Initialize the current level
let score = 0;
let items = [];
let grid = [];
let currentPuzzle = {};
let requiredScore = 50; // Minimum score needed to progress to the next level

ctx.textAlign = "center";
ctx.textBaseline = "middle";

levels.addEventListener('click', event => {
    if (event.target.tagName === 'LI' && event.target.dataset.level) { // Ensuring the clicked target is a list item with a level
        loadLevel(event.target.dataset.level);
    }
});

function updateScore(correct) {
    if (correct) {
        score += 10; // Increment score by 10 for each correct answer
        scoreDisplay.textContent = `Score: ${score}`;
        instructions.textContent = "Correct! Well done!";
        setTimeout(checkLevelCompletion, 1500); // Delay check for completion to allow message to be read
    } else {
        instructions.textContent = "Incorrect. Try again!";
    }
}

function checkLevelCompletion() {
    if (score >= requiredScore) {
        instructions.textContent = `Level Complete! Well done! Your score: ${score}`;
        score = 0; // Reset score for the next level
        scoreDisplay.textContent = `Score: ${score}`;
        setTimeout(() => {
            let nextLevel = parseInt(currentLevel) + 1;
            if (nextLevel > 4) {
                instructions.textContent = "All levels completed! Congratulations!";
            } else {
                loadLevel(String(nextLevel));
            }
        }, 2000); // Load next level automatically
    }
}

function loadLevel(level) {
    currentLevel = level;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resetCanvasEventListeners();
    score = 0; // Reset score on level load
    scoreDisplay.textContent = `Score: ${score}`; // Initialize score display

    switch (level) {
        case '1':
            instructions.textContent = "Level 1: Sorting Forest - Help forestry creatures organize fruits and leaves by sorting them.";
            initiateSortingLevel();
            break;
        case '2':
            instructions.textContent = "Level 2: Treasure Plains - Find hidden treasures using linear and binary search algorithms.";
            initiateSearchingLevel();
            break;
        case '3':
            instructions.textContent = "Level 3: Logic Maze - Solve puzzles using AND, OR, and NOT gates.";
            initiateBooleanLogicLevel();
            break;
        case '4':
            instructions.textContent = "Level 4: Data Mountain - Organize climbing equipment using arrays and lists.";
            initiateDataStructuresLevel();
            break;
        default:
            instructions.textContent = "Select a level to begin your quest!";
    }
}

function resetCanvasEventListeners() {
    let newCanvas = canvas.cloneNode(true);
    canvas.parentNode.replaceChild(newCanvas, canvas);
    canvas = newCanvas;
    ctx = canvas.getContext('2d');
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
}

function generateRandomArray(size) {
    return Array.from({length: size}, () => Math.floor(Math.random() * 100));
}

function generateTreasureGrid(rows, cols) {
    return Array.from({length: rows}, () => Array.from({length: cols}, () => Math.random() < 0.2 ? 1 : 0));
}

function generateLogicPuzzle(gates) {
    const selectedGate = gates[Math.floor(Math.random() * gates.length)];
    const inputA = Math.round(Math.random());
    const inputB = selectedGate !== "NOT" ? Math.round(Math.random()) : null;
    const correctOutput = evaluateGate(selectedGate, inputA, inputB);
    return {selectedGate, inputA, inputB, correctOutput};
}

function evaluateGate(gate, inputA, inputB) {
    switch (gate) {
        case "AND":
            return inputA && inputB ? true : false;
        case "OR":
            return inputA || inputB ? true : false;
        case "NOT":
            return !inputA;
    }
}

function initiateSortingLevel() {
    items = generateRandomArray(10);
    renderSortingGame();
    instructions.textContent = "Sort the numbers in ascending order by clicking to swap adjacent numbers.";

    canvas.addEventListener('click', event => {
        let clickedIndex = Math.floor((event.offsetX - 50) / 60);
        if (clickedIndex < 0 || clickedIndex >= items.length - 1) return;

        if (items[clickedIndex] > items[clickedIndex + 1]) {
            [items[clickedIndex], items[clickedIndex + 1]] = [items[clickedIndex + 1], items[clickedIndex]];
            updateScore(true);
        } else {
            updateScore(false);
        }
        renderSortingGame();

        if (isSorted(items)) {
            updateScore(true);
            instructions.textContent = "Well done! All items are sorted.";
            setTimeout(checkLevelCompletion, 2000);
        }
    });
}

function isSorted(array) {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) return false;
    }
    return true;
}

function renderSortingGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("Sorting Forest", canvas.width / 2, 30);

    items.forEach((value, index) => {
        ctx.fillStyle = "#3498db";
        ctx.fillRect(50 + index * 60, 400 - value, 40, value);
        ctx.fillStyle = "#000";
        ctx.fillText(value, 70 + index * 60, 420);
    });
}

function initiateSearchingLevel() {
    grid = generateTreasureGrid(5, 5);
    let treasuresFound = 0;
    const totalTreasures = grid.flat().filter(cell => cell === 1).length;
    instructions.textContent = "Find all the hidden treasures by clicking the squares. Treasures are hidden randomly.";

    renderSearchingGame();

    canvas.addEventListener('click', event => {
        const col = Math.floor((event.offsetX - 50) / 60);
        const row = Math.floor((event.offsetY - 50) / 60);

        if (row >= 0 && row < grid.length && col >= 0 && col < grid[row].length) {
            if (grid[row][col] === 1) {
                treasuresFound++;
                grid[row][col] = 0;
                updateScore(true);
            } else {
                updateScore(false);
            }
            renderSearchingGame();

            if (treasuresFound === totalTreasures) {
                instructions.textContent = "Congratulations! You found all the treasures.";
                setTimeout(checkLevelCompletion, 2000);
            }
        }
    });
}

function renderSearchingGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("Treasure Plains", canvas.width / 2, 30);

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            ctx.fillStyle = grid[row][col] === 1 ? "#f39c12" : "#ecf0f1";
            ctx.fillRect(50 + col * 60, 50 + row * 60, 50, 50);
            ctx.strokeRect(50 + col * 60, 50 + row * 60, 50, 50);
        }
    }
}

function initiateBooleanLogicLevel() {
    currentPuzzle = generateLogicPuzzle(["AND", "OR", "NOT"]);
    instructions.textContent = "Solve the logic puzzle: Click on the correct result of the displayed logic gate operation.";

    renderBooleanLogicGame(currentPuzzle);

    canvas.addEventListener('click', event => {
        const x = event.offsetX;
        const y = event.offsetY;
        const isCorrect = checkLogicGate(x, y, currentPuzzle);

        if (isCorrect) {
            updateScore(true);
            instructions.textContent = "Correct! The gate opened.";
            setTimeout(() => loadLevel(currentLevel), 2000);
        } else {
            updateScore(false);
        }
    });
}

function checkLogicGate(x, y, puzzle) {
    const trueArea = { x: 50, y: 100, width: 100, height: 50 };
    const falseArea = { x: 200, y: 100, width: 100, height: 50 };

    if (x > trueArea.x && x < trueArea.x + trueArea.width && y > trueArea.y && y < trueArea.y + trueArea.height) {
        return puzzle.correctOutput === true;
    } else if (x > falseArea.x && x < falseArea.x + falseArea.width && y > falseArea.y && y < falseArea.height) {
        return puzzle.correctOutput === false;
    }

    return false;
}

function renderBooleanLogicGame(puzzle) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("Logic Maze", canvas.width / 2, 30);
    ctx.fillText(`Gate: ${puzzle.selectedGate}`, canvas.width / 2, 60);
    ctx.fillText(`Input A: ${puzzle.inputA}`, canvas.width / 2, 90);

    if (puzzle.selectedGate !== "NOT") {
        ctx.fillText(`Input B: ${puzzle.inputB}`, canvas.width / 2, 120);
    }

    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(50, 100, 100, 50);
    ctx.fillStyle = "#fff";
    ctx.fillText("True", 100, 125);

    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(200, 100, 100, 50);
    ctx.fillStyle = "#fff";
    ctx.fillText("False", 250, 125);
}

function initiateDataStructuresLevel() {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5];
    const action = "unique"; // Could also be "sum"
    instructions.textContent = "Identify unique data elements by clicking anywhere in the game area.";

    renderDataStructuresGame(data, action);

    canvas.addEventListener('click', () => {
        if (action === "sum") {
            const sum = data.reduce((a, b) => a + b, 0);
            instructions.textContent = `The sum is: ${sum}.`;
            updateScore(true);
        } else if (action === "unique") {
            const unique = [...new Set(data)];
            instructions.textContent = `Unique values are: ${unique.join(", ")}.`;
            updateScore(true);
        }
    });
}

function renderDataStructuresGame(data, action) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "16px Arial";
    ctx.fillText("Data Mountain", canvas.width / 2, 30);
    ctx.fillText(`Data: ${data.join(", ")}`, canvas.width / 2, 60);
    ctx.fillText(`Click to calculate ${action}`, canvas.width / 2, 90);
}







