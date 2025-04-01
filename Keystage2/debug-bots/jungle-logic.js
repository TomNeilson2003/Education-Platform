const canvas = document.getElementById('jungleCanvas');
const ctx = canvas.getContext('2d');
const commandList = document.getElementById('command-list');
const message = document.getElementById('message');
const currentLevelDisplay = document.getElementById('current-level');
const targetXDisplay = document.getElementById('target-x');
const targetYDisplay = document.getElementById('target-y');
const xInput = document.getElementById('x-input');
const yInput = document.getElementById('y-input');
const setTargetButton = document.getElementById('set-target');
const popupContainer = document.getElementById('popup-container');
const speechText = document.getElementById('speech-text');
const levelDescription = document.getElementById('level-description');
const hintDisplay = document.getElementById('hint');
const hintButton = document.getElementById('hint-button'); // Get the hint button

const gridSize = 50; // Size of each grid square
let parrot = { x: 0, y: 0, direction: 0 }; // Parrot starts at the bottom-left
let target = { x: null, y: null }; // Target coordinates
let isRunning = false; // Tracks if the code is running
let currentLevel = 0; // Start at level 0 (index of the array)
let maxCommandsAllowed = 5; // Maximum number of commands allowed (changes per level)
let availableCommands = ['moveForward', 'turnLeft', 'turnRight']; // Commands available (changes per level)
let obstacles = []; // Array to store obstacles
let collectibles = []; // Array to store collectibles
let bridges = []; // Array for bridges
let animationFrame = 0;

// Preload images
const parrotImg = new Image();
parrotImg.src = 'parrot.png';

const obstacleImg = new Image();
obstacleImg.src = 'vine.png';

const collectibleImg = new Image();
collectibleImg.src = 'treasure.png';

const bridgeImg = new Image();
bridgeImg.src = 'bridge.png';



const backgroundImage = new Image();
backgroundImage.src = 'background.png';



