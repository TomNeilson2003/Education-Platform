async function saveProgressPasswordGame(level) {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (!studentData) return;

    try {
        const response = await fetch('/api/game/record-password-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentData.id,
                gameName: 'password-adventure',
                level: level
            })
        });
        if (!response.ok) console.error("Password progress save failed");
    } catch (error) {
        console.error("Password progress save error:", error);
    }
}
  
  
  function showNext(elementId) {
    // Hide all game screens
    const screens = document.querySelectorAll('.game-screen');
    screens.forEach(screen => {
      screen.classList.add('hidden');
    });
  
    // Show the target screen
    const targetScreen = document.getElementById(elementId);
    targetScreen.classList.remove('hidden');
  
    // Optional: Force update progress bars for specific screens
    if (elementId === 'tips-screen') {
      const progressFill = targetScreen.querySelector('.progress-fill');
      const progressText = targetScreen.querySelector('.progress-text');
      if (progressFill && progressText) {
        progressFill.style.width = "80%";
        progressText.innerText = "Adventure Progress: 4/5";
      }
    } else if (elementId === 'challenge-screen') {
      const progressFill = targetScreen.querySelector('.progress-fill');
      const progressText = targetScreen.querySelector('.progress-text');
      if (progressFill && progressText) {
        progressFill.style.width = "90%";
        progressText.innerText = "Adventure Progress: Almost Complete!";
      }
    }

    // Update typeWriterEffect function to handle caret properly
function typeWriterEffect(element, text, speed = 50) {
    element.innerHTML = ""; // Clear current text
    let i = 0;
    
    // Create a temporary span for the typing effect
    const typingSpan = document.createElement('span');
    element.appendChild(typingSpan);
    
    // Create caret element
    const caretSpan = document.createElement('span');
    caretSpan.classList.add('caret');
    caretSpan.textContent = "|"; // Use a visible caret character
    element.appendChild(caretSpan);

    const interval = setInterval(() => {
        if (i < text.length) {
            typingSpan.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            caretSpan.remove(); // Remove caret when done
        }
    }, speed);
}
  
    // Restart typewriter effect for any .typing-text element
    const typingElement = targetScreen.querySelector('.typing-text');
    if (typingElement) {
      const fullText = typingElement.getAttribute('data-text') || typingElement.innerText;
      if (!typingElement.getAttribute('data-text')) {
        typingElement.setAttribute('data-text', fullText);
      }
      typingElement.innerHTML = "";
      typeWriterEffect(typingElement, fullText, 50);
    }
    
    // Smooth scroll to the target screen
    targetScreen.scrollIntoView({ behavior: 'smooth' });
  
    // Map screen IDs to levels (only for the adventure progression)
    const levelMapping = {
      'intro-screen': 1,
      'rules-screen': 2,
      'creator-screen': 3,
      'tips-screen': 4,
      'challenge-screen': 5,
      'completion-screen': 5  // Completion also corresponds to level 5 (completed)
    };
  
    // If this screen is part of the progression, save the progress
    if (levelMapping[elementId] !== undefined) {
      saveProgressPasswordGame(levelMapping[elementId]);
    }
  }
  
