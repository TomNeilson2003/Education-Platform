document.addEventListener('DOMContentLoaded', async () => {
  try {
    const studentData = JSON.parse(sessionStorage.getItem('studentData'));
    if (!studentData) {
      alert('Please login to view your progress');
      window.location.href = '/student.html';
      return;
    }

    // Fetch all progress records for the student
    const response = await fetch(`/api/progress/${studentData.id}`);
    if (!response.ok) throw new Error('Failed to fetch progress data');
    
    const progressData = await response.json();

    // Filter progress for each game by exact gameName
    const level1Progress = progressData.filter(p => p.gameName === 'cosmo-level1');
    const level2Progress = progressData.filter(p => p.gameName === 'cosmo-level2');
    const debugProgress = progressData.filter(p => p.gameName === 'cosmo-debugging');

    // Get containers for each section (ensure these IDs exist in your HTML)
    const ks1Progress = document.getElementById('ks1-progress');
    const ks2Progress = document.getElementById('ks2-progress');
    const debugDisplay = document.getElementById('debug-progress');

    // --- Existing Game 1 Progress ---
    if (level1Progress.length === 0) {
      ks1Progress.innerHTML = '<p class="no-progress">No progress recorded yet for Level 1. Play some games!</p>';
    } else {
      ks1Progress.innerHTML = level1Progress.map(progress => `
        <div class="progress-card">
          <h3>${progress.gameName.replace('cosmo-', '').toUpperCase()}</h3>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Status:</span>
              <span class="status ${progress.completed ? 'completed' : 'incomplete'}">
                ${progress.completed ? '✅ Completed' : '🔄 In Progress'}
              </span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${progress.attempts}</span>
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
      `).join('');
    }

    // --- Existing Game 2 Progress ---
    if (level2Progress.length === 0) {
      ks2Progress.innerHTML = '<p class="no-progress">No progress recorded yet for Level 2. Play some games!</p>';
    } else {
      ks2Progress.innerHTML = level2Progress.map(progress => `
        <div class="progress-card">
          <h3>${progress.gameName.replace('cosmo-', '').toUpperCase()}</h3>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Status:</span>
              <span class="status ${progress.completed ? 'completed' : 'incomplete'}">
                ${progress.completed ? '✅ Completed' : '🔄 In Progress'}
              </span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${progress.attempts}</span>
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
      `).join('');
    }

    // --- New Debugging Game Progress Section ---
    if (debugProgress.length === 0) {
      debugDisplay.innerHTML = '<p class="no-progress">No progress recorded yet for Debugging Game. Play some games!</p>';
    } else {
      // Assuming only one record exists for the debugging game
      const debugRecord = debugProgress[0];
      const levelsCompleted = debugRecord.level - 1; // If level is saved as the next level to play
      debugDisplay.innerHTML = `
        <div class="progress-card">
          <h3>DEBUGGING GAME</h3>
          <div class="progress-metrics">
            <div class="metric">
              <span class="label">Levels Completed:</span>
              <span class="value">${levelsCompleted} / 10</span>
            </div>
            <div class="metric">
              <span class="label">Current Level:</span>
              <span class="value">${debugRecord.level} of 10</span>
            </div>
            <div class="metric">
              <span class="label">Attempts:</span>
              <span class="value">${debugRecord.attempts}</span>
            </div>
            <div class="metric">
              <span class="label">Last Played:</span>
              <span class="value">${new Date(debugRecord.lastPlayed).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Progress Error:', error);
    const container = document.querySelector('.games-container');
    container.innerHTML += `
      <div class="error-message">
        Error loading progress: ${error.message}
      </div>
    `;
  }
});
