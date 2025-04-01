const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Canvas and grid settings
canvas.width = 400;
canvas.height = 400;
const gridSize = 66.66; // 6x6 grid

// Global game progress variables
let currentLevel = 0;
let completedLevels = 0; // Total levels completed
let attempts = 0;        // Attempts for current level

const margin = 1; // Offset to ensure objects are placed inside a cell

const levels = [
  {
    message: "Level 1: Let's launch! Move forward to reach the moon!",
    cosmo: { x: 1 * gridSize + margin, y: 2 * gridSize + margin, direction: 90 },
    moon: { x: 3 * gridSize + margin, y: 2 * gridSize + margin },
    meteors: [],
    sequence: ["forward"],
    correctSequence: ["forward", "forward"]
  },
  {
    message: "Level 2: Turn time! Spin left then move up to the moon.",
    cosmo: { x: 4 * gridSize + margin, y: 1 * gridSize + margin, direction: 180 },
    moon: { x: 4 * gridSize + margin, y: 3 * gridSize + margin },
    meteors: [{ x: 3 * gridSize + margin, y: 2 * gridSize + margin }],
    sequence: ["forward", "left"],
    correctSequence: ["left", "forward", "forward"]
  },
  {
    message: "Level 3: Meteor dodging! Go around the space rocks.",
    cosmo: { x: 1 * gridSize + margin, y: 4 * gridSize + margin, direction: 0 },
    moon: { x: 3 * gridSize + margin, y: 1 * gridSize + margin },
    meteors: [
      { x: 2 * gridSize + margin, y: 3 * gridSize + margin },
      { x: 2 * gridSize + margin, y: 2 * gridSize + margin }
    ],
    sequence: ["backward", "forward"],
    correctSequence: ["forward", "right", "forward", "forward"]
  },
  {
    message: "Level 4: Winding path! Plan your moves carefully.",
    cosmo: { x: 2 * gridSize + margin, y: 2 * gridSize + margin, direction: 0 },
    moon: { x: 4 * gridSize + margin, y: 4 * gridSize + margin },
    meteors: [
      { x: 1 * gridSize + margin, y: 1 * gridSize + margin },
      { x: 3 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["right", "forward"],
    correctSequence: ["forward", "left", "forward", "right", "forward"]
  },
  {
    message: "Level 5: Meteor maze! Find the safe path through.",
    cosmo: { x: 1 * gridSize + margin, y: 1 * gridSize + margin, direction: 90 },
    moon: { x: 4 * gridSize + margin, y: 4 * gridSize + margin },
    meteors: [
      { x: 2 * gridSize + margin, y: 2 * gridSize + margin },
      { x: 3 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["forward", "forward"],
    correctSequence: ["forward", "right", "forward", "forward"]
  },
  {
    message: "Level 6: Spin and slide! Turn left to avoid meteors.",
    cosmo: { x: 3 * gridSize + margin, y: 4 * gridSize + margin, direction: 270 },
    moon: { x: 3 * gridSize + margin, y: 2 * gridSize + margin },
    meteors: [
      { x: 3 * gridSize + margin, y: 3 * gridSize + margin },
      { x: 2 * gridSize + margin, y: 2 * gridSize + margin }
    ],
    sequence: ["left", "forward"],
    correctSequence: ["left", "forward", "forward", "right", "forward"]
  },
  {
    message: "Level 7: Long journey! Follow the stars home.",
    cosmo: { x: 1 * gridSize + margin, y: 3 * gridSize + margin, direction: 90 },
    moon: { x: 4 * gridSize + margin, y: 3 * gridSize + margin },
    meteors: [
      { x: 2 * gridSize + margin, y: 3 * gridSize + margin },
      { x: 3 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["forward", "right", "forward"],
    correctSequence: ["forward", "forward", "right", "forward"]
  },
  {
    message: "Level 8: Double trouble! Avoid both space rocks.",
    cosmo: { x: 4 * gridSize + margin, y: 1 * gridSize + margin, direction: 180 },
    moon: { x: 1 * gridSize + margin, y: 4 * gridSize + margin },
    meteors: [
      { x: 3 * gridSize + margin, y: 2 * gridSize + margin },
      { x: 2 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["right", "forward"],
    correctSequence: ["right", "forward", "forward", "left", "forward"]
  },
  {
    message: "Level 9: Final test! Show what you've learned.",
    cosmo: { x: 1 * gridSize + margin, y: 1 * gridSize + margin, direction: 90 },
    moon: { x: 4 * gridSize + margin, y: 4 * gridSize + margin },
    meteors: [
      { x: 2 * gridSize + margin, y: 2 * gridSize + margin },
      { x: 3 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["forward", "forward", "right"],
    correctSequence: ["forward", "forward", "right", "forward"]
  },
  {
    message: "Level 10: Champion challenge! Guide Cosmo home safely.",
    cosmo: { x: 3 * gridSize + margin, y: 3 * gridSize + margin, direction: 270 },
    moon: { x: 1 * gridSize + margin, y: 1 * gridSize + margin },
    meteors: [
      { x: 2 * gridSize + margin, y: 2 * gridSize + margin },
      { x: 3 * gridSize + margin, y: 2 * gridSize + margin },
      { x: 2 * gridSize + margin, y: 3 * gridSize + margin }
    ],
    sequence: ["backward", "right"],
    correctSequence: ["backward", "right", "forward", "forward", "forward"]
  }
];

// Load rocket images for each direction
const rocketImages = {
  0: new Image(),
  90: new Image(),
  180: new Image(),
  270: new Image()
};
rocketImages[0].src = "cosmo-rocket-0.png";
rocketImages[90].src = "cosmo-rocket-90.png";
rocketImages[180].src = "cosmo-rocket-180.png";
rocketImages[270].src = "cosmo-rocket-270.png";

const moonImage = new Image();
moonImage.src = "moon.png";

const meteorImage = new Image();
meteorImage.src = "meteor.png";

// Update progress display
function updateProgressDisplay() {
  const progressDisplay = document.getElementById("progressDisplay");
  if (progressDisplay) {
    progressDisplay.textContent = `Completed Levels: ${completedLevels} / ${levels.length} | Current Level Attempts: ${attempts}`;
  }
}

// Load saved debug progress from the server and resume from that level
function loadDebugProgress() {
  const studentData = JSON.parse(sessionStorage.getItem("studentData"));
  if (!studentData || !studentData.id) {
    loadLevel(0);
    return;
  }
  fetch(`/api/game/get-debug-progress?studentId=${studentData.id}`)
    .then(response => response.json())
    .then(data => {
      if (data.level !== undefined) {
        currentLevel = data.level - 1; // Convert to 0-indexed
      } else {
        currentLevel = 0;
      }
      attempts = data.attempts !== undefined ? data.attempts : 0;
      loadLevel(currentLevel);
    })
    .catch(error => {
      console.error("Error loading debug progress:", error);
      loadLevel(0);
    });
}

// Save debug progress (record the next level to play and attempts)
function saveDebugProgress() {
  const studentData = JSON.parse(sessionStorage.getItem("studentData"));
  if (!studentData || !studentData.id) {
    console.error("Student data not found in sessionStorage.");
    return;
  }
  // Save the next level (i.e. currentLevel + 2) so that if the student just completed level X (0-indexed),
  // they resume at level X+1 (1-indexed) next time.
  fetch("/api/game/record-debug-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      studentId: studentData.id,
      level: currentLevel + 2, // e.g., if currentLevel==2 then save level 4
      attempts: attempts
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log("Debug progress saved:", data);
    })
    .catch(error => {
      console.error("Error saving debug progress:", error);
    });
}

// Initialize the level (reset attempts for the new level)
function loadLevel(levelIndex) {
  const level = levels[levelIndex];
  attempts = 0;
  cosmo = { ...level.cosmo, width: gridSize, height: gridSize };
  moon = level.moon;
  meteors = level.meteors;
  sequence = [...level.sequence];
  document.getElementById("speech-text").textContent = level.message;
  document.getElementById("nextLevelButton").style.display = "none";
  updateSequenceUI();
  update();
  updateProgressDisplay();
}

// Update the sequence UI (draggable commands)
function updateSequenceUI() {
  const commandArea = document.getElementById("commandArea");
  commandArea.innerHTML = '<h4>Fix the Sequence:</h4>';
  sequence.forEach((command, index) => {
    const cmdElement = document.createElement("div");
    cmdElement.textContent = command;
    cmdElement.classList.add("command");
    cmdElement.draggable = true;
    cmdElement.dataset.index = index;
    commandArea.appendChild(cmdElement);
    cmdElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("index", index);
    });
  });
}

// Drag-and-drop handling for command area
document.getElementById("commandArea").addEventListener("dragover", (e) => e.preventDefault());
document.getElementById("commandArea").addEventListener("drop", (e) => {
  e.preventDefault();
  const draggedIndexStr = e.dataTransfer.getData("index");
  if (draggedIndexStr) {
    const draggedIndex = parseInt(draggedIndexStr);
    const targetElement = document.elementFromPoint(e.clientX, e.clientY);
    if (targetElement && targetElement.classList.contains("command")) {
      const targetIndex = parseInt(targetElement.dataset.index);
      if (!isNaN(draggedIndex) && !isNaN(targetIndex)) {
        [sequence[draggedIndex], sequence[targetIndex]] = [sequence[targetIndex], sequence[draggedIndex]];
        updateSequenceUI();
      }
    }
  } else {
    const newCommand = e.dataTransfer.getData("text/plain");
    if (newCommand) {
      sequence.push(newCommand);
      updateSequenceUI();
    }
  }
});

// Drag start for available commands
document.getElementById("availableCommands").addEventListener("dragstart", (e) => {
  const command = e.target.textContent.trim();
  console.log("Dragging available command:", command);
  e.dataTransfer.setData("text/plain", command);
});

// Trash bin: allow dropping to remove a command from the sequence
const trashBin = document.getElementById("trashBin");
trashBin.addEventListener("dragover", (e) => e.preventDefault());
trashBin.addEventListener("drop", (e) => {
  e.preventDefault();
  const index = parseInt(e.dataTransfer.getData("index"));
  if (!isNaN(index)) {
    sequence.splice(index, 1);
    updateSequenceUI();
  }
});

// Drawing functions
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawCosmo();
  drawMoon();
  drawMeteors();
}

function drawGrid() {
  ctx.strokeStyle = "#444";
  for (let x = 0; x <= canvas.width; x += gridSize) {
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.strokeRect(x, y, gridSize, gridSize);
    }
  }
}

function drawCosmo() {
  const image = rocketImages[cosmo.direction];
  ctx.drawImage(image, cosmo.x, cosmo.y, gridSize, gridSize);
}

function drawMoon() {
  ctx.drawImage(moonImage, moon.x, moon.y, gridSize, gridSize);
}

function drawMeteors() {
  meteors.forEach((meteor) => {
    ctx.drawImage(meteorImage, meteor.x, meteor.y, gridSize, gridSize);
  });
}

// Run the sequence of commands when Run button is clicked
document.getElementById("runButton").addEventListener("click", () => {
  attempts++;
  updateProgressDisplay();
  let cosmoCopy = { ...cosmo };
  let index = 0;
  let success = true;

  function executeCommand() {
    if (index < sequence.length && success) {
      const command = sequence[index];
      switch (command) {
        case "forward":
          if (cosmoCopy.direction === 0) cosmoCopy.y -= gridSize;
          if (cosmoCopy.direction === 90) cosmoCopy.x += gridSize;
          if (cosmoCopy.direction === 180) cosmoCopy.y += gridSize;
          if (cosmoCopy.direction === 270) cosmoCopy.x -= gridSize;
          break;
        case "backward":
          if (cosmoCopy.direction === 0) cosmoCopy.y += gridSize;
          if (cosmoCopy.direction === 90) cosmoCopy.x -= gridSize;
          if (cosmoCopy.direction === 180) cosmoCopy.y -= gridSize;
          if (cosmoCopy.direction === 270) cosmoCopy.x += gridSize;
          break;
        case "left":
          cosmoCopy.direction = (cosmoCopy.direction + 270) % 360;
          break;
        case "right":
          cosmoCopy.direction = (cosmoCopy.direction + 90) % 360;
          break;
        default:
          success = false;
          document.getElementById("speech-text").textContent = "Invalid command!";
          return;
      }
      // Check boundaries and collisions with meteors
      if (
        cosmoCopy.x < 0 ||
        cosmoCopy.x >= canvas.width ||
        cosmoCopy.y < 0 ||
        cosmoCopy.y >= canvas.height ||
        meteors.some(meteor => meteor.x === cosmoCopy.x && meteor.y === cosmoCopy.y)
      ) {
        success = false;
        document.getElementById("speech-text").textContent = "Oops! Cosmo crashed!";
      }
      cosmo.x = cosmoCopy.x;
      cosmo.y = cosmoCopy.y;
      cosmo.direction = cosmoCopy.direction;
      update();
      index++;
      setTimeout(executeCommand, 500);
    } else if (success && cosmo.x === moon.x && cosmo.y === moon.y) {
      document.getElementById("speech-text").textContent = "Well done! Cosmo reached the moon!";
      completedLevels++;
      updateProgressDisplay();
      // Save progress: record next level (currentLevel + 1 completed; save level currentLevel+2)
      saveDebugProgress();
      if (currentLevel < levels.length - 1) {
        document.getElementById("nextLevelButton").style.display = "block";
      } else {
        document.getElementById("speech-text").textContent = "Congratulations! You've completed all levels!";
      }
    } else {
      document.getElementById("speech-text").textContent = "Try again! Resetting Cosmo...";
      resetToOriginalPosition();
    }
  }
  executeCommand();
});

// Reset Cosmo to original position for current level
function resetToOriginalPosition() {
  cosmo = { ...levels[currentLevel].cosmo, width: gridSize, height: gridSize };
  update();
}
document.getElementById('menuButton').addEventListener('click', () => {
  window.location.href = '../KS1-SG.html';
});

// Next Level button handler
document.getElementById("nextLevelButton").addEventListener("click", () => {
  currentLevel++;
  loadLevel(currentLevel);
});

// Start button handler
document.getElementById("startButton").addEventListener("click", () => {
  loadLevel(currentLevel);
});

document.getElementById("resetGameButton").addEventListener("click", () => {
  currentLevel = 0;
  completedLevels = 0;
  attempts = 0;
  loadLevel(0);
  console.log("Game reset to Level 1");
});

// Instead of always starting at level 0, load saved debug progress on startup.
loadDebugProgress();
