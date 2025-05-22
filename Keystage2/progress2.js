document.addEventListener('DOMContentLoaded', async () => {
    try {
        const studentData = JSON.parse(sessionStorage.getItem('studentData'));
        if (!studentData) {
            alert('Please login to view your progress');
            window.location.href = '/student.html';
            return;
        }

        // Fetch all progress data in parallel
        const [parrotResponse, passwordResponse, netnavResponse] = await Promise.all([
            fetch(`/api/progress/parrot/${studentData.id}`),
            fetch(`/api/progress/password/${studentData.id}`),
            fetch(`/api/progress/netnav/${studentData.id}`)
        ]);

        // Check responses
        if (!parrotResponse.ok || !passwordResponse.ok || !netnavResponse.ok) {
            throw new Error('Failed to fetch progress data');
        }

        // Parse JSON data
        const [parrotProgress, passwordProgress, netnavProgress] = await Promise.all([
            parrotResponse.json(),
            passwordResponse.json(),
            netnavResponse.json()
        ]);

        // Update progress displays
        updateParrotProgress(parrotProgress);
        updatePasswordProgress(passwordProgress);
        updateNetNavProgress(netnavProgress);

    } catch (error) {
        console.error('Progress Error:', error);
        alert('Failed to load progress data. Please try again later.');
    }
});

function updateParrotProgress(progress) {
    const maxLevel = 20;
    const currentLevel = progress?.level || 0;
    const percentage = (currentLevel / maxLevel) * 100;
    
    document.getElementById('parrot-progress').innerHTML = `
        <div class="progress-card featured">
            <div class="card-header">
                <h3>PARROT ADVENTURE</h3>
            </div>
            <div class="progress-metrics">
                <div class="metric-row">
                    <div class="metric">
                        <span class="label">Levels Completed</span>
                        <span class="value">${currentLevel}/${maxLevel}</span>
                    </div>
                    <div class="metric">
                        <span class="label">Status</span>
                        <span class="value">${progress.completed ? 'Completed' : 'In Progress'}</span>
                    </div>
                </div>
                <div class="full-metric">
                    <span class="label">Last Played</span>
                    <span class="value">${formatDate(progress.lastPlayed)}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
        </div>`;
}

function updatePasswordProgress(progress) {
    const maxLevel = 5;
    const currentLevel = progress?.level || 0;
    const percentage = (currentLevel / maxLevel) * 100;
    
    document.getElementById('password-progress').innerHTML = `
        <div class="progress-card featured">
            <div class="card-header">
                <h3>PASSWORD ADVENTURE</h3>
            </div>
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
                    <span class="value">${formatDate(progress.lastPlayed)}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <p class="progress-text">${progress.completed ? 'Adventure Complete! 🎉' : `Progress: ${currentLevel}/${maxLevel}`}</p>
        </div>`;
}

function updateNetNavProgress(progress) {
    const maxLevel = 12;
    const currentLevel = progress?.level || 0;
    const percentage = (currentLevel / maxLevel) * 100;
    
    document.getElementById('netnav-progress').innerHTML = `
        <div class="progress-card featured">
            <div class="card-header">
                <h3>NET NAVIGATOR JUNIOR</h3>
            </div>
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
                    <span class="value">${formatDate(progress.lastPlayed)}</span>
                </div>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
            <p class="progress-text">${progress.completed ? 'Network Master! 🚀' : `Level ${currentLevel}/${maxLevel}`}</p>
        </div>`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}