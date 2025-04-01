async function saveNetNavProgress(level) {
    const studentDataStr = sessionStorage.getItem('studentData');
    if (!studentDataStr) {
        console.error("No studentData found in sessionStorage. Cannot save progress.");
        return;
    }
    const studentData = JSON.parse(studentDataStr);
    
    try {
        const response = await fetch('/api/game/record-netnav-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentData.id,
                level: level,
                completed: level === 12
            })
        });
        if (!response.ok) {
            console.error("Failed to save progress, status:", response.status);
        } else {
            console.log(`Progress saved successfully for level ${level}.`);
        }
    } catch (error) {
        console.error("Progress save error:", error);
    }
}

const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');
const devices = document.querySelectorAll('.device');
const networkArea = document.getElementById('network-area');
const message = document.getElementById('message');
const popupContainer = document.getElementById('popup-container');
const speechText = document.getElementById('speech-text');
const gridSize = 50;
const connections = [];
let placedDevices = [];
let isRouterPlaced = false;
let routerPosition = null;
let currentLevel = 1;
let score = 0;
let timer = null;
let timeLeft = 0;
let draggingDevice = null;
let helpMode = false;
let deviceImages = {};
const maxLevels = 12;

// Define device properties including input/output status for more advanced modeling
const deviceProperties = {
    'router': { color: '#e74c3c', isNetworkHub: true, bandwidthCapacity: 100, icon: '📡' },
    'computer': { color: '#3498db', requiresPower: true, hasStorage: true, isInputDevice: false, isOutputDevice: true, icon: '💻' },
    'tablet': { color: '#9b59b6', requiresPower: true, isWireless: true, icon: '📱' },
    'printer': { color: '#2ecc71', requiresPower: true, isOutputDevice: true, icon: '🖨️' },
    'smartTV': { color: '#f39c12', requiresPower: true, hasStorage: false, icon: '📺' },
    'switch': { color: '#1abc9c', isNetworkHub: true, bandwidthCapacity: 50, icon: '🔄' },
    'server': { color: '#34495e', requiresPower: true, hasStorage: true, processingPower: 'high', icon: '🖥️' },
    'wap': { color: '#16a085', isNetworkHub: true, isWireless: true, bandwidthCapacity: 30, icon: '📶' },
    'keyboard': { color: '#7f8c8d', requiresPower: false, isInputDevice: true, icon: '⌨️' },
    'mouse': { color: '#95a5a6', requiresPower: false, isInputDevice: true, icon: '🖱️' },
    'cloud': { color: '#3498db', isExternal: true, icon: '☁️' },
    'laptop': { color: '#2980b9', requiresPower: true, isWireless: true, icon: '💻' },
    'smartphone': { color: '#8e44ad', requiresPower: true, isWireless: true, icon: '📱' },
    'firewall': { color: '#c0392b', isSecurityDevice: true, icon: '🔒' }
};

