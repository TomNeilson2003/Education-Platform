function recordAlgoProgress(studentId, level, score) {
    fetch('/api/game/record-algo-progress-ks3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, level, score })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Algorithm Adventure progress recorded:', data);
        // Optionally, update the UI or take other action
      })
      .catch(error => {
        console.error('Error recording Algorithm Adventure progress:', error);
      });
  }

// Get DOM elements
const levels = document.getElementById('level-list');
const instructions = document.getElementById('instructions');
const scoreDisplay = document.getElementById('score');
const levelInfoDisplay = document.getElementById('level-info');

let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let currentLevel = '1';
let score = 0;
let levelScore = 0;
let items = [];
let totalPoints = 0;
let highScores = JSON.parse(localStorage.getItem('algorithmAdventureHighScores')) || {};
let username = localStorage.getItem('algorithmAdventureUsername') || 'Explorer';
let achievements = JSON.parse(localStorage.getItem('algorithmAdventureAchievements')) || {
  perfectSorter: false,
  treasureHunter: false,
  logicMaster: false,
  dataWizard: false,
  binaryChampion: false
};
let animationFrameId;
let particles = [];
let timers = [];

// Level configuration for each level
const levelConfig = {
  "1": {
    name: "Sorting Forest",
    description: "Rearrange the numbers into ascending order. Click on a number to select it, then click another to swap their positions. Try to reduce the number of unsorted pairs!",
    algorithms: ["Bubble Sort", "Selection Sort", "Insertion Sort"],
    currentAlgorithm: "Bubble Sort",
    requiredScore: 50
  },
  "2": {
    name: "Treasure Plains",
    description: "Search for hidden treasures using Linear and Binary Search methods.",
    algorithms: ["Linear Search", "Binary Search"],
    currentAlgorithm: "Linear Search",
    requiredScore: 50
  },
  "3": {
    name: "Logic Maze",
    description: "Navigate through a maze by solving Boolean logic puzzles.",
    gates: ["AND", "OR", "NOT", "XOR", "NAND", "NOR"],
    requiredScore: 50
  },
  "4": {
    name: "Data Mountain",
    description: "Organize your expedition gear using different data structures.",
    structures: ["Arrays", "Lists", "Stacks", "Queues"],
    currentStructure: "Arrays",
    requiredScore: 50
  },
  "5": {
    name: "Binary Valley",
    description: "Master binary operations by converting and calculating binary numbers.",
    operations: ["Conversion", "Addition", "Bitwise"],
    currentOperation: "Conversion",
    requiredScore: 50
  }
};

// Initialize canvas text settings
ctx.textAlign = "center";
ctx.textBaseline = "middle";

// Event listener for level selection
levels.addEventListener('click', event => {
  if (event.target.tagName === 'LI' && event.target.dataset.level) {
    loadLevel(event.target.dataset.level);
  }
});

// Initialize game on load
window.onload = initializeGame;
function initializeGame() {
  if (!localStorage.getItem('algorithmAdventureUsername')) {
    const namePrompt = prompt("Welcome to Algorithm Adventure! What's your explorer name?", "Explorer");
    username = namePrompt || "Explorer";
    localStorage.setItem('algorithmAdventureUsername', username);
  }
  
  // Update header with username
  const headerText = document.querySelector('header p');
  if (headerText) {
    headerText.textContent = `${username}'s quest to master algorithms and computational thinking!`;
  }
  
  updateLevelList();
  instructions.innerHTML = `Welcome back, ${username}! Select a level to begin your adventure or continue your progress.`;
}

// Update the level list UI with completion indicators
function updateLevelList() {
  const levelItems = document.querySelectorAll('#level-list li');
  levelItems.forEach(item => {
    const level = item.dataset.level;
    if (highScores[level] && highScores[level] >= levelConfig[level].requiredScore) {
      item.classList.add('completed');
      if (!item.querySelector('.star-icon')) {
        const star = document.createElement('span');
        star.textContent = " ★";
        star.className = 'star-icon';
        item.appendChild(star);
      }
    } else {
      item.classList.remove('completed');
      const star = item.querySelector('.star-icon');
      if (star) star.remove();
    }
  });
}

