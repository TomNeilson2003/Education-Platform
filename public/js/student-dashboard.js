document.addEventListener('DOMContentLoaded', () => {
  // Retrieve student data from sessionStorage.
  const studentData = JSON.parse(sessionStorage.getItem('studentData'));
  if (!studentData) {
    window.location.href = '/student.html';
    return;
  }
  
  // Update welcome header.
  const welcomeHeader = document.getElementById('welcomeHeader');
  welcomeHeader.textContent = `Welcome back, ${studentData.firstName} ${studentData.lastName}!`;
  
  // Setup logout handler.
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('studentData');
    window.location.href = '/student.html';
  });
  
  // Load progress, classes, and assigned games.
  loadStudentProgress(studentData.id);
  loadStudentClasses(studentData.id);
  loadAssignedGames(studentData.id);
  
  // "Go to the Games" button.
  const goToGamesButton = document.getElementById('goToGamesButton');
  goToGamesButton.addEventListener('click', () => {
    window.location.href = '/keystage-selection.html';
  });

  // (Optional: Code for assignGameButton if needed.)
  const assignGameButton = document.getElementById('assignGameButton'); // Replace with actual ID if used

  if (assignGameButton) {
    assignGameButton.addEventListener('click', async () => {
      const teacherId = getLoggedInTeacherId(); // Implement this function to get the teacher's ID
      const selectedStudentIds = getSelectedStudentIds(); // Implement this function to get the IDs of selected students
      const gameName = getSelectedGameName(); // Implement this function to get the name of the selected game

      if (!teacherId || !selectedStudentIds || selectedStudentIds.length === 0 || !gameName) {
        alert('Please select students and a game to assign.');
        return;
      }

      assignGameButton.disabled = true;
      assignGameButton.textContent = 'Assigning...';

      try {
        const response = await fetch('/api/teacher/assign-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teacherId: teacherId,
            studentIds: selectedStudentIds,
            gameName: gameName,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert(data.message || 'Game assigned successfully!');
        } else {
          alert(data.error || 'Failed to assign game.');
        }
      } catch (error) {
        console.error('Error assigning game:', error);
        alert('An error occurred while assigning the game.');
      } finally {
        assignGameButton.disabled = false;
        assignGameButton.textContent = 'Set Game'; // Or your original text
      }
    });
  }
  
  // Handle join class form.
  document.getElementById('joinClassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newClassCode = document.getElementById('newClassCode').value.trim().toUpperCase();
    if (!newClassCode) {
      alert("Please enter a class code.");
      return;
    }
    try {
      const response = await fetch(`/api/students/${studentData.id}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCode: newClassCode })
      });
      if (response.ok) {
        alert("Joined class successfully!");
        loadStudentClasses(studentData.id);
        document.getElementById('joinClassForm').reset();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to join class.");
      }
    } catch (error) {
      console.error("Error joining class:", error);
      alert("Error joining class.");
    }
  });  
});

async function loadStudentProgress(studentId) {
  try {
    const response = await fetch(`/api/progress/${studentId}`);
    const progressData = await response.json();
    const progressContainer = document.getElementById('progressContainer');
    
    if (!progressData || progressData.length === 0) {
      progressContainer.innerHTML = '<p>No progress recorded yet.</p>';
      return;
    }

    progressContainer.innerHTML = progressData.map(progress => {
      // Handle KS2 Games
      const ks2Games = ['parrot-adventure', 'password-adventure', 'netnav-junior'];
      if (ks2Games.includes(progress.gameName)) {
        const maxLevels = {
          'parrot-adventure': 20,
          'password-adventure': 5,
          'netnav-junior': 12
        };
        const currentLevel = progress.level || 0;
        const percentage = (currentLevel / maxLevels[progress.gameName]) * 100;
        
        return `
          <div class="progress-card">
            <h4>${progress.gameName.replace(/-/g, ' ').toUpperCase()}</h4>
            <div class="progress-metrics">
              <div class="metric-row">
                <div class="metric">
                  <span class="label">Current Level</span>
                  <span class="value">${currentLevel}</span>
                </div>
                <div class="metric">
                  <span class="label">Status</span>
                  <span class="value">${progress.completed ? 'Completed' : 'In Progress'}</span>
                </div>
              </div>
              <div class="full-metric">
                <span class="label">Last Played</span>
                <span class="value">${new Date(progress.lastPlayed).toLocaleDateString()}</span>
              </div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
      }
      // Handle KS1 Debugging Game
      else if (progress.gameName === 'cosmo-debugging') {
        const levelsCompleted = progress.level ? progress.level - 1 : 0;
        return `
          <div class="progress-card">
            <h4>DEBUGGING GAME</h4>
            <p>Status: ${progress.completed ? 'Completed' : 'In Progress'}</p>
            <p>Level: ${levelsCompleted}/10</p>
            <p>Attempts: ${progress.attempts || 0}</p>
            <p>Last Played: ${new Date(progress.lastPlayed).toLocaleDateString()}</p>
          </div>
        `;
      }

      else {
        return `
          <div class="progress-card">
            <h4>${progress.gameName.replace('cosmo-', '').toUpperCase()}</h4>
            <p>Status: ${progress.completed ? 'Completed' : 'In Progress'}</p>
            <p>Best Score: ${progress.bestSteps || 'N/A'}</p>
            <p>Last Played: ${new Date(progress.lastPlayed).toLocaleDateString()}</p>
          </div>
        `;
      }
    }).join('');
  } catch (error) {
    console.error('Error loading progress:', error);
    progressContainer.innerHTML = '<p>Error loading progress.</p>';
  }
}

