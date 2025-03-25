// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
        showDashboard(JSON.parse(userData));
    }
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const userData = await response.json();
        localStorage.setItem('userData', JSON.stringify(userData));
        showDashboard(userData);
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('userData');
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('dashboardContainer').classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
});

// Show dashboard with user data
function showDashboard(userData) {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('dashboardContainer').classList.remove('hidden');
    
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userEmail').textContent = userData.email;
    document.getElementById('userCreatedAt').textContent = new Date(userData.createdAt).toLocaleDateString();
}