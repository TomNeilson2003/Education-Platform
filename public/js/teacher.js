document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('teacherLoginForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const credentials = {
            username: document.getElementById('username').value.trim(),
            password: document.getElementById('password').value
        };

        if (!credentials.username || !credentials.password) {
            alert('Please fill in both fields');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            
            if (response.ok) {
                sessionStorage.setItem('teacherData', JSON.stringify({
                    id: data.teacherId,
                    username: data.username,
                    name: data.name
                }));
                window.location.href = '/teacher-dashboard.html';
                
            } else {
                alert(data.error || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed - check your connection');
        }
    });
});