// Advanced levels with more complexity
const levels = {
    1: {
        devices: ['router', 'computer'],
        description: "Connect a computer to the router to access the internet.",
        explanation: "The router is like a magic box that lets devices talk to the internet. Make sure every device can reach the router!",
        timeLimit: 60,
        checkComplete: () => isConnectedToRouter('computer'),
        hints: ["Drag the router to the canvas first", "Then drag the computer to the canvas"]
    },
    2: {
        devices: ['router', 'computer', 'tablet'],
        description: "Connect both the computer and tablet to the router.",
        explanation: "Multiple devices can connect to the same router to access the internet!",
        timeLimit: 60,
        checkComplete: () => isConnectedToRouter('computer') && isConnectedToRouter('tablet'),
        hints: ["Place the router first", "Both devices need direct connections to the router"]
    },
    3: {
        devices: ['router', 'computer', 'printer'],
        description: "Set up a computer and printer connected to the router.",
        explanation: "Printers can be shared on a network so multiple computers can print to them!",
        timeLimit: 70,
        checkComplete: () => isConnectedToRouter('computer') && isConnectedToRouter('printer'),
        hints: ["The printer needs to be connected to access network printing"]
    },
    4: {
        devices: ['router', 'switch', 'computer', 'printer'],
        description: "Connect devices through a switch to the router.",
        explanation: "Switches help manage multiple connections! Connect devices to the switch first.",
        timeLimit: 80,
        checkComplete: () => {
            const hasSwitch = placedDevices.some(d => d.device === 'switch');
            const switchConnected = hasSwitch && areDevicesConnected('router', 'switch');
            const computerConnected = hasSwitch && areDevicesConnected('computer', 'switch');
            const printerConnected = hasSwitch && areDevicesConnected('printer', 'switch');
            return switchConnected && computerConnected && printerConnected;
        },
        hints: ["The switch should connect to the router", "Connect both computer and printer to the switch"]
    },
    5: {
        devices: ['router', 'computer', 'firewall'],
        description: "Secure your network with a firewall between router and computer.",
        explanation: "Firewalls protect your network from harmful traffic!",
        timeLimit: 80,
        checkComplete: () => {
            const hasFirewall = placedDevices.some(d => d.device === 'firewall');
            const firewallConnectedToRouter = hasFirewall && areDevicesConnected('router', 'firewall');
            const computerConnectedToFirewall = hasFirewall && areDevicesConnected('computer', 'firewall');
            return hasFirewall && firewallConnectedToRouter && computerConnectedToFirewall;
        },
        hints: ["The firewall should be between the router and computer", "Connect router → firewall → computer"]
    },
    6: {
        devices: ['computer', 'keyboard', 'mouse', 'printer'],
        description: "Connect input & output devices to a computer.",
        explanation: "Keyboards and mice (input) send data to computers which send to printers (output)!",
        timeLimit: 90,
        checkComplete: () => {
            return areDevicesConnected('keyboard', 'computer') && 
                   areDevicesConnected('mouse', 'computer') && 
                   areDevicesConnected('computer', 'printer');
        },
        hints: ["Input devices like keyboard and mouse connect TO the computer", "Output devices like printer connect FROM the computer"]
    },
    7: {
        devices: ['server', 'router', 'computer', 'tablet'],
        description: "Create a network with a server for file sharing.",
        explanation: "Servers store files for everyone on the network!",
        timeLimit: 100,
        checkComplete: () => {
            const serverConnected = placedDevices.some(d => d.device === 'server') && areDevicesConnected('server', 'router');
            const clientsConnected = isConnectedToRouter('computer') && isConnectedToRouter('tablet');
            return serverConnected && clientsConnected;
        },
        hints: ["Connect the server to the router", "All client devices need router connections to access the server"]
    },
    8: {
        devices: ['router', 'wap', 'tablet', 'smartphone'],
        description: "Set up wireless connections through an access point.",
        explanation: "Wireless Access Points let devices connect without cables!",
        timeLimit: 100,
        checkComplete: () => {
            const wapConnected = placedDevices.some(d => d.device === 'wap') && areDevicesConnected('router', 'wap');
            const wirelessDevicesConnected = areDevicesConnected('wap', 'tablet') && areDevicesConnected('wap', 'smartphone');
            return wapConnected && wirelessDevicesConnected;
        },
        hints: ["Connect the WAP to the router first", "Wireless devices connect to the WAP, not directly to the router"]
    },
    9: {
        devices: ['router', 'switch', 'server', 'wap', 'computer', 'tablet', 'printer'],
        description: "Build a complete school network with wired and wireless sections.",
        explanation: "Schools use complex networks with both wired and wireless connections!",
        timeLimit: 120,
        checkComplete: () => {
            const coreConnected = areDevicesConnected('router', 'switch') && 
                                 areDevicesConnected('router', 'wap') && 
                                 areDevicesConnected('server', 'switch');
            const wiredClientConnected = areDevicesConnected('computer', 'switch') && 
                                        areDevicesConnected('printer', 'switch');
            const wirelessClientConnected = areDevicesConnected('tablet', 'wap');
            return coreConnected && wiredClientConnected && wirelessClientConnected;
        },
        hints: ["Create the core infrastructure first (router, switch, WAP)", "Connect the server to the switch", "Connect wired devices to the switch", "Connect wireless devices to the WAP"]
    },
    10: {
        devices: ['router', 'cloud', 'firewall', 'computer', 'server'],
        description: "Connect your secure network to the internet.",
        explanation: "The internet connects millions of networks worldwide, but security is important!",
        timeLimit: 120,
        checkComplete: () => {
            const internetConnected = placedDevices.some(d => d.device === 'cloud') && 
                                     areDevicesConnected('cloud', 'router');
            const securityInPlace = placedDevices.some(d => d.device === 'firewall') && 
                                   areDevicesConnected('router', 'firewall');
            const devicesProtected = areDevicesConnected('firewall', 'computer') && 
                                    areDevicesConnected('firewall', 'server');
            return internetConnected && securityInPlace && devicesProtected;
        },
        hints: ["Connect the cloud (internet) to the router", "The firewall should be between router and internal devices", "Both computer and server need firewall protection"]
    },
    11: {
        devices: ['router', 'switch', 'server', 'computer', 'laptop', 'tablet', 'smartphone', 'wap', 'printer', 'firewall', 'cloud'],
        description: "Design a complete home office network with proper security.",
        explanation: "Modern home offices need secure connections for both work and personal use!",
        timeLimit: 150,
        checkComplete: () => {
            // Check core infrastructure
            const coreSetup = areDevicesConnected('cloud', 'router') && 
                             areDevicesConnected('router', 'firewall') && 
                             areDevicesConnected('firewall', 'switch') && 
                             areDevicesConnected('firewall', 'wap');
            
            // Check server and wired clients
            const wiredSetup = areDevicesConnected('server', 'switch') && 
                              areDevicesConnected('computer', 'switch') && 
                              areDevicesConnected('printer', 'switch');
            
            // Check wireless clients
            const wirelessSetup = areDevicesConnected('laptop', 'wap') && 
                                 areDevicesConnected('tablet', 'wap') && 
                                 areDevicesConnected('smartphone', 'wap');
            
            return coreSetup && wiredSetup && wirelessSetup;
        },
        hints: ["Start with internet → router → firewall", "Connect switch and WAP to the firewall", "Connect wired devices to the switch", "Connect wireless devices to the WAP"]
    },
    12: {
        devices: ['router', 'switch', 'server', 'computer', 'laptop', 'tablet', 'smartphone', 'wap', 'printer', 'firewall', 'cloud'],
        description: "Optimize your network for bandwidth efficiency. Follow the instructions in the info box.",
        explanation: "An efficient network groups similar devices and minimizes bottlenecks!",
        timeLimit: 180,
        specialInstructions: "1. Group all high-bandwidth devices (servers, computers) on one switch\n2. Group low-bandwidth devices (printers) separately\n3. Keep wireless devices connected via WAP\n4. Ensure firewall is between internet and internal network",
        checkComplete: () => {
            // This level requires following the bandwidth optimization instructions
            const securitySetup = areDevicesConnected('cloud', 'router') && 
                                 areDevicesConnected('router', 'firewall');
            
            // Check proper device grouping (simplified for this example)
            const highBandwidthGroup = areDevicesConnected('firewall', 'switch') && 
                                      areDevicesConnected('server', 'switch') && 
                                      areDevicesConnected('computer', 'switch') && 
                                      areDevicesConnected('laptop', 'switch');
            
            const wirelessGroup = areDevicesConnected('firewall', 'wap') && 
                                 areDevicesConnected('tablet', 'wap') && 
                                 areDevicesConnected('smartphone', 'wap');
            
            // Printer can be connected to either switch or directly to firewall
            const printerSetup = areDevicesConnected('printer', 'firewall') || 
                                areDevicesConnected('printer', 'switch');
            
            return securitySetup && highBandwidthGroup && wirelessGroup && printerSetup;
        },
        hints: ["Follow the special instructions in the info box", "Think about which devices need the most bandwidth", "Wireless devices should always connect through the WAP"]
    }
};

