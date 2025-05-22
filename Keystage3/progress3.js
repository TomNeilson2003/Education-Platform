document.addEventListener('DOMContentLoaded', async () => {
    try {
      const studentData = JSON.parse(sessionStorage.getItem('studentData'));
      if (!studentData) {
        alert('Please login to view your progress');
        window.location.href = '/student.html';
        return;
      }
  
      // Fetch progress data for both KS3 games in parallel
      const [algoResponse, binaryResponse] = await Promise.all([
        fetch(`/api/progress/algo/${studentData.id}`),
        fetch(`/api/progress/binary/${studentData.id}`)
      ]);
  
      if (!algoResponse.ok || !binaryResponse.ok) {
        throw new Error('Failed to fetch progress data');
      }
  
      const [algoProgress, binaryProgress] = await Promise.all([
        algoResponse.json(),
        binaryResponse.json()
      ]);
  
      updateAlgoProgress(algoProgress);
      updateBinaryProgress(binaryProgress);
    } catch (error) {
      console.error('Progress Error:', error);
      alert('Failed to load progress data. Please try again later.');
    }
  });
  
  function updateAlgoProgress(progress) {
    // For Algorithm Adventure, show the number of levels completed (assume max is 5)
    const maxLevel = 5;
    const currentLevel = progress?.level || 0;
    const percentage = (currentLevel / maxLevel) * 100;
    
    document.getElementById('algo-progress').innerHTML = `
      <div class="progress-card featured">
        <div class="card-header">
          <h3>ALGORITHM ADVENTURE</h3>
        </div>
        <div class="progress-metrics">
          <div class="metric-row">
            <div class="metric">
              <span class="label">Levels Completed</span>
              <span class="value">${currentLevel}/${maxLevel}</span>
            </div>
            <div class="metric">
              <span class="label">Status</span>
              <span class="value">${progress && progress.completed ? 'Completed' : 'In Progress'}</span>
            </div>
          </div>
          <div class="full-metric">
            <span class="label">Last Played</span>
            <span class="value">${formatDate(progress?.lastPlayed)}</span>
          </div>
          <div class="full-metric">
            <span class="label">Total Score</span>
            <span class="value">${progress?.stepsTaken || 0}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
        <p class="progress-text">${progress && progress.completed ? 'Adventure Complete! 🎉' : `Progress: ${currentLevel}/${maxLevel}`}</p>
      </div>
    `;
  }
  
  function updateBinaryProgress(progress) {
    // For Binary Quest, display the number of times completed (attempts) and cumulative score (stepsTaken)
    const completions = progress?.attempts || 0;
    const totalScore = progress?.stepsTaken || 0;
    
    document.getElementById('binary-progress').innerHTML = `
      <div class="progress-card featured">
        <div class="card-header">
          <h3>BINARY QUEST</h3>
        </div>
        <div class="progress-metrics">
          <div class="metric-row">
            <div class="metric">
              <span class="label">Times Completed</span>
              <span class="value">${completions}</span>
            </div>
            <div class="metric">
              <span class="label">Total Score</span>
              <span class="value">${totalScore}</span>
            </div>
          </div>
          <div class="full-metric">
            <span class="label">Last Played</span>
            <span class="value">${formatDate(progress?.lastPlayed)}</span>
          </div>
        </div>
        <p class="progress-text">${completions > 0 ? 'Well done, digital hero!' : 'No progress yet. Get started!'}</p>
      </div>
    `;
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  