// Level definitions (same as before with updated Level 2 hint and removed tree)
const levels = [
    {
        title: "Level 1: First Steps",
        description: "Help the parrot reach the target using simple commands in sequence.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 3, y: 0 }, // Reverted to original target
        maxCommands: 5,
        commands: ['moveForward', 'turnLeft', 'turnRight'],
        obstacles: [],
        collectibles: [],
        bridges: [],
        hint: "Try using 'Move Forward' three times to reach the target at x: 3, y: 0!" // Original hint
    },
    {
        title: "Level 2: Turning Corners",
        description: "The path has a corner. Use turn commands followed by movement.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 3, y: 2 }, // Reverted to original target
        maxCommands: 6,
        commands: ['moveForward', 'turnLeft', 'turnRight'],
        obstacles: [
            {x: 4, y: 0}, {x: 2, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}
        ],
        collectibles: [],
        bridges: [],
        hint: "Try moving forward three times, then turning right, and then moving forward twice to reach x: 3, y: 2!" // Updated hint
    },
    {
        title: "Level 3: The Path Less Traveled",
        description: "Navigate through the vines to reach the target.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 5, y: 4 }, // Reverted to original target
        maxCommands: 13,
        commands: ['moveForward', 'turnLeft', 'turnRight'],
        obstacles: [
            {x: 2, y: 0}, {x: 4, y: 0}, {x: 6, y: 0},
            {x: 1, y: 1}, {x: 3, y: 1}, {x: 5, y: 1},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 6, y: 2},
            {x: 1, y: 3}, {x: 3, y: 3}, {x: 6, y: 3},
            {x: 2, y: 4}, {x: 4, y: 4}, {x: 6, y: 4},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 4}], // Kept inverted y
        bridges: [],
        hint: "Create a sequence of commands to navigate the winding path to x: 5, y: 4." // Original hint
    },
    {
        title: "Level 4: Precise Movements",
        description: "Reach the target using exactly the right sequence of moves.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 6, y: 5 }, // Reverted to original target
        maxCommands: 12,
        commands: ['moveForward', 'turnLeft', 'turnRight'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0},
            {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}, {x: 6, y: 1},
            {x: 1, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 5, y: 2}, {x: 6, y: 2},
            {x: 1, y: 3}, {x: 2, y: 3}, {x: 3, y: 3}, {x: 5, y: 3},
            {x: 1, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4},
            {x: 1, y: 5}, {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5},
        ], // Kept inverted y
        collectibles: [{x: 2, y: 4}], // Kept inverted y
        bridges: [],
        hint: "Plan your route carefully! You'll need to make many turns to reach x: 6, y: 5." // Original hint
    },
    {
        title: "Level 5: Sequence Master",
        description: "Use everything you've learned about sequences to complete a complex path.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 9, y: 6 }, // Reverted to original target
        maxCommands: 15,
        commands: ['moveForward', 'turnLeft', 'turnRight'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 7, y: 0}, {x: 8, y: 0},
            {x: 2, y: 1}, {x: 5, y: 1}, {x: 7, y: 1}, {x: 9, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 7, y: 2}, {x: 9, y: 2},
            {x: 4, y: 3}, {x: 6, y: 3}, {x: 7, y: 3}, {x: 9, y: 3},
            {x: 2, y: 4}, {x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4},
            {x: 2, y: 5}, {x: 4, y: 5}, {x: 5, y: 5}, {x: 6, y: 5}, {x: 8, y: 5},
            {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6}, {x: 7, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 8, y: 2}, {x: 5, y: 4}, {x: 3, y: 6}], // Kept inverted y
        bridges: [],
        hint: "Plan carefully and try to collect all the treasures along the way to x: 9, y: 6!" // Original hint
    },
    {
        title: "Level 6: Repeat Pattern",
        description: "Use loops to repeat patterns of movement.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 6, y: 3 }, // Reverted to original target
        maxCommands: 6,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        obstacles: [{x: 2, y: 1}, {x: 4, y: 1}, {x: 3, y: 2}, {x: 5, y: 2}, {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 4}], // Kept inverted y
        collectibles: [],
        bridges: [],
        hint: "The 'Repeat 3 Times' command can help you move more efficiently to x: 6, y: 3!" // Original hint
    },
    {
        title: "Level 7: Spiral Waterfall",
        description: "Navigate a spiral path using loops to save commands.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 5, y: 5 }, // Reverted to original target
        maxCommands: 8,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0},
            {x: 2, y: 1}, {x: 6, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 4, y: 2}, {x: 6, y: 2},
            {x: 2, y: 3}, {x: 6, y: 3},
            {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 6, y: 4},
            {x: 6, y: 5},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 5}], // Kept inverted y
        bridges: [],
        hint: "Try using the repeat command with turn and move forward patterns to reach x: 5, y: 5." // Original hint
    },
    {
        title: "Level 8: Looping the Loop",
        description: "Create efficient code using loops to navigate a winding path.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 8, y: 6 }, // Reverted to original target
        maxCommands: 10,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 4, y: 0}, {x: 6, y: 0}, {x: 8, y: 0},
            {x: 2, y: 1}, {x: 4, y: 1}, {x: 6, y: 1}, {x: 8, y: 1},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 6, y: 2}, {x: 8, y: 2},
            {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 3}, {x: 8, y: 3},
            {x: 2, y: 4}, {x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4},
            {x: 2, y: 5}, {x: 4, y: 5}, {x: 6, y: 5},
            {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 6}, {x: 5, y: 6}, {x: 7, y: 6}], // Kept inverted y
        bridges: [],
        hint: "Look for repeating patterns of movement that can be simplified with loops to reach x: 8, y: 6." // Original hint
    },
    {
        title: "Level 9: Loop Combinations",
        description: "Combine different types of loops to solve complex paths.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 7, y: 5 }, // Reverted to original target
        maxCommands: 12,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 5, y: 0}, {x: 6, y: 0},
            {x: 2, y: 1}, {x: 6, y: 1},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 6, y: 2},
            {x: 2, y: 3}, {x: 4, y: 3}, {x: 5, y: 3}, {x: 6, y: 3},
            {x: 2, y: 4}, {x: 6, y: 4},
            {x: 2, y: 5}, {x: 3, y: 5}, {x: 4, y: 5}, {x: 5, y: 5},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}], // Kept inverted y
        bridges: [],
        hint: "Think about ways to break down the path into repeating patterns to get to x: 7, y: 5." // Original hint
    },
    {
        title: "Level 10: Loop Master",
        description: "Put all your loop knowledge to the test in this challenging level.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 9, y: 6 }, // Reverted to original target
        maxCommands: 15,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {x: 8, y: 0},
            {x: 2, y: 1}, {x: 8, y: 1},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 6, y: 2}, {x: 8, y: 2},
            {x: 2, y: 3}, {x: 4, y: 3}, {x: 8, y: 3},
            {x: 2, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 8, y: 4},
            {x: 2, y: 5}, {x: 8, y: 5},
            {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6}, {x: 7, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 2}, {x: 5, y: 2}, {x: 7, y: 2}, {x: 6, y: 3}, {x: 3, y: 4}, {x: 7, y: 4}, {x: 4, y: 5}, {x: 6, y: 5}], // Kept inverted y
        bridges: [{x: 4, y: 0}, {x: 1, y: 3}, {x: 5, y: 4}, {x: 8, y: 6}], // Kept inverted y
        hint: "This is challenging! Break it down into smaller repeating sections to reach x: 9, y: 6." // Original hint
    },
    {
        title: "Level 11: River Crossing",
        description: "Use conditionals to safely navigate around water obstacles.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 7, y: 5 }, // Reverted to original target
        maxCommands: 8,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath'],
        obstacles: [
            {x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4},
            {x: 6, y: 0}, {x: 6, y: 1}, {x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4},
        ], // Kept inverted y
        collectibles: [{x: 5, y: 2}], // Kept inverted y
        bridges: [{x: 3, y: 5}, {x: 6, y: 5}], // Kept inverted y
        hint: "Use 'If Path, Move Forward' to check if it's safe before moving towards x: 7, y: 5!" // Original hint
    },
    {
        title: "Level 12: Crocodile Crossing",
        description: "Navigate carefully using conditionals to avoid the crocodiles.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 8, y: 5 }, // Reverted to original target
        maxCommands: 10,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath'],
        obstacles: [
            {x: 2, y: 1}, {x: 4, y: 1}, {x: 6, y: 1},
            {x: 3, y: 3}, {x: 5, y: 3}, {x: 7, y: 3},
        ], // Kept inverted y
        collectibles: [{x: 4, y: 2}], // Kept inverted y
        bridges: [{x: 4, y: 2}, {x: 7, y: 4}], // Kept inverted y
        hint: "Use conditionals to check if a path is clear before moving forward to x: 8, y: 5." // Original hint
    },
    {
        title: "Level 13: Safe Navigation",
        description: "Use conditionals to find the safe path through dangers.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 9, y: 6 }, // Reverted to original target
        maxCommands: 12,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 4, y: 0}, {x: 6, y: 0}, {x: 8, y: 0},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 6, y: 2}, {x: 8, y: 2},
            {x: 2, y: 4}, {x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4},
            {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6}, {x: 8, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 5, y: 3}, {x: 7, y: 5}], // Kept inverted y
        bridges: [],
        hint: "Combine conditionals with loops to efficiently navigate the path to x: 9, y: 6." // Original hint
    },
    {
        title: "Level 14: Intelligent Routing",
        description: "Create an intelligent algorithm that can detect and navigate the best path.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 8, y: 6 }, // Reverted to original target
        maxCommands: 14,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 5, y: 0}, {x: 7, y: 0},
            {x: 2, y: 1}, {x: 5, y: 1}, {x: 7, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 5, y: 2}, {x: 7, y: 2},
            {x: 3, y: 3}, {x: 7, y: 3},
            {x: 1, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 5, y: 4}, {x: 7, y: 4},
            {x: 1, y: 5}, {x: 7, y: 5},
            {x: 1, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 6, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 4, y: 1}, {x: 6, y: 3}, {x: 2, y: 6}], // Kept inverted y
        bridges: [],
        hint: "Use conditionals to detect obstacles and dynamically choose your path to x: 8, y: 6." // Original hint
    },
    {
        title: "Level 15: Conditional Master",
        description: "Master the use of conditionals in this challenging level.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 9, y: 6 }, // Reverted to original target
        maxCommands: 16,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 7, y: 0}, {x: 9, y: 0},
            {x: 2, y: 1}, {x: 7, y: 1}, {x: 9, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 5, y: 2}, {x: 7, y: 2}, {x: 9, y: 2},
            {x: 5, y: 3}, {x: 9, y: 3},
            {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 5, y: 4}, {x: 6, y: 4}, {x: 7, y: 4}, {x: 9, y: 4},
            {x: 1, y: 5}, {x: 7, y: 5}, {x: 9, y: 5},
            {x: 1, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6}, {x: 7, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 8, y: 6}, {x: 4, y: 2}, {x: 2, y: 3}, {x: 8, y: 5}, {x: 2, y: 6}], // Kept inverted y
        bridges: [{x: 4, y: 3}, {x: 8, y: 3}], // Kept inverted y
        hint: "Combine everything you've learned about conditionals and loops for maximum efficiency to reach x: 9, y: 6." // Original hint
    },
    {
        title: "Level 16: Bridge Builder",
        description: "Use variables to set the length of bridges you need to cross.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 8, y: 4 }, // Reverted to original target
        maxCommands: 10,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 3, y: 0}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}, {x: 3, y: 5}, {x: 3, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 5, y: 3}, {x: 7, y: 3}], // Kept inverted y
        bridges: [],
        hint: "Use the X and Y variables to set where you want to build your bridge to cross to x: 8, y: 4!" // Original hint
    },
    {
        title: "Level 17: Variable Paths",
        description: "Use variables to dynamically adjust your path based on obstacles.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 7, y: 5 }, // Reverted to original target
        maxCommands: 12,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 1}, {x: 4, y: 2}, {x: 5, y: 3}, {x: 6, y: 4},
        ], // Kept inverted y
        collectibles: [{x: 4, y: 5}], // Kept inverted y
        bridges: [],
        hint: "Use X and Y variables to plan your path around the diagonal obstacles to reach x: 7, y: 5." // Original hint
    },
    {
        title: "Level 18: Dynamic Targeting",
        description: "Create code that can adapt to different target locations using variables.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 6, y: 5 }, // Reverted to original target
        maxCommands: 14,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 1}, {x: 4, y: 1}, {x: 6, y: 1},
            {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 3},
            {x: 2, y: 5}, {x: 4, y: 5},
        ], // Kept inverted y
        collectibles: [{x: 3, y: 2}, {x: 5, y: 4}], // Kept inverted y
        bridges: [],
        hint: "Your code should work even if the target changes position! Try to reach x: 6, y: 5." // Original hint
    },
    {
        title: "Level 19: Calculated Jumps",
        description: "Use variables to calculate the exact path you need to take.",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 8, y: 6 }, // Reverted to original target
        maxCommands: 16,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 5, y: 0}, {x: 7, y: 0},
            {x: 3, y: 1}, {x: 6, y: 1},
            {x: 2, y: 2}, {x: 4, y: 2}, {x: 7, y: 2},
            {x: 3, y: 3}, {x: 5, y: 3}, {x: 8, y: 3},
            {x: 4, y: 4}, {x: 6, y: 4},
            {x: 2, y: 5}, {x: 5, y: 5}, {x: 7, y: 5},
            {x: 3, y: 6}, {x: 6, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 1, y: 3}, {x: 7, y: 4}], // Kept inverted y
        bridges: [{x: 1, y: 1}, {x: 4, y: 6}], // Kept inverted y
        hint: "Calculate the most efficient path by using variables to keep track of your position to get to x: 8, y: 6." // Original hint
    },
    {
        title: "Level 20: Variable Master",
        description: "Master the use of variables in this final challenge!",
        start: { x: 0, y: 0 }, // Kept change to bottom-left
        target: { x: 9, y: 6 }, // Reverted to original target
        maxCommands: 20,
        commands: ['moveForward', 'turnLeft', 'turnRight', 'ifPath', 'repeat'],
        obstacles: [
            {x: 2, y: 0}, {x: 3, y: 0}, {x: 5, y: 0}, {x: 8, y: 0},
            {x: 2, y: 1}, {x: 5, y: 1}, {x: 8, y: 1},
            {x: 2, y: 2}, {x: 3, y: 2}, {x: 5, y: 2}, {x: 6, y: 2}, {x: 8, y: 2},
            {x: 6, y: 3}, {x: 8, y: 3},
            {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}, {x: 6, y: 4}, {x: 8, y: 4},
            {x: 1, y: 5}, {x: 4, y: 5}, {x: 6, y: 5}, {x: 8, y: 5},
            {x: 1, y: 6}, {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6}, {x: 7, y: 6},
        ], // Kept inverted y
        collectibles: [{x: 7, y: 0}, {x: 4, y: 1}, {x: 7, y: 2}, {x: 3, y: 3}, {x: 5, y: 5}, {x: 3, y: 6}], // Kept inverted y
        bridges: [{x: 4, y: 0}, {x: 1, y: 3}, {x: 5, y: 4}, {x: 8, y: 6}], // Kept inverted y
        hint: "This is the ultimate challenge! Use everything you've learned about variables, loops, and conditionals to reach x: 9, y: 6." // Original hint
    }
];

