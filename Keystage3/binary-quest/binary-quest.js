function recordBinaryProgress(studentId, score) {
    fetch('/api/game/record-binary-progress-ks3', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, score })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Binary Quest progress recorded:', data);
        // Optionally, update the UI or take other action
      })
      .catch(error => {
        console.error('Error recording Binary Quest progress:', error);
      });
  }
  
// Global variables
let score = 0;
let attempts = 0;
const scoreDisplay = document.getElementById('score');
const attemptsMessage = document.getElementById('attempts-message');

// Sound effects (ensure these files exist in your project)
const correctSound = new Audio('correct.mp3');
const incorrectSound = new Audio('incorrect.mp3');

// LEVEL 1: Binary Basics Elements
const binaryQuestion = document.getElementById('binary-question');
const level1Message = document.getElementById('level1-message');
const choicesContainer = document.getElementById('choices-container');
const level1Div = document.getElementById('level1');

// LEVEL 2: Binary Addition Elements
const level2Div = document.getElementById('level2');
const binaryAddition = document.getElementById('binary-addition');
const additionInput = document.getElementById('addition-input');
const submitAddition = document.getElementById('submit-addition');
const level2Message = document.getElementById('level2-message');

// LEVEL 3: Binary Multiplication Elements
const level3Div = document.getElementById('level3');
const binaryMultiplication = document.getElementById('binary-multiplication');
const multiplicationInput = document.getElementById('multiplication-input');
const submitMultiplication = document.getElementById('submit-multiplication');
const level3Message = document.getElementById('level3-message');

// LEVEL 4: Bitwise Challenge Elements
const level4Div = document.getElementById('level4');
const bitwiseQuestion = document.getElementById('bitwise-question');
const bitwiseChoices = document.getElementById('bitwise-choices');
const level4Message = document.getElementById('level4-message');

// Completion Screen
const completionDiv = document.getElementById('completion');
const restartBtn = document.getElementById('restart-btn');

// LEVEL 1: Binary Basics
function initiateLevel1() {
  attempts = 0;
  level1Message.textContent = "";
  attemptsMessage.textContent = `Attempts: ${attempts}/3`;
  generateBinaryQuestion();
}

// Generate a binary question and multiple choice answers
function generateBinaryQuestion() {
  const binaryNumber = Math.floor(Math.random() * 256).toString(2).padStart(8, '0');
  binaryQuestion.textContent = `Binary: ${binaryNumber}`;
  const correctAnswer = parseInt(binaryNumber, 2);
  
  // Create three wrong answers with small offsets
  const wrongAnswers = [
    correctAnswer + Math.floor(Math.random() * 10) + 1,
    correctAnswer - (Math.floor(Math.random() * 10) + 1),
    correctAnswer + Math.floor(Math.random() * 5) + 1
  ];
  
  // Mix choices randomly
  const choices = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
  
  choicesContainer.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.classList.add('choice');
    btn.textContent = choice;
    btn.addEventListener('click', () => checkBinaryAnswer(choice, correctAnswer));
    choicesContainer.appendChild(btn);
  });
}

function checkBinaryAnswer(selected, correct) {
  if (selected === correct) {
    correctSound.play();
    level1Message.textContent = "Correct! Get the next 2 right to proceed...";
    score += 10;
    scoreDisplay.textContent = score;
    attempts++;
if (attempts === 3) {
  level1Message.textContent = "Great job! Moving on to Level 2...";
  setTimeout(() => {
    level1Div.style.display = 'none';
    initiateLevel2();
    level2Div.style.display = 'block';
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData?.id) {
      recordBinaryProgress(studentData.id, score);
    }
  }, 1000);
} else {
      setTimeout(generateBinaryQuestion, 500);
    }
  } else {
    incorrectSound.play();
    level1Message.textContent = "Oops! That's not right. Try again.";
    score = Math.max(score - 5, 0);
    scoreDisplay.textContent = score;
    attempts = 0;
    attemptsMessage.textContent = `Attempts: ${attempts}/3`;
    setTimeout(generateBinaryQuestion, 500);
  }
  attemptsMessage.textContent = `Attempts: ${attempts}/3`;
}