// Add proper startOver function
function startOver() {
    currentLevel = 1;
    score = 0;
    resetGame();
    setupLevel(currentLevel);
    
    // Remove completion screen if visible
    document.getElementById('completion-screen').classList.add('hidden');
}

// Update showGameCompleted to use completion-screen div
function showGameCompleted() {
    document.getElementById('completion-screen').classList.remove('hidden');
}

// Preload device icons as images
// Preload device icons as images
// Preload device icons as images
function preloadDeviceIcons() {
    for (const device in deviceProperties) {
        deviceImages[device] = new Image();
        // In a real implementation, you would use actual image files.
        // For now, we'll create placeholder references that will use the emoji icons instead.
        deviceImages[device].src = `devices/${device}.png`;
        deviceImages[device].onerror = function() {
            // If image loading fails, we'll use the emoji fallback in drawDevice function.
        };
    }
}

// Function to draw a device on the canvas with improved graphics
function drawDevice(device, x, y) {
    // Draw device background
    ctx.fillStyle = deviceProperties[device].color;
    ctx.fillRect(x + 5, y + 5, gridSize - 10, gridSize - 10);
    
    // Add border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 5, y + 5, gridSize - 10, gridSize - 10);
    
    // Add device name text
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(device, x + gridSize/2, y + gridSize - 10);
    
    // Add device icon (emoji fallback if image fails)
    ctx.font = '20px Arial';
    ctx.fillText(deviceProperties[device].icon, x + gridSize/2, y + gridSize/2);
}

