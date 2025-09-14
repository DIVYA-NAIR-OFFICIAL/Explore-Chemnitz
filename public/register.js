document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log({ username, email, password }); 

    try { // It's good practice to wrap await calls in a try...catch block
      // --- THIS IS THE FIX ---
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html'; // Redirect to login page
      } else {
        // Use the error message from the server (e.g., "User already exists")
        alert('Error: ' + data.message); 
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  });
});