// Score management
function updateScore(correct) {
  if (correct) {
    score += 10;
    levelScore += 10;
    scoreDisplay.textContent = `Score: ${score}`;
    createParticles(canvas.width / 2, canvas.height / 2, 10, "#ffd700");
    playSound('correct');
    instructions.innerHTML = "<span class='correct-text'>Good move!</span>";
    setTimeout(checkLevelCompletion, 1500);
  } else {
    instructions.innerHTML = "<span class='incorrect-text'>That swap didn’t improve the order. Try again!</span>";
    playSound('incorrect');
  }
}

function checkLevelCompletion() {
    if (levelScore >= levelConfig[currentLevel].requiredScore) {
      if (!highScores[currentLevel] || levelScore > highScores[currentLevel]) {
        highScores[currentLevel] = levelScore;
        localStorage.setItem('algorithmAdventureHighScores', JSON.stringify(highScores));
      }
  
      // Inside checkLevelCompletion function
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData && studentData.id) {
    recordAlgoProgress(studentData.id, parseInt(currentLevel), score); // Change levelScore to score
    }
  
      instructions.innerHTML = `<span class='success-text'>Level Complete! Well done!</span><br>Your score: ${levelScore}`;
      createParticles(canvas.width / 2, canvas.height / 2, 30, "#ffd700");
      playSound('levelComplete');
      checkAchievements();
      totalPoints += levelScore;
      levelScore = 0;
      updateLevelList();
      setTimeout(showLevelCompleteDialog, 2000);
    }
  }

function showLevelCompleteDialog() {
  const nextLevel = parseInt(currentLevel) + 1;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Level ${currentLevel} Complete!</h2>
      <p>You've mastered ${levelConfig[currentLevel].name}!</p>
      <p>Your score: ${highScores[currentLevel]}</p>
      <p>What would you like to do next?</p>
      <div class="modal-buttons">
        <button id="replay-level">Replay Level</button>
        ${nextLevel <= 5 ? `<button id="next-level">Next Level</button>` : ''}
        <button id="select-level">Select Level</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('replay-level').addEventListener('click', () => {
    document.body.removeChild(modal);
    loadLevel(currentLevel);
  });
  if (nextLevel <= 5) {
    document.getElementById('next-level').addEventListener('click', () => {
      document.body.removeChild(modal);
      loadLevel(String(nextLevel));
    });
  }
  document.getElementById('select-level').addEventListener('click', () => {
    document.body.removeChild(modal);
    instructions.textContent = "Select a level to begin your adventure!";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    renderLevelSelect();
  });
}

function checkAchievements() {
  if (currentLevel === '1' && levelScore >= 100) {
    unlockAchievement('perfectSorter', 'Perfect Sorter', 'Sort items without making any mistakes');
  }
  if (currentLevel === '2' && levelScore >= 100) {
    unlockAchievement('treasureHunter', 'Treasure Hunter', 'Find all treasures with minimum attempts');
  }
  if (currentLevel === '3' && levelScore >= 100) {
    unlockAchievement('logicMaster', 'Logic Master', 'Solve the logic puzzle flawlessly');
  }
  if (currentLevel === '4' && levelScore >= 100) {
    unlockAchievement('dataWizard', 'Data Wizard', 'Master data structure operations');
  }
  if (currentLevel === '5' && levelScore >= 100) {
    unlockAchievement('binaryChampion', 'Binary Champion', 'Become proficient in binary operations');
  }
  // Check if all levels completed
  let allCompleted = true;
  for (let i = 1; i <= 5; i++) {
    if (!highScores[i] || highScores[i] < levelConfig[i].requiredScore) {
      allCompleted = false;
      break;
    }
  }
  if (allCompleted) {
    unlockAchievement('completionist', 'Completionist', 'Complete all levels in Algorithm Adventure');
  }
}

function unlockAchievement(id, title, description) {
  if (!achievements[id]) {
    achievements[id] = true;
    localStorage.setItem('algorithmAdventureAchievements', JSON.stringify(achievements));
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <div class="achievement-info">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('achievement-show');
      setTimeout(() => {
        notification.classList.remove('achievement-show');
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 500);
      }, 3000);
    }, 100);
    playSound('achievement');
  }
}