// Initialize drag functionality for toolbox commands
function initToolboxDrag() {
    const commands = document.querySelectorAll('.command');

    commands.forEach(cmd => {
        if (availableCommands.includes(cmd.dataset.command)) {
            cmd.classList.remove('disabled');
            cmd.setAttribute('draggable', 'true');

            cmd.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', cmd.dataset.command);
            });
        } else {
            cmd.classList.add('disabled');
            cmd.setAttribute('draggable', 'false');
        }
    });
}

// Function to handle the drop event on the command list
function handleCommandListDrop(e) {
    e.preventDefault();
    const command = e.dataTransfer.getData('text/plain');

    if (availableCommands.includes(command) && commandList.children.length < maxCommandsAllowed) {
        const li = document.createElement('li');
        li.textContent = commandToText(command);
        li.dataset.command = command;
        commandList.appendChild(li);

        // Add remove functionality to list items
        li.addEventListener('click', () => {
            li.remove();
        });
    } else if (commandList.children.length >= maxCommandsAllowed) {
        showMessage("Oops! You've tried to use too many instruction blocks for this level. Can you reach the red square with fewer?");
    }
}

function commandToText(command) {
    const commandLabels = {
        moveForward: 'Move Forward',
        turnLeft: 'Turn Left',
        turnRight: 'Turn Right',
        ifPath: 'If Path, Move Forward',
        repeat: 'Repeat 3 Times'
    };
    return commandLabels[command] || command;
}