// Function to draw connections between devices
function drawConnection(fromX, fromY, toX, toY, type = 'wired') {
    ctx.beginPath();
    ctx.moveTo(fromX + gridSize/2, fromY + gridSize/2);
    
    if (type === 'wireless') {
        // Wireless connections as dashed lines
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = '#3498db';
    } else {
        // Wired connections as solid lines
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2c3e50';
    }
    
    ctx.lineTo(toX + gridSize/2, toY + gridSize/2);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Reset dash setting
    ctx.setLineDash([]);
}

// Draw grid with improved visuals
function drawGrid() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a subtle grid
    ctx.strokeStyle = '#e6e6e6';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.strokeRect(x, y, gridSize, gridSize);
        }
    }
    
    // Redraw all placed devices and connections
    redrawNetwork();
}

// Function to redraw all current devices and connections
function redrawNetwork() {
    // Draw all connections first (so they appear behind devices)
    for (let i = 0; i < connections.length; i++) {
        const connection = connections[i];
        drawConnection(
            connection.fromX, 
            connection.fromY, 
            connection.toX, 
            connection.toY,
            connection.type
        );
    }
    
    // Then draw all devices
    for (let i = 0; i < placedDevices.length; i++) {
        const device = placedDevices[i];
        drawDevice(device.device, device.x, device.y);
    }
}

// Update the level indicator in the header
function updateLevelIndicator() {
    let indicator = document.getElementById('level-indicator');
    if (!indicator) {
        indicator = document.createElement('p');
        indicator.id = 'level-indicator';
        // Append to header so it's always visible
        document.querySelector('header').appendChild(indicator);
    }
    indicator.textContent = `Current Level: ${currentLevel}`;
}

// Show learning objectives popup based on key network concepts
function showLearningObjectives() {
    const objectives = `
Learning Objectives:
• Digital devices take inputs, process them, and produce outputs.
• Devices like routers, switches, and wireless access points build computer networks.
• A network switch helps direct data between devices.
• Firewalls help protect networks from harmful data.
• The internet connects networks around the world.
`;
    showPopup(objectives);
}