// Level loading and UI update
function loadLevel(level) {
  timers.forEach(timer => clearTimeout(timer));
  timers = [];
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  currentLevel = level;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  resetCanvasEventListeners();
  levelScore = 0;
  updateLevelInfoDisplay();
  switch (level) {
    case '1':
      initiateSortingLevel();
      break;
    case '2':
      initiateSearchingLevel();
      break;
    case '3':
      initiateBooleanLogicLevel();
      break;
    case '4':
      initiateDataStructuresLevel();
      break;
    case '5':
      initiateBinaryLevel();
      break;
    default:
      instructions.textContent = "Select a level to begin your quest!";
      renderLevelSelect();
  }
}

function updateLevelInfoDisplay() {
  if (!levelConfig[currentLevel]) return;
  const config = levelConfig[currentLevel];
  levelInfoDisplay.innerHTML = `
    <h3>${config.name}</h3>
    <p>${config.description}</p>
  `;
  // Add a level tip for better explanation
  levelInfoDisplay.innerHTML += `<p class="level-details">${getTipForLevel(currentLevel)}</p>`;
  
  let selectorHtml = '';
  if (currentLevel === '1') {
    selectorHtml = `
      <div class="algorithm-selection">
        <label for="algorithm-selector">Algorithm: </label>
        <select id="algorithm-selector" class="custom-select">
          ${config.algorithms.map(algo => `<option value="${algo}" ${config.currentAlgorithm === algo ? 'selected' : ''}>${algo}</option>`).join('')}
        </select>
      </div>
    `;
  } else if (currentLevel === '2') {
    selectorHtml = `
      <div class="algorithm-selection">
        <label for="algorithm-selector">Search Method: </label>
        <select id="algorithm-selector" class="custom-select">
          ${config.algorithms.map(algo => `<option value="${algo}" ${config.currentAlgorithm === algo ? 'selected' : ''}>${algo}</option>`).join('')}
        </select>
      </div>
    `;
  } else if (currentLevel === '4') {
    selectorHtml = `
      <div class="algorithm-selection">
        <label for="algorithm-selector">Data Structure: </label>
        <select id="algorithm-selector" class="custom-select">
          ${config.structures.map(struct => `<option value="${struct}" ${config.currentStructure === struct ? 'selected' : ''}>${struct}</option>`).join('')}
        </select>
      </div>
    `;
  }
  levelInfoDisplay.innerHTML += selectorHtml;
  const selector = document.getElementById('algorithm-selector');
  if (selector) {
    selector.addEventListener('change', function() {
      if (currentLevel === '1') {
        levelConfig[currentLevel].currentAlgorithm = this.value;
        initiateSortingLevel();
      } else if (currentLevel === '2') {
        levelConfig[currentLevel].currentAlgorithm = this.value;
        initiateSearchingLevel();
      } else if (currentLevel === '4') {
        levelConfig[currentLevel].currentStructure = this.value;
        initiateDataStructuresLevel();
      }
    });
  }
}

function getTipForLevel(level) {
  switch(level) {
    case '1': return "Try to swap numbers strategically to minimize inversions!";
    case '2': return "Remember: sometimes the middle chest gives you a clue!";
    case '3': return "Boolean puzzles can be tricky; think logically!";
    case '4': return "Organize your gear wisely to conquer Data Mountain!";
    case '5': return "Binary numbers are fun; convert them to unlock mysteries!";
    default: return "";
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

/* Visual Effects */
function createParticles(x, y, amount, color) {
  for (let i = 0; i < amount; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      color: color,
      size: Math.random() * 5 + 2,
      life: 100
    });
  }
  if (!animationFrameId) animateParticles();
}

function animateParticles() {
  ctx.save();
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 2;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life / 100;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  if (particles.length > 0) {
    animationFrameId = requestAnimationFrame(animateParticles);
  } else {
    animationFrameId = null;
  }
}

