document.addEventListener('DOMContentLoaded', async () => {
  // Retrieve teacher data from sessionStorage.
  const teacherData = JSON.parse(sessionStorage.getItem('teacherData'));
  if (!teacherData) {
    window.location.href = '/teacher.html';
    return;
  }
  const teacherId = teacherData.id; // Ensure your login stores it as id.
  document.getElementById('teacherName').textContent = teacherData.name;

  // Load teacher's classes
  await loadTeacherClasses(teacherId);

  // Setup logout handler
  document.getElementById('logoutButton').addEventListener('click', () => {
    sessionStorage.removeItem('teacherData');
    window.location.href = '/teacher.html';
  });

  // Handle class creation
  document.getElementById('createClassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const className = document.getElementById('className').value;
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: teacherId,
          className: className
        })
      });
      if (response.ok) {
        const newClass = await response.json();
        document.getElementById('classCodeDisplay').innerHTML = `
          <p>New Class Code: <strong>${newClass.code}</strong></p>
        `;
        await loadTeacherClasses(teacherId);
      }
    } catch (error) {
      console.error('Error creating class:', error);
    }
  });

  // Modal close handlers
  document.getElementById('closeModalButton').addEventListener('click', () => {
    document.getElementById('studentListModal').style.display = 'none';
  });
  document.getElementById('closeProgressModal').addEventListener('click', () => {
    document.getElementById('progressModal').style.display = 'none';
  });
  document.getElementById('closeSetGamesModal').addEventListener('click', () => {
    document.getElementById('setGamesModal').style.display = 'none';
  });
  document.getElementById('closeGameSelectionModal').addEventListener('click', () => {
    document.getElementById('gameSelectionModal').style.display = 'none';
  });
});

