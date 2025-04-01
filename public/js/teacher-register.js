document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('teacherRegisterForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('registerTeacherName').value.trim(),
            username: document.getElementById('registerUsername').value.trim(),
            password: document.getElementById('registerPassword').value
        };

        if (!formData.name || !formData.username || !formData.password) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/teachers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Registration successful! Please login');
                window.location.href = 'teacher.html';
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed - check console for details');
        }
    });
});