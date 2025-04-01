document.addEventListener('DOMContentLoaded', () => {
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const studentUsernameDisplay = document.getElementById('studentUsernameDisplay');
    const progressDetailsContainer = document.getElementById('progressDetailsContainer');

    // Get studentId from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get('studentId');

    if (!studentId) {
        alert('Student ID is missing.');
        return;
    }

    fetch(`/api/teacher/student-progress/${studentId}`)
        .then(response => response.json())
        .then(progressData => {
            if (progressData && progressData.length > 0) {
                const student = progressData[0].student; // Assuming student info is included in the first element
                studentNameDisplay.textContent = student ? student.studentName : 'N/A';
                studentUsernameDisplay.textContent = student ? student.username : 'N/A';

                const progressHTML = progressData.map(progress => `
                    <div class="game-progress-card">
                        <h3>${progress.gameName}</h3>
                        <p>Attempts: ${progress.attempts}</p>
                        <p>Completions: ${progress.completions}</p>
                        <p>Best Steps: ${progress.bestSteps || 'N/A'}</p>
                        <p>Last Played: ${progress.lastPlayed ? new Date(progress.lastPlayed).toLocaleDateString() : 'Never'}</p>
                        <!- - Add more details as needed - ->
                    </div>
                `).join('');
                progressDetailsContainer.innerHTML = progressHTML;


            } else {
                progressDetailsContainer.innerHTML = '<p>No game progress data found for this student.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching student progress details:', error);
            progressDetailsContainer.innerHTML = '<p>Failed to load progress data.</p>';
        });
});