/* Audio Effects */
function playSound(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  switch(type) {
    case 'correct':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case 'incorrect':
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
    case 'levelComplete':
      playJingle(audioContext);
      break;
    case 'achievement':
      playAchievementSound(audioContext);
      break;
  }
}

function playJingle(audioContext) {
  const notes = [
    { freq: 440, duration: 0.1 },
    { freq: 554, duration: 0.1 },
    { freq: 659, duration: 0.1 },
    { freq: 880, duration: 0.3 }
  ];
  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'sine';
    oscillator.frequency.value = note.freq;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + note.duration);
    oscillator.start(audioContext.currentTime + index * 0.15);
    oscillator.stop(audioContext.currentTime + index * 0.15 + note.duration);
  });
}

function playAchievementSound(audioContext) {
  const notes = [
    { freq: 523, duration: 0.1 },
    { freq: 659, duration: 0.1 },
    { freq: 784, duration: 0.1 },
    { freq: 1046, duration: 0.3 }
  ];
  notes.forEach((note, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.type = 'triangle';
    oscillator.frequency.value = note.freq;
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.12 + note.duration);
    oscillator.start(audioContext.currentTime + index * 0.12);
    oscillator.stop(audioContext.currentTime + index * 0.12 + note.duration);
  });
}

/* Level Rendering */
function renderLevelSelect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "24px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText("Algorithm Adventure", canvas.width / 2, 50);
  ctx.font = "16px Arial";
  ctx.fillText("Select a level from the sidebar to begin your quest!", canvas.width / 2, 100);
  const levelPositions = [
    { x: 200, y: 200 },
    { x: 400, y: 200 },
    { x: 600, y: 200 },
    { x: 300, y: 350 },
    { x: 500, y: 350 }
  ];
  const levelIcons = ["🌲", "🏝️", "🧩", "⛰️", "🔢"];
  for (let i = 0; i < levelPositions.length; i++) {
    const level = i + 1;
    const pos = levelPositions[i];
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 50, 0, Math.PI * 2);
    ctx.fillStyle = (highScores[level] && highScores[level] >= levelConfig[level].requiredScore) ? "#4CAF50" : "#3498db";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(level, pos.x, pos.y - 10);
    ctx.font = "32px Arial";
    ctx.fillText(levelIcons[i], pos.x, pos.y + 25);
  }
  ctx.beginPath();
  ctx.moveTo(levelPositions[0].x + 50, levelPositions[0].y);
  ctx.lineTo(levelPositions[1].x - 50, levelPositions[1].y);
  ctx.lineTo(levelPositions[2].x - 50, levelPositions[2].y);
  ctx.moveTo(levelPositions[1].x, levelPositions[1].y + 50);
  ctx.lineTo(levelPositions[3].x, levelPositions[3].y - 50);
  ctx.moveTo(levelPositions[2].x - 100, levelPositions[2].y + 50);
  ctx.lineTo(levelPositions[4].x, levelPositions[4].y - 50);
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 2;
  ctx.stroke();
  const achievementCount = Object.values(achievements).filter(Boolean).length;
  const totalAchievements = Object.keys(achievements).length;
  ctx.font = "16px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(`Achievements: ${achievementCount}/${totalAchievements}`, canvas.width / 2, 500);
  const barWidth = 300, barHeight = 20;
  const startX = (canvas.width - barWidth) / 2;
  ctx.fillStyle = "#ddd";
  ctx.fillRect(startX, 520, barWidth, barHeight);
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(startX, 520, (achievementCount / totalAchievements) * barWidth, barHeight);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, 520, barWidth, barHeight);
}

/* HELPER FUNCTIONS FOR SORTING LEVEL */
function countInversions(arr) {
  let inversions = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  return inversions;
}

function renderSortingGame(selectedIndex = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px Arial";
  const startX = 50;
  const gap = 60;
  for (let i = 0; i < items.length; i++) {
    let x = startX + i * gap;
    ctx.fillStyle = "#3498db";
    ctx.fillRect(x, canvas.height / 2 - 20, 50, 40);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, canvas.height / 2 - 20, 50, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText(items[i], x + 25, canvas.height / 2);
    if (i === selectedIndex) {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 4;
      ctx.strokeRect(x - 2, canvas.height / 2 - 22, 54, 44);
    }
  }
}