async function loadTeacherClasses(teacherId) {
  try {
    const response = await fetch(`/api/classes/${teacherId}`);
    const classes = await response.json();
    const activeClassesDiv = document.getElementById('activeClasses');
    if (!classes || classes.length === 0) {
      activeClassesDiv.innerHTML = '<p>No classes found.</p>';
      return;
    }
    activeClassesDiv.innerHTML = classes.map(cls => `
      <div class="class-card" data-code="${cls.code}" data-name="${cls.name}">
        <h4>${cls.name}</h4>
        <p>Class Code: ${cls.code}</p>
        <div class="button-container">
          <button class="view-students-btn">View Students</button>
          <button class="set-games-btn">Set Games</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners for "View Students"
    document.querySelectorAll('.view-students-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const classCard = btn.closest('.class-card');
        if (!classCard) {
          console.error('Could not find the parent .class-card for "View Students" button.');
          return;
        }
        const classCode = classCard.getAttribute('data-code').trim();
        const className = classCard.getAttribute('data-name').trim();
        try {
          const response = await fetch(`/api/classes/${classCode}/students`);
          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error fetching students:', errorData.error);
            alert(errorData.error || 'Failed to fetch students.');
            return;
          }
          const data = await response.json();
          if (!data.students) {
            console.error('No students property in response:', data);
            alert('Unexpected response format.');
            return;
          }
          openStudentListModal(className, classCode, data.students);
        } catch (error) {
          console.error('Error fetching students:', error);
          alert('Error fetching students.');
        }
      });
    });

    // Attach event listeners for "Set Games"
    document.querySelectorAll('.set-games-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const classCard = btn.closest('.class-card');
        if (!classCard) {
          console.error('Could not find the parent .class-card for "Set Games" button.');
          return;
        }
        const classCode = classCard.getAttribute('data-code');
        const className = classCard.getAttribute('data-name');
        openSetGamesModal(className, classCode);
      });
    });
  } catch (error) {
    console.error('Error loading classes:', error);
    document.getElementById('activeClasses').innerHTML = '<p>Error loading classes.</p>';
  }
}

function openStudentListModal(className, classCode, students) {
  // Get the modal element
  const modal = document.getElementById('studentListModal');
  if (!modal) {
    console.error('Student List Modal element not found.');
    return;
  }
  
  // Set the modal's title and class code information
  const modalClassName = document.getElementById('modalClassName');
  const modalClassCode = document.getElementById('modalClassCode');
  
  if (modalClassName) {
    modalClassName.textContent = className;
  }
  if (modalClassCode) {
    modalClassCode.textContent = classCode;
  }
  
  // Populate the list of students with a "View Progress" button
  const studentNamesList = document.getElementById('studentNamesList');
  if (!studentNamesList) {
    console.error('Student Names List element not found.');
    return;
  }
  
  if (!students || students.length === 0) {
    studentNamesList.innerHTML = '<li>No students enrolled in this class.</li>';
  } else {
    studentNamesList.innerHTML = students.map(student => `
      <li data-student-id="${student.id}">
        ${student.firstName} ${student.lastName}
        <button class="view-progress-btn">View Progress</button>
      </li>
    `).join('');
    
    // Attach event listeners for each "View Progress" button
    document.querySelectorAll('#studentNamesList .view-progress-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        // Prevent event bubbling if needed
        e.stopPropagation();
        const li = btn.closest('li');
        if (!li) return;
        const studentId = li.getAttribute('data-student-id');
        try {
          const response = await fetch(`/api/teacher/student-progress/${studentId}`);
          if (response.ok) {
            const progressData = await response.json();
            showProgressModal(progressData);
          } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to fetch progress.');
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
          alert('Error fetching progress.');
        }
      });
    });
  }
  
  // Display the modal
  modal.style.display = 'block';
}



// Replace the entire showProgressModal function with this corrected version
function showProgressModal(progressData) {
  const modal = document.getElementById('progressModal');
  const ks2Games = ['parrot-adventure', 'password-adventure', 'netnav-junior'];
  
  const html = progressData.map(progress => {
    // Handle Algorithm Adventure (KS3)
    if (progress.gameName === 'algorithm-adventure') {
      return `
        <div class="progress-item">
          <h4>Algorithm Adventure</h4>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Levels Completed:</span>
              <span class="value">${progress.level}/5</span>
            </div>
            <div class="metric">
              <span class="label">Total Score:</span>
              <span class="value">${progress.stepsTaken}</span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${progress.attempts}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Handle Binary Quest (KS3)
    if (progress.gameName === 'binary-quest') {
      return `
        <div class="progress-item">
          <h4>Binary Quest</h4>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Cumulative Score:</span>
              <span class="value">${progress.stepsTaken}</span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${progress.attempts}</span>
            </div>
            <div class="metric">
              <span class="label">Last Played:</span>
              <span class="value">${new Date(progress.lastPlayed).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Handle KS2 Games
    if (ks2Games.includes(progress.gameName)) {
      const maxLevels = {
        'parrot-adventure': 20,
        'password-adventure': 5,
        'netnav-junior': 12
      };
      const percentage = ((progress.level || 0) / maxLevels[progress.gameName]) * 100;

      return `
        <div class="progress-item">
          <h4>${progress.gameName.replace(/-/g, ' ').toUpperCase()}</h4>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Current Level:</span>
              <span class="value">${progress.level || 0}/${maxLevels[progress.gameName]}</span>
            </div>
            <div class="metric">
              <span class="label">Status:</span>
              <span class="value">${progress.completed ? 'Completed' : 'In Progress'}</span>
            </div>
            <div class="metric">
              <span class="label">Progress:</span>
              <span class="value">${percentage.toFixed(1)}%</span>
            </div>
            <div class="metric">
              <span class="label">Last Played:</span>
              <span class="value">${new Date(progress.lastPlayed).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Handle KS1 Debugging Game
    if (progress.gameName === 'cosmo-debugging') {
      const levelsCompleted = progress.level ? progress.level - 1 : 0;
      return `
        <div class="progress-item">
          <h4>DEBUGGING GAME</h4>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Levels Completed:</span>
              <span class="value">${levelsCompleted}/10</span>
            </div>
            <div class="metric">
              <span class="label">Current Level:</span>
              <span class="value">${progress.level || 0} of 10</span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${progress.attempts || 0}</span>
            </div>
            <div class="metric">
              <span class="label">Last Played:</span>
              <span class="value">${new Date(progress.lastPlayed).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Default case for other games
    return `
      <div class="progress-item">
        <h4>${progress.gameName.replace('cosmo-', '').toUpperCase()}</h4>
        <div class="progress-metrics">
          <div class="metric">
            <span class="label">Attempts:</span>
            <span class="value">${progress.attempts || 0}</span>
          </div>
          <div class="metric">
            <span class="label">Completed:</span>
            <span class="value">${progress.completed ? 'Yes' : 'No'}</span>
          </div>
          <div class="metric">
            <span class="label">Best Steps:</span>
            <span class="value">${progress.bestSteps || 'N/A'}</span>
          </div>
          <div class="metric">
            <span class="label">Last Played:</span>
            <span class="value">${new Date(progress.lastPlayed).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  modal.querySelector('.progress-content').innerHTML = html;
  modal.style.display = 'block';
}


// -----------------------------
// Functions for "Set Games"
// -----------------------------
function openSetGamesModal(className, classCode) {
  fetch(`/api/classes/${classCode}/students`)
    .then(response => response.json())
    .then(data => {
      const { students } = data;
      const modal = document.getElementById('setGamesModal');
      modal.style.display = 'block';
      document.getElementById('setModalClassName').textContent = className;
      document.getElementById('setModalClassCode').textContent = classCode;
      populateStudentCheckboxList(students);
    })
    .catch(error => {
      console.error('Error fetching students for set games:', error);
    });
}

function populateStudentCheckboxList(students) {
  const list = document.getElementById('studentCheckboxList');
  if (!students || students.length === 0) {
    list.innerHTML = '<li>No students enrolled.</li>';
    return;
  }
  list.innerHTML = students.map(student => `
    <li data-student-id="${student.id}">
      <input type="checkbox" class="student-checkbox" value="${student.id}" />
      <label>${student.firstName} ${student.lastName}</label>
    </li>
  `).join('');

  const selectAllBtn = document.getElementById('selectAllBtn');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.student-checkbox');
      checkboxes.forEach(cb => cb.checked = true);
    });
  }

  const nextBtn = document.getElementById('setGameNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const selectedCheckboxes = document.querySelectorAll('.student-checkbox:checked');
      const selectedStudentIds = Array.from(selectedCheckboxes).map(cb => cb.value);
      if (selectedStudentIds.length === 0) {
        alert('Please select at least one student.');
        return;
      }
      document.getElementById('setGamesModal').style.display = 'none';
      openGameSelectionModal(selectedStudentIds);
    });
  }
}

function openGameSelectionModal(studentIds) {
  const modal = document.getElementById('gameSelectionModal');
  modal.style.display = 'block';
  const gameOptionsContainer = document.getElementById('gameOptions');

  // Remove previous listeners by cloning nodes.
  gameOptionsContainer.innerHTML = `
    <div class="game-option" data-game="cosmo-level1">Cosmo Algorithm Level 1 (KS1)</div>
    <div class="game-option" data-game="cosmo-level2">Cosmo Algorithm Level 2 (KS1)</div>
    <div class="game-option" data-game="cosmo-debugging">Debugging Game (KS1)</div>
    <div class="game-option" data-game="parrot-adventure">Parrot Adventure (KS2)</div>
    <div class="game-option" data-game="password-adventure">Password Adventure (KS2)</div>
    <div class="game-option" data-game="netnav-junior">Net Navigator (KS2)</div>
    <div class="game-option" data-game="algorithm-adventure">Algorithm Adventure (KS3)</div>
    <div class="game-option" data-game="binary-quest">Binary Quest (KS3)</div>

  `; 
  document.querySelectorAll('.game-option').forEach(option => {
    option.addEventListener('click', async () => {
      const gameName = option.getAttribute('data-game');
      // Provide immediate feedback
      gameOptionsContainer.querySelectorAll('.game-option').forEach(opt => {
        opt.style.pointerEvents = 'none'; // Disable other options
        if (opt !== option) {
          opt.style.opacity = '0.6';
        }
      });
      option.textContent = 'Assigning...';
      await assignGameToStudents(studentIds, gameName, option); // Pass the clicked option
    });
  });
}

async function assignGameToStudents(studentIds, gameName, clickedOption) {
  try {
    const teacherData = JSON.parse(sessionStorage.getItem('teacherData'));
    const response = await fetch('/api/teacher/assign-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: teacherData.id,
        studentIds: studentIds,
        gameName: gameName
      })
    });
    if (response.ok) {
      clickedOption.textContent = `Game "${gameName}" Assigned!`;
      setTimeout(() => { // Briefly show success message
        document.getElementById('gameSelectionModal').style.display = 'none';
      }, 1500);
    } else {
      const errorData = await response.json();
      clickedOption.textContent = 'Failed to Assign';
      clickedOption.style.backgroundColor = '#dc3545'; // Indicate error
      // Re-enable options after a delay
      setTimeout(() => {
        const gameOptionsContainer = document.getElementById('gameOptions');
        gameOptionsContainer.querySelectorAll('.game-option').forEach(opt => {
          opt.style.pointerEvents = 'auto';
          opt.style.opacity = '1';
          opt.textContent = opt.getAttribute('data-game') === gameName ? gameName : opt.getAttribute('data-game');
          opt.style.backgroundColor = '#8e44ad'; // Reset background
        });
        document.getElementById('gameSelectionModal').style.display = 'none';
      }, 2500);
      alert(errorData.error || 'Failed to assign game.');
    }
  } catch (error) {
    console.error('Error assigning game:', error);
    clickedOption.textContent = 'Error';
    clickedOption.style.backgroundColor = '#dc3545'; // Indicate error
    setTimeout(() => {
      const gameOptionsContainer = document.getElementById('gameOptions');
      gameOptionsContainer.querySelectorAll('.game-option').forEach(opt => {
        opt.style.pointerEvents = 'auto';
        opt.style.opacity = '1';
        opt.textContent = opt.getAttribute('data-game');
        opt.style.backgroundColor = '#8e44ad'; // Reset background
      });
      document.getElementById('gameSelectionModal').style.display = 'none';
    }, 2500);
    alert('Error assigning game.');
  }
}
