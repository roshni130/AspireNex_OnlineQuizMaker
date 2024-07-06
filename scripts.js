document.getElementById('registerForm').addEventListener('submit', registerUser);
document.getElementById('loginForm').addEventListener('submit', loginUser);

async function registerUser(event) {
  event.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  const result = await fetch('http://localhost:3000/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  }).then((res) => res.json());

  if (result.success) {
    alert('Registration successful');
  } else {
    alert('Registration failed: ' + result.message);
  }
}

async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const result = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
    }),
  }).then((res) => res.json());

  if (result.success) {
    alert('Login successful');
    localStorage.setItem('token', result.token);
    window.location.href = 'dashboard.html';
  } else {
    alert('Login failed: ' + result.message);
  }
}