/* Animated Swap for Sorting Level */
function animateSwap(index1, index2, callback) {
  const duration = 500;
  const startTime = performance.now();
  const startX = 50;
  const gap = 60;
  const pos1 = startX + index1 * gap;
  const pos2 = startX + index2 * gap;
  const value1 = items[index1];
  const value2 = items[index2];
  
  function animate(time) {
    let elapsed = time - startTime;
    let progress = Math.min(elapsed / duration, 1);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    for (let i = 0; i < items.length; i++) {
      let x = startX + i * gap;
      let drawX = x;
      if (i === index1) {
        drawX = pos1 + (pos2 - pos1) * progress;
      } else if (i === index2) {
        drawX = pos2 + (pos1 - pos2) * progress;
      }
      ctx.fillStyle = "#3498db";
      ctx.fillRect(drawX, canvas.height / 2 - 20, 50, 40);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(drawX, canvas.height / 2 - 20, 50, 40);
      ctx.fillStyle = "#fff";
      let textVal = items[i];
      ctx.fillText(textVal, drawX + 25, canvas.height / 2);
    }
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      [items[index1], items[index2]] = [items[index2], items[index1]];
      callback();
    }
  }
  requestAnimationFrame(animate);
}

/* LEVEL 1: SORTING FOREST */
function initiateSortingLevel() {
  const algorithm = levelConfig["1"].currentAlgorithm;
  items = [];
  for (let i = 0; i < 10; i++) {
    items.push(Math.floor(Math.random() * 90) + 10);
  }
  renderSortingGame();
  instructions.innerHTML = `<strong>${algorithm}</strong>: Rearrange the numbers into ascending order.<br>
    Click on a number to select it, then click on another to swap them.`;
  
  const demoButton = document.createElement('button');
  demoButton.textContent = "Show Algorithm Demo";
  demoButton.className = "demo-button";
  let sortingInProgress = false;
  demoButton.addEventListener('click', () => {
    if (sortingInProgress) return;
    sortingInProgress = true;
    demoButton.disabled = true;
    if (algorithm === "Bubble Sort") {
      demoBubbleSort();
    } else if (algorithm === "Selection Sort") {
      demoSelectionSort();
    } else if (algorithm === "Insertion Sort") {
      demoInsertionSort();
    }
  });
  
  const resetButton = document.createElement('button');
  resetButton.textContent = "Reset Array";
  resetButton.className = "reset-button";
  resetButton.addEventListener('click', () => {
    if (sortingInProgress) return;
    initiateSortingLevel();
  });
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = "button-container";
  buttonContainer.appendChild(demoButton);
  buttonContainer.appendChild(resetButton);
  instructions.appendChild(buttonContainer);
  
  let selectedIndex = null;
  const startX = 50;
  const gap = 60;
  canvas.addEventListener('click', function sortingClick(event) {
    let clickedIndex = Math.floor((event.offsetX - startX) / gap);
    if (clickedIndex < 0 || clickedIndex >= items.length) return;
    if (selectedIndex === null) {
      selectedIndex = clickedIndex;
      renderSortingGame(selectedIndex);
    } else {
      let beforeInversions = countInversions(items);
      animateSwap(selectedIndex, clickedIndex, () => {
        let afterInversions = countInversions(items);
        if (afterInversions < beforeInversions) {
          updateScore(true);
        } else {
          updateScore(false);
        }
        renderSortingGame();
        if (isSorted(items)) {
          instructions.innerHTML = "<span class='success-text'>Well done! All items are sorted.</span>";
          unlockAchievement('perfectSorter', 'Perfect Sorter', 'Sort items without making any mistakes');
          setTimeout(checkLevelCompletion, 1500);
        }
      });
      selectedIndex = null;
    }
  });
  
  function demoBubbleSort() {
    let array = [...items];
    let steps = [];
    let n = array.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ type: 'compare', indices: [j, j + 1] });
        if (array[j] > array[j + 1]) {
          [array[j], array[j + 1]] = [array[j + 1], array[j]];
          steps.push({ type: 'swap', indices: [j, j + 1] });
        }
      }
    }
    animateSortingSteps(steps);
  }
  
  function demoSelectionSort() {
    let array = [...items];
    let steps = [];
    let n = array.length;
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({ type: 'compare', indices: [minIndex, j] });
        if (array[j] < array[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        [array[i], array[minIndex]] = [array[minIndex], array[i]];
        steps.push({ type: 'swap', indices: [i, minIndex] });
      }
    }
    animateSortingSteps(steps);
  }
  
  function demoInsertionSort() {
    let array = [...items];
    let steps = [];
    let n = array.length;
    for (let i = 1; i < n; i++) {
      let key = array[i];
      let j = i - 1;
      steps.push({ type: 'highlight', indices: [i] });
      while (j >= 0 && array[j] > key) {
        steps.push({ type: 'compare', indices: [j, j + 1] });
        array[j + 1] = array[j];
        steps.push({ type: 'move', indices: [j, j + 1] });
        j--;
      }
      array[j + 1] = key;
      steps.push({ type: 'insert', index: j + 1, value: key });
    }
    animateSortingSteps(steps);
  }
  
  function isSorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i+1]) return false;
    }
    return true;
  }
}