async function loadStudentClasses(studentId) {
  try {
    const response = await fetch(`/api/students/${studentId}/classes`);
    const classes = await response.json();
    const classesContainer = document.getElementById('classesContainer');
  
    if (!classes || classes.length === 0) {
      classesContainer.innerHTML = '<p>You are not enrolled in any classes.</p>';
    } else {
      classesContainer.innerHTML = classes.map(cls => `
        <div class="class-card">
          <h4>${cls.name}</h4>
          <p>Teacher: ${cls.teacherName || 'N/A'}</p>
          <p>Class Code: ${cls.code}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading classes:', error);
    document.getElementById('classesContainer').innerHTML = '<p>Error loading classes.</p>';
  }
}

async function loadAssignedGames(studentId) {
  try {
    const response = await fetch(`/api/assigned-games/${studentId}`);
    const assignedGames = await response.json();
    const assignedGamesContainer = document.getElementById('assignedGamesContainer');
    
    if (!assignedGames || assignedGames.length === 0) {
      assignedGamesContainer.innerHTML = '<p>No assigned games at the moment.</p>';
    } else {
      assignedGamesContainer.innerHTML = assignedGames.map(game => `
        <div class="assigned-game-card">
          <h4>${game.gameName}</h4>
          <p>Assigned by: ${game.Teacher ? game.Teacher.name : 'N/A'}</p>
          <p>Assigned on: ${new Date(game.assignedAt).toLocaleDateString()}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading assigned games:', error);
    document.getElementById('assignedGamesContainer').innerHTML = '<p>Error loading assigned games.</p>';
  }
}

function getLoggedInTeacherId() {
  const teacherData = JSON.parse(sessionStorage.getItem('teacherData'));
  return teacherData ? teacherData.teacherId : null;
}

function getSelectedStudentIds() {
  const studentCheckboxes = document.querySelectorAll('input[name="student"]:checked');
  return Array.from(studentCheckboxes).map(checkbox => parseInt(checkbox.value));
}

function getSelectedGameName() {
  const gameSelect = document.getElementById('gameSelect'); 
  return gameSelect ? gameSelect.value : null;
}