// Game state management
let gameState = {
    currentLevel: 0,
    collectedItems: 0,
    attempts: 0,
    maxCommands: levels[0].maxCommands,
    variables: {
        bridgeLength: 3 // Default bridge length
    }
};

// Initialize the game
async function initGame() {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData && studentData.id) {
        try {
            const response = await fetch(`/api/progress/parrot/${studentData.id}`);
            if (response.ok) {
                const progress = await response.json();
                // Server returns 0-based level for completed levels
                gameState.currentLevel = progress?.level || 0;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
    
    loadLevel(gameState.currentLevel);
    loadLevel(gameState.currentLevel);
    initToolboxDrag(); // Initialize drag for toolbox
    updateUI();

    // Ensure parrot image is loaded before drawing for the first time
    parrotImg.onload = () => {
        drawJungle();
        showMessage("Welcome to the Jungle Coding Adventure! Help the parrot reach the red square!");
    };
    if (parrotImg.complete) { // If the image is already loaded (e.g., from cache)
        drawJungle();
        showMessage("Welcome to the Jungle Coding Adventure! Help the parrot reach the red square!");
    }

    // Add the drop listener to the command list only once
    commandList.addEventListener('dragover', e => e.preventDefault());
    commandList.addEventListener('drop', handleCommandListDrop);

    // Add event listener for the hint button
    if (hintButton) {
        hintButton.addEventListener('click', showLevelHint);
    }

    // Start the animation loop
    requestAnimationFrame(drawJungle);
}

// Load a specific level
function loadLevel(levelIndex) {
    if (levelIndex >= 0 && levelIndex < levels.length) {
        const level = levels[levelIndex];
        parrot = { x: level.start.x, y: level.start.y, direction: 0 };
        target = { x: level.target.x, y: level.target.y };
        obstacles = level.obstacles;
        collectibles = level.collectibles;
        bridges = level.bridges;
        availableCommands = level.commands;
        maxCommandsAllowed = level.maxCommands;

        // Update UI
        currentLevelDisplay.textContent = levelIndex + 1 + ' / ' + levels.length;
        targetXDisplay.textContent = target.x;
        targetYDisplay.textContent = target.y;
        message.textContent = `Attempts: ${gameState.attempts}`;
        levelDescription.textContent = level.description;
        hintDisplay.textContent = level.hint; // Display the hint
        console.log(`Level ${levelIndex + 1} Target:`, target.x, target.y);

        showMessage(`Let's start Level ${levelIndex + 1}: ${level.title}! ${level.description} Remember, guide the parrot to the red square.`);

        // Update toolbox drag functionality
        const toolbox = document.getElementById('toolbox');
        toolbox.innerHTML = '<h2>Code Toolbox</h2>';
        availableCommands.forEach(command => {
            const div = document.createElement('div');
            div.className = 'command';
            div.draggable = true;
            div.dataset.command = command;
            div.textContent = commandToText(command);
            toolbox.appendChild(div);
        });

        initToolboxDrag(); // Re-initialize drag for the toolbox commands
        resetCodeEditor();
        drawJungle();

    } else {
        showMessage("You're a coding champion! You've completed all the jungle levels! Well done!");
        document.getElementById('run-code').disabled = true;
        document.getElementById('reset-code').disabled = true;
        document.getElementById('resetLevelButton').disabled = true;
        document.getElementById('nextLevelButton').style.display = 'none';
        if (hintButton) hintButton.style.display = 'none';
    }
}

// Reset the code editor
function resetCodeEditor() {
    commandList.innerHTML = '';
    gameState.attempts = 0;
    updateUI();
    showMessage("Instructions reset! The parrot is ready for your new code.");
}

// Update UI elements
function updateUI() {
    // The level and target information is updated in loadLevel now
}

// Enhanced draw function with obstacles, collectibles, bridges, parrot direction
function drawJungle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    // Draw grid
    ctx.strokeStyle = '#004d40';
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }

    // Draw x-axis numbers
    ctx.fillStyle = '#004d40';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    for (let i = 0; i < 12; i++) {
        ctx.fillText(i, i * gridSize + gridSize / 2, canvas.height - 5);
    }

    // Draw y-axis numbers (adjusting for the game's coordinate system)
    ctx.textAlign = 'right';
    for (let i = 0; i < 8; i++) {
        ctx.fillText(i, 15, canvas.height - (i * gridSize + gridSize / 2) - 5); // Invert y for labels
    }

    // Draw obstacles (invert y)
    obstacles.forEach(obs => {
        if (obs.type !== 'tree' && obstacleImg.complete) { // Only draw non-tree obstacles here
            ctx.drawImage(obstacleImg, obs.x * gridSize, canvas.height - (obs.y + 1) * gridSize, gridSize, gridSize);
        }
    });

    // Draw collectibles (invert y)
    collectibles.forEach(col => {
        if (collectibleImg.complete) {
            ctx.drawImage(collectibleImg, col.x * gridSize, canvas.height - (col.y + 1) * gridSize, gridSize, gridSize);
        }
    });

    // Draw bridges (invert y)
    bridges.forEach(bridge => {
        if (bridgeImg.complete) {
            ctx.drawImage(bridgeImg, bridge.x * gridSize, canvas.height - (bridge.y + 1) * gridSize, gridSize, gridSize);
        }
    });

    // Draw target (invert y)
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(target.x * gridSize, canvas.height - (target.y + 1) * gridSize, gridSize, gridSize);

    // Draw parrot (invert y)
    if (parrotImg.complete) {
        ctx.drawImage(parrotImg, parrot.x * gridSize, canvas.height - (parrot.y + 1) * gridSize, gridSize, gridSize);
    }

    // Draw direction arrow
    ctx.strokeStyle = 'blue';
    ctx.fillStyle = 'blue';
    ctx.lineWidth = 3; // Thinner line
    const arrowLength = gridSize / 3; // Shorter arrow (16.66px for 50px grid)

    // Calculate positions
    const startX = parrot.x * gridSize + gridSize / 2;
    const startY = canvas.height - (parrot.y + 1) * gridSize + gridSize / 2;
    let endX = startX;
    let endY = startY;

    // Calculate line end point
    switch (parrot.direction) {
        case 0: // Up
            endY -= arrowLength;
            break;
        case 90: // Right
            endX += arrowLength;
            break;
        case 180: // Down
            endY += arrowLength;
            break;
        case 270: // Left
            endX -= arrowLength;
            break;
    }

// Draw arrowhead
const arrowHeadSize = 8;
ctx.beginPath();
ctx.moveTo(endX, endY);

switch (parrot.direction) {
    case 0: // Up
        ctx.lineTo(endX - arrowHeadSize / 2, endY - arrowHeadSize);
        ctx.lineTo(endX + arrowHeadSize / 2, endY - arrowHeadSize);
        break;
    case 90: // Right
        ctx.lineTo(endX + arrowHeadSize, endY - arrowHeadSize / 2);
        ctx.lineTo(endX + arrowHeadSize, endY + arrowHeadSize / 2);
        break;
    case 180: // Down
        ctx.lineTo(endX - arrowHeadSize / 2, endY + arrowHeadSize);
        ctx.lineTo(endX + arrowHeadSize / 2, endY + arrowHeadSize);
        break;
    case 270: // Left
        ctx.lineTo(endX - arrowHeadSize, endY - arrowHeadSize / 2);
        ctx.lineTo(endX - arrowHeadSize, endY + arrowHeadSize / 2);
        break;
}

ctx.closePath();
ctx.fill();

    // Reset styles (only reset lineWidth if needed elsewhere with the default)
    ctx.lineWidth = 1;

    animationFrame++;
    requestAnimationFrame(drawJungle);
}

