// Initialize score and attempts
let score = 0;
let attempts = 0;
const scoreDisplay = document.getElementById('score');
const attemptsMessage = document.getElementById('attempts-message');

// Add sound effects
const correctSound = new Audio('correct.mp3');
const incorrectSound = new Audio('incorrect.mp3');

// Level 1: Binary Basics
const binaryQuestion = document.getElementById('binary-question');
const level1Message = document.getElementById('level1-message');
const choicesContainer = document.getElementById('choices-container');
const level2 = document.getElementById('level2');

// Function to generate a new binary question
function generateBinaryQuestion() {
    const binaryNumber = Math.floor(Math.random() * 256).toString(2);
    binaryQuestion.textContent = `Binary: ${binaryNumber}`;

    const correctAnswer = parseInt(binaryNumber, 2);
    const wrongAnswers = [
        correctAnswer + Math.floor(Math.random() * 10) + 1,
        correctAnswer - Math.floor(Math.random() * 10) - 1,
        correctAnswer + Math.floor(Math.random() * 5) + 1
    ];

    const choices = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);

    choicesContainer.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.classList.add('choice');
        button.textContent = choice;
        button.addEventListener('click', () => checkAnswer(choice));
        choicesContainer.appendChild(button);
    });

    return correctAnswer;
}

let correctAnswer = generateBinaryQuestion();

// Check answer function
function checkAnswer(choice) {
    if (choice === correctAnswer) {
        correctSound.play();
        level1Message.textContent = "Correct! Get the next 2 right to proceed...";
        score += 10;
        scoreDisplay.textContent = score;
        attempts++;
        if (attempts === 3) {
            level1Message.textContent = "Congratulations! Proceeding to Level 2...";
            setTimeout(() => {
                document.getElementById('level1').style.display = 'none';
                level2.style.display = 'block';
            }, 1000);
        } else {
            correctAnswer = generateBinaryQuestion();
        }
    } else {
        incorrectSound.play();
        level1Message.textContent = "Oops! That's not right. Try again.";
        score -= 5;
        scoreDisplay.textContent = score;
        attempts = 0;
        correctAnswer = generateBinaryQuestion();
    }
    attemptsMessage.textContent = `Attempts: ${attempts}/3`;
}

correctAnswer = generateBinaryQuestion();