// Setup a level with new UI improvements
function setupLevel(level) {
    const levelInfo = levels[level];
    
    // Reset game state
    resetGame();
    
    // Update UI for available devices
    document.querySelectorAll('.device').forEach(device => {
        device.style.display = levelInfo.devices.includes(device.dataset.device) ? 'block' : 'none';
    });
    
    // Update level message
    message.textContent = `Level ${level}: ${levelInfo.description}`;
    
    // Update level indicator
    updateLevelIndicator();
    
    // Show level explanation (this supports understanding network roles)
    showPopup(levelInfo.explanation);
    
    // Display special instructions if available
    if (levelInfo.specialInstructions) {
        showPopup("Special instructions:\n" + levelInfo.specialInstructions);
    }
    
    // Start timer if there's a time limit
    if (levelInfo.timeLimit) {
        startTimer(levelInfo.timeLimit);
    }
}

// Timer function for levels
function startTimer(seconds) {
    if (timer) {
        clearInterval(timer);
    }
    
    timeLeft = seconds;
    
    let timerElement = document.getElementById('level-timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'level-timer';
        document.getElementById('network-area').appendChild(timerElement);
    }
    
    timerElement.textContent = `Time: ${timeLeft}s`;
    
    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Time: ${timeLeft}s`;
        
        if (timeLeft < 10) {
            timerElement.style.color = 'red';
        } else if (timeLeft < 30) {
            timerElement.style.color = 'orange';
        } else {
            timerElement.style.color = '#333';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            showPopup("Time's up! Let's try again.");
            setTimeout(() => setupLevel(currentLevel), 2000);
        }
    }, 1000);
}

// Reset game function with animation
function resetGame() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    placedDevices = [];
    connections.length = 0;
    isRouterPlaced = false;
    routerPosition = null;
    
    let opacity = 1;
    const fadeOut = setInterval(() => {
        opacity -= 0.1;
        if (opacity <= 0) {
            clearInterval(fadeOut);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawGrid();
        } else {
            ctx.fillStyle = `rgba(245, 245, 245, ${opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, 30);
}

// Show game completion screen
function showGameCompleted() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3498db';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Congratulations!', canvas.width/2, canvas.height/2 - 40);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '18px Arial';
    ctx.fillText('You have completed all levels!', canvas.width/2, canvas.height/2);
    ctx.fillText(`Your final score: ${score}`, canvas.width/2, canvas.height/2 + 30);
    
    const restartButton = document.createElement('button');
    restartButton.id = 'restart-game';
    restartButton.textContent = 'Start Again';
    restartButton.addEventListener('click', () => {
        currentLevel = 1;
        score = 0;
        setupLevel(currentLevel);
    });
    
    const networkArea = document.getElementById('network-area');
    if (!document.getElementById('restart-game')) {
        networkArea.appendChild(restartButton);
    }
    
    showPopup("You're now a network expert! You've learned how different devices connect and work together in a network.");
}