// Enhanced command execution with curriculum features
function executeCommands() {
    if (isRunning) return;
    isRunning = true;
    gameState.attempts++;
    resetParrot();

    if (commandList.children.length === 0) {
        showMessage("Hmm... It looks like you haven't added any instructions for the parrot yet! Drag some commands from the toolbox into the 'Your Code' area.");
        isRunning = false;
        resetParrot();
        return;
    }

    const commands = Array.from(commandList.children);
    let commandPointer = 0;
    let repeatStack = [];

    function processCommand() {
        if (commandPointer >= commands.length) {
            isRunning = false;
            checkLevelCompletion().catch(console.error); 
            return;
        }

        const command = commands[commandPointer].dataset.command;

        // Handle curriculum-specific commands
        switch(command) {
            case 'repeat':
                repeatStack.push({
                    count: 3,
                    startIndex: commandPointer
                });
                commandPointer++;
                break;

            case 'ifPath':
                if (isPathClear()) {
                    moveForward();
                }
                commandPointer++;
                break;

            default:
                executeBasicCommand(command);
                commandPointer++;
        }

        // Check if parrot went off-screen
        if (parrot.x < 0 || parrot.x > 11 || parrot.y < 0 || parrot.y > 7) {
            showMessage("Uh oh! The parrot flew off the edge of the jungle! Let's try that again.");
            resetParrot();
            isRunning = false;
            return;
        }

        drawJungle();
        setTimeout(processCommand, 500);
    }

    processCommand();
}