function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const lengthRule = document.getElementById('lengthRule');
    const uppercaseRule = document.getElementById('uppercaseRule');
    const lowercaseRule = document.getElementById('lowercaseRule');
    const numberRule = document.getElementById('numberRule');
    const specialRule = document.getElementById('specialRule');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    const continueButton = document.getElementById('continueButton');
    
    // Evaluate password rules
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    
    // Update the rule checklist
    lengthRule.innerHTML = `<span class="${length ? 'check-icon' : 'fail-icon'}">${length ? '✅' : '❌'}</span> At least 8 characters long`;
    uppercaseRule.innerHTML = `<span class="${uppercase ? 'check-icon' : 'fail-icon'}">${uppercase ? '✅' : '❌'}</span> Contains UPPERCASE letters`;
    lowercaseRule.innerHTML = `<span class="${lowercase ? 'check-icon' : 'fail-icon'}">${lowercase ? '✅' : '❌'}</span> Contains lowercase letters`;
    numberRule.innerHTML = `<span class="${number ? 'check-icon' : 'fail-icon'}">${number ? '✅' : '❌'}</span> Contains numbers`;
    specialRule.innerHTML = `<span class="${special ? 'check-icon' : 'fail-icon'}">${special ? '✅' : '❌'}</span> Contains special characters`;
    
    // Calculate the strength (0-5)
    const strength = [length, uppercase, lowercase, number, special].filter(Boolean).length;
    
    // Update strength meter display
    let color = '';
    let text = '';
    let width = `${strength * 20}%`;
    
    if (strength === 0) {
      color = '#eee';
      text = 'Not started';
    } else if (strength === 1) {
      color = '#ff4d4d';
      text = 'Very Weak';
    } else if (strength === 2) {
      color = '#ffa64d';
      text = 'Weak';
    } else if (strength === 3) {
      color = '#ffff4d';
      text = 'Medium';
    } else if (strength === 4) {
      color = '#4dff4d';
      text = 'Strong';
    } else {
      color = '#4d4dff';
      text = 'Very Strong!';
    }
    
    strengthMeter.style.width = width;
    strengthMeter.style.backgroundColor = color;
    strengthText.innerText = text;
    
    // Enable the continue button if the password is at least medium strength
    continueButton.disabled = strength < 3;
  }
  
  function checkChallenge() {
    const password = document.getElementById('challengeInput').value;
    const meter = document.getElementById('challengeMeter');
    const text = document.getElementById('challengeText');
    const finishButton = document.getElementById('finishButton');
    
    // Evaluate the challenge password rules
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const lowercase = /[a-z]/.test(password);
    const number = /[0-9]/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    
    // Calculate the strength (0-5)
    const strength = [length, uppercase, lowercase, number, special].filter(Boolean).length;
    
    // Update the challenge meter display
    let color = '';
    let strengthTextValue = '';
    let width = `${strength * 20}%`;
    
    if (strength === 0) {
      color = '#eee';
      strengthTextValue = 'Not started';
    } else if (strength === 1) {
      color = '#ff4d4d';
      strengthTextValue = 'Very Weak';
    } else if (strength === 2) {
      color = '#ffa64d';
      strengthTextValue = 'Weak';
    } else if (strength === 3) {
      color = '#ffff4d';
      strengthTextValue = 'Medium';
    } else if (strength === 4) {
      color = '#4dff4d';
      strengthTextValue = 'Strong';
    } else {
      color = '#4d4dff';
      strengthTextValue = 'Very Strong!';
    }
    
    meter.style.width = width;
    meter.style.backgroundColor = color;
    text.innerText = strengthTextValue;
    
    // Enable the finish button if the challenge password is at least strong
    finishButton.disabled = strength < 4;
  }
  
  function togglePassword() {
    const input = document.getElementById('passwordInput');
    input.type = input.type === 'password' ? 'text' : 'password';
  }
  
  function toggleChallengePassword() {
    const input = document.getElementById('challengeInput');
    input.type = input.type === 'password' ? 'text' : 'password';
  }
  
  function startOver() {
    // Reset all game state
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('welcome-screen').classList.remove('hidden');
    
    // Reset form fields and UI elements
    document.getElementById('passwordInput').value = '';
    document.getElementById('challengeInput').value = '';
    document.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = '0%';
    });
    
    // Reset all checkmarks
    document.querySelectorAll('.rules-checklist .rule').forEach(rule => {
        rule.innerHTML = `<span class="fail-icon">❌</span> ${rule.textContent.trim()}`;
    });
    
    // Reset buttons
    document.getElementById('continueButton').disabled = true;
    document.getElementById('finishButton').disabled = true;
    
    // Reset any animations
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach(el => {
        el.innerHTML = el.getAttribute('data-text') || '';
        typeWriterEffect(el, el.textContent);
    });
}
  
  