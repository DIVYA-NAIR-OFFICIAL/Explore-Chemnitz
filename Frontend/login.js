document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
      document.getElementById('loginMessage').textContent = 'Please enter both email and password.';
      return;
    }

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);

        // Store user info in one object for easy access in index.html
        const loggedInUser = {
          username: data.username,
          email: data.email
        };
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));

        window.location.href = 'index.html';
      } else {
        document.getElementById('loginMessage').textContent = data.msg || 'Login failed.';
      }
    } catch (err) {
      console.error('Login error:', err);
      document.getElementById('loginMessage').textContent = 'Server error.';
    }
  });
});
