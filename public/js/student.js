document.addEventListener('DOMContentLoaded', () => {
    const showRegisterFormButton = document.getElementById('showRegisterFormButton');
    const showLoginFormButton = document.getElementById('showLoginFormButton');
    const registerFormDiv = document.getElementById('studentRegisterForm');
    const loginFormDiv = document.getElementById('studentLoginForm');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // Form toggle
    showRegisterFormButton.addEventListener('click', () => {
        registerFormDiv.style.display = 'block';
        loginFormDiv.style.display = 'none';
    });

    showLoginFormButton.addEventListener('click', () => {
        loginFormDiv.style.display = 'block';
        registerFormDiv.style.display = 'none';
    });

    // Registration handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const formData = {
                username: document.getElementById('registerUsername').value.trim(), // Get username
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                age: document.getElementById('age').value,
                classCode: document.getElementById('registerClassCode').value.trim().toUpperCase() // Get class code
            };

            const response = await fetch('/api/student-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = 'Registration failed';
                if (errorData && errorData.error) {
                    errorMessage = errorData.error; // Use server-provided error message if available
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            sessionStorage.setItem('studentData', JSON.stringify({
                id: data.studentId,
                username: data.studentUsername,
                firstName: data.firstName,
                lastName: data.lastName,
                classes: data.classes
            }));
            window.location.href = 'student-dashboard.html';

        } catch (error) {
            console.error('Registration Error:', error);
            alert(error.message); // Display error message to user
        }
    });

    // Login handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/student-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: document.getElementById('loginUsername').value.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                let errorMessage = 'Login failed';
                if (errorData && errorData.error) {
                    errorMessage = errorData.error; // Use server-provided error message
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            sessionStorage.setItem('studentData', JSON.stringify({
                id: data.studentId,
                username: data.studentUsername,
                firstName: data.firstName,
                lastName: data.lastName,
                classes: data.classes
            }));
            window.location.href = '/student-dashboard.html';

        } catch (error) {
            console.error('Login Error:', error);
            alert(error.message); // Display error message to user
        }
    });
});