// Advance to next level with transition animation
function nextLevel() {
    // Save progress before proceeding
    saveNetNavProgress(currentLevel);
    
    // Clear timer if exists
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    
    // Calculate score bonus
    const timeBonus = timeLeft > 0 ? timeLeft : 0;
    const levelBonus = currentLevel * 50;
    const levelScore = 100 + timeBonus + levelBonus;
    score += levelScore;
    
    // Display level completion popup
    showPopup(`Level completed! +${levelScore} points`);
    
    // Transition to next level with fade-out effect
    let opacity = 1;
    const fadeOut = setInterval(() => {
        opacity -= 0.1;
        if (opacity <= 0) {
            clearInterval(fadeOut);
            currentLevel++;
            if (currentLevel <= maxLevels) {
                setupLevel(currentLevel);
            } else {
                showGameCompleted();
            }
        } else {
            ctx.fillStyle = `rgba(245, 245, 245, ${opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, 30);
}

// Add a new device to the network with improved logic
function addDeviceToNetwork(device, x, y) {
    x = Math.floor(x / gridSize) * gridSize;
    y = Math.floor(y / gridSize) * gridSize;
    
    if (placedDevices.some(d => d.x === x && d.y === y)) {
        showPopup("This space is already occupied!");
        return;
    }
    
    if (currentLevel <= 5 && device !== 'router' && !isRouterPlaced && !['keyboard', 'mouse'].includes(device)) {
        showPopup('You must place the router first!');
        return;
    }
    
    placedDevices.push({ device, x, y });
    drawDevice(device, x, y);
    
    if (device === 'router') {
        isRouterPlaced = true;
        routerPosition = { x, y };
    }
    
    showDeviceInfo(device);
    checkNetwork();
}

// Show device information with detailed explanations
function showDeviceInfo(device) {
    const descriptions = {
        'router': "The router connects your network to the internet and directs traffic between devices.",
        'computer': "Computers process and store data, and connect to other devices on the network.",
        'tablet': "Tablets are portable computers that typically connect wirelessly to the network.",
        'printer': "Printers receive data from computers and output physical copies of documents.",
        'smartTV': "Smart TVs connect to the network to stream content from the internet or local devices.",
        'switch': "Switches connect multiple devices in a network and forward data packets to the right destination.",
        'server': "Servers store data and applications that multiple users can access over the network.",
        'wap': "Wireless Access Points allow devices to connect to the network without cables.",
        'keyboard': "Keyboards are input devices that send keypresses to a computer.",
        'mouse': "Mice are input devices that control the cursor on a computer screen.",
        'cloud': "The cloud represents internet services stored on remote servers.",
        'laptop': "Laptops are portable computers that can connect to networks wirelessly.",
        'smartphone': "Smartphones are mobile devices that connect wirelessly to networks.",
        'firewall': "Firewalls monitor and filter network traffic to protect against threats."
    };
    
    showPopup(`${device.charAt(0).toUpperCase() + device.slice(1)}: ${descriptions[device] || "A network device"}`);
}

// Connect two devices together
function connectDevices(fromDevice, toDevice) {
    const from = placedDevices.find(d => d.device === fromDevice);
    const to = placedDevices.find(d => d.device === toDevice);
    
    if (!from || !to) return false;
    
    const isWireless = deviceProperties[fromDevice].isWireless || deviceProperties[toDevice].isWireless;
    const connectionType = isWireless ? 'wireless' : 'wired';
    
    connections.push({
        fromDevice: fromDevice,
        toDevice: toDevice,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        type: connectionType
    });
    
    drawConnection(from.x, from.y, to.x, to.y, connectionType);
    return true;
}

// Check if two devices are connected (directly or indirectly)
function areDevicesConnected(device1, device2) {
    const directConnection = connections.some(
        conn => (conn.fromDevice === device1 && conn.toDevice === device2) || 
                (conn.fromDevice === device2 && conn.toDevice === device1)
    );
    
    if (directConnection) return true;
    
    const device1Instances = placedDevices.filter(d => d.device === device1);
    const device2Instances = placedDevices.filter(d => d.device === device2);
    
    for (const d1 of device1Instances) {
        for (const d2 of device2Instances) {
            const connected = connections.some(
                conn => (conn.fromX === d1.x && conn.fromY === d1.y && conn.toX === d2.x && conn.toY === d2.y) ||
                        (conn.fromX === d2.x && conn.fromY === d2.y && conn.toX === d1.x && conn.toY === d1.y)
            );
            if (connected) return true;
        }
    }
    
    return false;
}

// Check if a device is connected to a router (directly or through a switch or WAP)
function isConnectedToRouter(deviceType) {
    const deviceExists = placedDevices.some(d => d.device === deviceType);
    if (!deviceExists) return false;
    
    if (areDevicesConnected('router', deviceType)) return true;
    
    if (placedDevices.some(d => d.device === 'switch')) {
        return areDevicesConnected('router', 'switch') && areDevicesConnected('switch', deviceType);
    }
    
    if (deviceProperties[deviceType].isWireless && placedDevices.some(d => d.device === 'wap')) {
        return areDevicesConnected('router', 'wap') && areDevicesConnected('wap', deviceType);
    }
    
    return false;
}

// Show popup with information
function showPopup(message) {
    const infoBox = document.getElementById('info-box');
    const timestamp = new Date().toLocaleTimeString();
    infoBox.innerHTML += `<p><span class="timestamp">[${timestamp}]</span> ${message}</p>`;
    infoBox.scrollTop = infoBox.scrollHeight;
}

// Show hint for current level
function showHint() {
    const currentHints = levels[currentLevel].hints;
    if (currentHints && currentHints.length > 0) {
        const randomHint = currentHints[Math.floor(Math.random() * currentHints.length)];
        showPopup(`Hint: ${randomHint}`);
    } else {
        showPopup("No hints available for this level.");
    }
}

// Check if the network meets level requirements
function checkNetwork() {
    const currentLevelInfo = levels[currentLevel];
    if (currentLevelInfo.checkComplete()) {
        if (timer) {
            clearInterval(timer);
        }
        message.textContent = 'Network setup correctly! Great job!';
        showPopup('Level completed successfully! Moving to next level...');
        setTimeout(nextLevel, 2000);
    } else {
        message.textContent = 'Keep building your network!';
    }
}

// UI event handler to activate connection mode from a device element
function activateConnectionMode(deviceElement) {
    draggingDevice = deviceElement;
    document.querySelectorAll('.device').forEach(d => d.classList.remove('connecting'));
    deviceElement.classList.add('connecting');
    showPopup(`Select another device to connect to ${deviceElement.dataset.device}`);
}

// Setup manual connection mode with a button and canvas listener
function setupConnectionMode() {
    // Create and add connection button
    const connectionButton = document.createElement('button');
    connectionButton.id = 'connection-mode';
    connectionButton.textContent = 'Connect Devices';
    connectionButton.addEventListener('click', () => {
        showPopup("Click on a device on the canvas to start a connection");
        canvas.classList.add('connection-mode');
    });
    
    const networkArea = document.getElementById('network-area');
    networkArea.appendChild(connectionButton);
    
    // Listen for clicks on the canvas when in connection mode
    canvas.addEventListener('click', (e) => {
        if (!canvas.classList.contains('connection-mode')) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        const gridX = Math.floor(clickX / gridSize) * gridSize;
        const gridY = Math.floor(clickY / gridSize) * gridSize;
        
        const clickedDevice = placedDevices.find(d => d.x === gridX && d.y === gridY);
        if (draggingDevice && clickedDevice) {
            connectDevices(draggingDevice.dataset.device, clickedDevice.device);
            canvas.classList.remove('connection-mode');
            draggingDevice.classList.remove('connecting');
            draggingDevice = null;
            checkNetwork();
        } else if (!draggingDevice && clickedDevice) {
            const deviceElement = document.querySelector(`.device[data-device="${clickedDevice.device}"]`);
            if (deviceElement) {
                activateConnectionMode(deviceElement);
            }
        }
    });
}

// Set up drag-and-drop functionality for devices
devices.forEach(device => {
    device.addEventListener('dragstart', (e) => {
        draggingDevice = device;
        e.dataTransfer.setData('text/plain', device.dataset.device);
    });
});
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
});
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const deviceType = e.dataTransfer.getData('text/plain');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addDeviceToNetwork(deviceType, x, y);
});

// Add proper game reset handling
document.addEventListener('DOMContentLoaded', () => {
    // Initialize game state
    let gameInitialized = false;
    
    function initializeGame() {
        if (gameInitialized) return;
        gameInitialized = true;
        preloadDeviceIcons();
        drawGrid();
        setupLevel(currentLevel);
        setupConnectionMode();
        // Add learning objectives button
    }
    
    // Initialize on first load
    initializeGame();
    
    // Reset properly on startOver
    window.startOver = () => {
        gameInitialized = false;
        initializeGame();
    };
});
