document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Basic validation
            if (!email || !password || !role) {
                alert('Please fill in all fields');
                return;
            }
            
            // In a real app, you would send this to your backend
            console.log('Login attempt:', { email, password, role });
            
            // Redirect based on role (simulated)
            switch(role) {
                case 'victim':
                    window.location.href = '../victim/dashboard.html';
                    break;
                case 'counselor':
                    window.location.href = '../counselor/dashboard.html';
                    break;
                case 'admin':
                    window.location.href = '../admin/dashboard.html';
                    break;
            }
        });
    }
    
    // Similar logic for register.html
});