// Execute basic movement commands
function executeBasicCommand(command) {
    switch (command) {
        case 'moveForward':
            moveForward();
            break;
        case 'turnLeft':
            turnLeft();
            break;
        case 'turnRight':
            turnRight();
            break;
    }
}

// Movement functions
function moveForward() {
    let nextX = parrot.x;
    let nextY = parrot.y;

    switch (parrot.direction) {
        case 0: // UP (now increases y)
            if (parrot.y < 7) nextY++;
            break;
        case 90: // RIGHT
            if (parrot.x < 11) nextX++;
            break;
        case 180: // DOWN (now decreases y)
            if (parrot.y > 0) nextY--;
            break;
        case 270: // LEFT
            if (parrot.x > 0) nextX--;
            break;
    }

    if (!isObstacleAt(nextX, nextY)) {
        parrot.x = nextX;
        parrot.y = nextY;

        // Collectibles check remains the same
        const collectedIndex = collectibles.findIndex(col => col.x === parrot.x && col.y === parrot.y);
        if (collectedIndex !== -1) {
            collectibles.splice(collectedIndex, 1);
            gameState.collectedItems++;
            showMessage("Yay! You collected a treasure! Keep going!");
        }
    } else {
        showMessage("Oops! The parrot can't go through that! Try turning or going a different way.");
    }
}