/* LEVEL 2: SEARCHING ALGORITHMS (Treasure Plains) */
function initiateSearchingLevel() {
  const algorithm = levelConfig["2"].currentAlgorithm;
  const numChests = 10;
  let searchItems = [];
  for (let i = 0; i < numChests; i++) {
    searchItems.push(Math.floor(Math.random() * 90) + 10);
  }
  if (algorithm === "Binary Search") searchItems.sort((a, b) => a - b);
  const targetValue = searchItems[Math.floor(Math.random() * numChests)];
  instructions.innerHTML = `<strong>${algorithm}</strong>: Find the treasure with value <strong>${targetValue}</strong>.<br>` +
    (algorithm === "Linear Search" ? "Click on the chests from left to right until you find the treasure."
      : "Use hints: click the middle chest and follow the high/low clues.");
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const startX = 50;
  const gap = 60;
  for (let i = 0; i < numChests; i++) {
    let x = startX + i * gap;
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(x, canvas.height / 2 - 20, 50, 40);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(x, canvas.height / 2 - 20, 50, 40);
    ctx.fillStyle = "#fff";
    ctx.fillText(searchItems[i], x + 25, canvas.height / 2);
  }
  
  canvas.addEventListener('click', function searchClick(event) {
    let clickedIndex = Math.floor((event.offsetX - 50) / 60);
    if (clickedIndex < 0 || clickedIndex >= numChests) return;
    let guess = searchItems[clickedIndex];
    if (guess === targetValue) {
      updateScore(true);
      instructions.innerHTML = "<span class='success-text'>You found the treasure!</span>";
      canvas.removeEventListener('click', searchClick);
      setTimeout(checkLevelCompletion, 1500);
    } else {
      let hint = (guess < targetValue) ? "Too low!" : "Too high!";
      instructions.innerHTML = `<span class='incorrect-text'>${hint} Try another chest.</span>`;
      updateScore(false);
    }
  });
}

/* LEVEL 3: BOOLEAN LOGIC PUZZLES (Logic Maze) */
function initiateBooleanLogicLevel() {
  const puzzles = [
    { question: "true AND false", answer: false },
    { question: "true OR false", answer: true },
    { question: "NOT false", answer: true },
    { question: "false OR false", answer: false },
    { question: "true XOR true", answer: false },
    { question: "true NAND false", answer: true }
  ];
  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  instructions.innerHTML = `Solve this logic puzzle to unlock the path: What is the result of <strong>${puzzle.question}</strong>?`;
  
  const btnContainer = document.createElement('div');
  btnContainer.style.marginTop = "10px";
  const trueBtn = document.createElement('button');
  trueBtn.textContent = "True";
  const falseBtn = document.createElement('button');
  falseBtn.textContent = "False";
  btnContainer.appendChild(trueBtn);
  btnContainer.appendChild(falseBtn);
  instructions.appendChild(btnContainer);
  
  trueBtn.addEventListener('click', () => {
    if (puzzle.answer === true) {
      updateScore(true);
      instructions.innerHTML = "<span class='success-text'>Correct! The door opens!</span>";
      setTimeout(checkLevelCompletion, 1500);
    } else {
      updateScore(false);
    }
  });
  
  falseBtn.addEventListener('click', () => {
    if (puzzle.answer === false) {
      updateScore(true);
      instructions.innerHTML = "<span class='success-text'>Correct! The door opens!</span>";
      setTimeout(checkLevelCompletion, 1500);
    } else {
      updateScore(false);
    }
  });
}

