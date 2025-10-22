// script.js - submit via fetch
const form = document.getElementById('hsForm');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Submitting...';
  statusEl.style.color = '#333';

  const data = Object.fromEntries(new FormData(form).entries());

  try {
    const res = await fetch('/submit', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (json.ok) {
      statusEl.textContent = 'Form submitted — thank you!';
      statusEl.style.color = 'green';
      form.reset();
    } else {
      statusEl.textContent = `Error: ${json.error || 'Server error.'}`;
      statusEl.style.color = 'red';
    }
  } catch (err) {
    statusEl.textContent = 'Server error (fetch failed)';
    statusEl.style.color = 'red';
    console.error('Submit fetch error:', err);
  }
});