// LEVEL 2: Binary Addition
function initiateLevel2() {
  level2Message.textContent = "";
  additionInput.value = "";
  // Generate two numbers between 0 and 15 for clarity
  const num1 = Math.floor(Math.random() * 16);
  const num2 = Math.floor(Math.random() * 16);
  binaryAddition.textContent = `${num1.toString(2).padStart(4, '0')} + ${num2.toString(2).padStart(4, '0')}`;
  submitAddition.onclick = function() {
    const userSum = parseInt(additionInput.value);
    const correctSum = num1 + num2;
    if (userSum === correctSum) {
      correctSound.play();
      level2Message.textContent = "Correct! Moving on to Level 3...";
      score += 15;
      scoreDisplay.textContent = score;
      setTimeout(() => {
        level2Div.style.display = 'none';
        initiateLevel3();
        level3Div.style.display = 'block';
        const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData?.id) {
        recordBinaryProgress(studentData.id, score);}
      }, 1000);
    } else {
      incorrectSound.play();
      level2Message.textContent = "Incorrect. Try again!";
      score = Math.max(score - 5, 0);
      scoreDisplay.textContent = score;
    }
  }
}

// LEVEL 3: Binary Multiplication
function initiateLevel3() {
  level3Message.textContent = "";
  multiplicationInput.value = "";
  // Generate two numbers between 0 and 15
  const num1 = Math.floor(Math.random() * 16);
  const num2 = Math.floor(Math.random() * 16);
  binaryMultiplication.textContent = `${num1.toString(2).padStart(4, '0')} × ${num2.toString(2).padStart(4, '0')}`;
  submitMultiplication.onclick = function() {
    const userProduct = parseInt(multiplicationInput.value);
    const correctProduct = num1 * num2;
    if (userProduct === correctProduct) {
      correctSound.play();
      level3Message.textContent = "Well done! Proceeding to Level 4...";
      score += 20;
      scoreDisplay.textContent = score;
      setTimeout(() => {
        level3Div.style.display = 'none';
        initiateLevel4();
        level4Div.style.display = 'block';
        const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData?.id) {
        recordBinaryProgress(studentData.id, score);}
      }, 1000);
    } else {
      incorrectSound.play();
      level3Message.textContent = "Incorrect. Please try again.";
      score = Math.max(score - 5, 0);
      scoreDisplay.textContent = score;
    }
  }
}

// LEVEL 4: Bitwise Challenge
function initiateLevel4() {
  level4Message.textContent = "";
  bitwiseChoices.innerHTML = "";
  // Generate two numbers between 0 and 15
  const num1 = Math.floor(Math.random() * 16);
  const num2 = Math.floor(Math.random() * 16);
  // Randomly pick an operation: AND, OR, XOR
  const operations = ['AND', 'OR', 'XOR'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  let correctResult;
  switch(operation) {
    case 'AND':
      correctResult = num1 & num2;
      break;
    case 'OR':
      correctResult = num1 | num2;
      break;
    case 'XOR':
      correctResult = num1 ^ num2;
      break;
  }
  // Show the question with binary representations (padded to 4 bits)
  bitwiseQuestion.textContent = `${num1.toString(2).padStart(4, '0')} ${operation} ${num2.toString(2).padStart(4, '0')}`;
  
  // Create multiple choices
  const wrongAnswers = [
    correctResult + Math.floor(Math.random() * 3) + 1,
    correctResult - (Math.floor(Math.random() * 3) + 1),
    correctResult + Math.floor(Math.random() * 2) + 2
  ];
  const choices = [...wrongAnswers, correctResult].sort(() => Math.random() - 0.5);
  
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.classList.add('choice');
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      if (choice === correctResult) {
        correctSound.play();
        level4Message.textContent = "Correct! You have mastered Binary Quest!";
        score += 25;
        scoreDisplay.textContent = score;
        setTimeout(() => {
          level4Div.style.display = 'none';
          completionDiv.style.display = 'block';
        }, 1000);
      } else {
        incorrectSound.play();
        level4Message.textContent = "That's not right. Try again!";
        score = Math.max(score - 5, 0);
        scoreDisplay.textContent = score;
      }
    });
    bitwiseChoices.appendChild(btn);
  });
}

// Restart game function
restartBtn.addEventListener('click', () => {
  // Reset score and hide all levels except level 1
  score = 0;
  scoreDisplay.textContent = score;
  level1Div.style.display = 'block';
  level2Div.style.display = 'none';
  level3Div.style.display = 'none';
  level4Div.style.display = 'none';
  completionDiv.style.display = 'none';
  document.getElementById('guide-message').textContent = "Welcome back! Let’s start your adventure again.";
  initiateLevel1();
});

// Start the game at Level 1
initiateLevel1();