/* LEVEL 4: DATA STRUCTURES (Data Mountain) */
function initiateDataStructuresLevel() {
  const structure = levelConfig["4"].currentStructure;
  let gearItems = ["Rope", "Boots", "Helmet", "Map", "Water"];
  let expectedOrder = [];
  if (structure === "Stacks") {
    expectedOrder = [...gearItems].reverse();
    instructions.innerHTML = "This is a Stack. Click the top (rightmost) item to pop it off in LIFO order.";
  } else if (structure === "Queues") {
    expectedOrder = [...gearItems];
    instructions.innerHTML = "This is a Queue. Click the first (leftmost) item to dequeue in FIFO order.";
  } else {
    expectedOrder = [...gearItems].sort();
    instructions.innerHTML = "Arrange the gear in alphabetical order by clicking the items in the correct sequence.";
  }
  
  renderGearItems(gearItems);
  
  canvas.addEventListener('click', function gearClick(event) {
    let clickedIndex = Math.floor((event.offsetX - 50) / 120);
    if (clickedIndex < 0 || clickedIndex >= gearItems.length) return;
    if (gearItems[clickedIndex] === expectedOrder[0]) {
      gearItems.splice(clickedIndex, 1);
      expectedOrder.shift();
      updateScore(true);
      renderGearItems(gearItems);
      if (gearItems.length === 0) {
        instructions.innerHTML = "<span class='success-text'>You have organized your gear perfectly!</span>";
        canvas.removeEventListener('click', gearClick);
        setTimeout(checkLevelCompletion, 1500);
      }
    } else {
      updateScore(false);
    }
  });
  
  function renderGearItems(gear) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const startX = 50;
    const gap = 120;
    ctx.font = "20px Arial";
    gear.forEach((item, index) => {
      let x = startX + index * gap;
      ctx.fillStyle = "#8E44AD";
      ctx.fillRect(x, canvas.height / 2 - 20, 100, 40);
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(x, canvas.height / 2 - 20, 100, 40);
      ctx.fillStyle = "#fff";
      ctx.fillText(item, x + 50, canvas.height / 2);
    });
  }
}

/* LEVEL 5: BINARY OPERATIONS (Binary Valley) */
function initiateBinaryLevel() {
  let num = Math.floor(Math.random() * 256);
  let binaryStr = num.toString(2).padStart(8, '0');
  instructions.innerHTML = `Convert the following binary number to decimal:<br><strong>${binaryStr}</strong><br>`;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "40px Arial";
  ctx.fillStyle = "#333";
  ctx.fillText(binaryStr, canvas.width / 2, canvas.height / 2 - 50);
  
  // Create an embedded text input and submit button instead of using prompt
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "Enter decimal value";
  input.className = "binary-input";
  const submitBtn = document.createElement('button');
  submitBtn.textContent = "Submit";
  submitBtn.className = "binary-submit";
  
  instructions.appendChild(input);
  instructions.appendChild(submitBtn);
  
  submitBtn.addEventListener('click', () => {
    const answer = parseInt(input.value);
    if (answer === num) {
      updateScore(true);
      instructions.innerHTML = "<span class='success-text'>Correct! You have mastered binary conversion!</span>";
      setTimeout(checkLevelCompletion, 1500);
    } else {
      updateScore(false);
      instructions.innerHTML = "<span class='incorrect-text'>Incorrect. Try again!</span>";
      instructions.appendChild(input);
      instructions.appendChild(submitBtn);
    }
  });
}