function turnLeft() {
    parrot.direction = (parrot.direction - 90 + 360) % 360;
}

function turnRight() {
    parrot.direction = (parrot.direction + 90) % 360;
}

// Check if path is clear (for conditionals)
function isPathClear() {
    let nextX = parrot.x;
    let nextY = parrot.y;

    switch(parrot.direction) {
        case 0: nextY--; break;
        case 90: nextX++; break;
        case 180: nextY++; break;
        case 270: nextX--; break;
    }

    return !isObstacleAt(nextX, nextY) &&
           nextX >= 0 && nextX < 12 &&
           nextY >= 0 && nextY < 8;
}

function isObstacleAt(x, y) {
    return obstacles.some(obs => {
        
        return obs.x === x && obs.y === y;

    });
}


async function checkLevelCompletion() {
    if (parrot.x === target.x && parrot.y === target.y) {
        const completedLevel = gameState.currentLevel + 1; // The level they just completed
        
        // Save progress first before changing state
        const studentData = JSON.parse(sessionStorage.getItem('studentData'));
        if (studentData?.id) {
            await saveProgress(studentData.id, completedLevel, true);
        }

        // Update game state after successful save
        if (completedLevel < levels.length) {
            gameState.currentLevel = completedLevel;
            setTimeout(() => loadLevel(gameState.currentLevel), 2000);
            showMessage(`Level ${completedLevel} completed! Loading next level...`);
        } else {
            showMessage("Congratulations! You've completed all levels!");
        }
    } else {
        showMessage("Hmm, the parrot hasn't reached the red square yet. Try again!");
    }
}


async function saveProgress(studentId, level, completed) {
    try {
        const response = await fetch('/api/game/record-completion-ks2', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                gameName: 'parrot-adventure',
                completed: completed,
                level: level
            }),
        });

        if (!response.ok) {
            console.error('Progress save failed:', await response.text());
        }
    } catch (error) {
        console.error('Error saving progress:', error);
    }
}

// You might also want to save progress when the user resets the level or quits the game.
document.getElementById('resetLevelButton').addEventListener('click', () => {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData && studentData.id) {
        saveProgress(studentData.id, gameState.currentLevel + 1, false, gameState.stepsTaken); // Save as incomplete on reset
    }
    loadLevel(gameState.currentLevel);
    showMessage(`Level ${gameState.currentLevel + 1} reset. The parrot is back at the start!`);
});

// Function to show the hint for the current level
function showLevelHint() {
    if (levels[gameState.currentLevel] && levels[gameState.currentLevel].hint) {
        showMessage(`Here's a helpful hint for Level ${gameState.currentLevel + 1}: ${levels[gameState.currentLevel].hint}`);
    } else {
        showMessage("Sorry, there's no hint available for this level right now.");
    }
}

// Start the game
initGame();

// Event listeners
document.getElementById('run-code').addEventListener('click', executeCommands);
document.getElementById('reset-code').addEventListener('click', resetCodeEditor);
document.getElementById('resetLevelButton').addEventListener('click', () => {
    loadLevel(gameState.currentLevel);
    showMessage(`Level ${gameState.currentLevel + 1} reset. The parrot is back at the start!`);
});
document.getElementById('nextLevelButton').addEventListener('click', () => {
    if (gameState.currentLevel < levels.length - 1) {
        gameState.currentLevel++;
        loadLevel(gameState.currentLevel);
    }
});

// Helper functions
function showMessage(text) {
    message.textContent = text;
    //setTimeout(() => message.textContent = '', 5000); // Increased message time
}

document.getElementById('menuButton').addEventListener('click', () => {
    window.location.href = '../KS2-SG.html';
});

// Add these functions
let unlockedLevels = 1;

async function showLevelSelect() {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (studentData && studentData.id) {
        try {
            const response = await fetch(`/api/progress/parrot/${studentData.id}`);
            if (response.ok) {
                const progress = await response.json();
                unlockedLevels = progress.level;
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    const levelGrid = document.getElementById('level-grid');
    levelGrid.innerHTML = '';
    
    for (let i = 1; i <= 20; i++) {
        const button = document.createElement('button');
        button.className = `level-button ${i <= unlockedLevels ? 'completed' : 'locked'}`;
        button.textContent = i;
        button.disabled = i > unlockedLevels;
        
        if (i <= unlockedLevels) {
            button.addEventListener('click', () => {
                gameState.currentLevel = i - 1;
                loadLevel(gameState.currentLevel);
                closeLevelSelect();
            });
        }
        
        levelGrid.appendChild(button);
    }
    
    document.getElementById('level-select-popup').style.display = 'flex';
}

function closeLevelSelect() {
    document.getElementById('level-select-popup').style.display = 'none';
}

// Add event listener for the level select button
document.getElementById('level-select-button').addEventListener('click', showLevelSelect);

function resetParrot() {
    const level = levels[gameState.currentLevel]; 
    parrot = { 
        x: level.start.x, 
        y: level.start.y, 
        direction: 0
    };
    console.log(`Level ${gameState.currentLevel + 1} Parrot Reset:`, parrot.x, parrot.y);
    drawJungle();
}