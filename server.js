// server.js — Final ready backend
require('dotenv').config(); // npm package 'dotenv' required
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const basicAuth = require('basic-auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // serve index.html, style.css, script.js

// Serve index on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Data file
const DATA_FILE = path.join(__dirname, 'submissions.json');
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

// Admin credentials from .env
const ADMIN_USER = process.env.ADMIN_USER || 'HSeeb';
const ADMIN_PASS = process.env.ADMIN_PASS || 'H$eebalikhansania03166036089';

// Create transporter using Gmail (app password)
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
  user: "hsadvertiserofficial@gmail.com",
  pass: "your-app-password"
   },
  });
} else {
  console.warn('Email not configured — set EMAIL_USER and EMAIL_PASS in .env to enable email notifications.');
}

// API to receive form
app.post('/submit', async (req, res) => {
  try {
    const { name, email, contact, service, message } = req.body;

    if (!name || !email || !contact || !service) {
      return res.status(400).json({ ok: false, error: 'Missing required fields' });
    }

    const entry = {
      id: Date.now(),
      name,
      email,
      contact,
      service,
      message: message || '',
      createdAt: new Date().toISOString()
    };

    // Read, prepend, save
    const arr = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');
    arr.unshift(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');

    // Try send email if transporter available
    if (transporter) {
      const mailOptions = {
        from: `"${process.env.SITE_TITLE || 'Website'}" <${EMAIL_USER}>`,
        to: EMAIL_USER, // send to same account (you can change)
        subject: `New Submission — ${entry.service}`,
        text:
`New submission received:
Name: ${entry.name}
Email: ${entry.email}
Contact: ${entry.contact}
Service: ${entry.service}
Message: ${entry.message}
Time: ${entry.createdAt}`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent for submission id:', entry.id);
      } catch (mailErr) {
        console.warn('Email failed:', mailErr && mailErr.message ? mailErr.message : mailErr);
      }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Admin page (basic-auth via browser prompt)
function requireAdmin(req, res, next) {
  const user = basicAuth(req);
  if (!user || user.name !== ADMIN_USER || user.pass !== ADMIN_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Access denied');
  }
  return next();
}

app.get('/admin', requireAdmin, (req, res) => {
  const arr = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '[]');

  // simple HTML table
  let html = `
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Submissions — ${process.env.SITE_TITLE || 'Admin'}</title>
        <style>
          body{font-family:Segoe UI,Arial; padding:20px; background:#f4f6fb}
          table{border-collapse:collapse;width:100%;background:#fff;border-radius:8px;overflow:hidden}
          th,td{padding:10px;border-bottom:1px solid #eee;text-align:left}
          th{background:#f1f5f9}
          .meta{margin-bottom:10px;color:#444}
          .small{font-size:13px;color:#666}
        </style>
      </head>
      <body>
        <h2>Submissions (${arr.length})</h2>
        <div class="meta small">Site: ${process.env.SITE_TITLE || ''} • Contact: ${process.env.CONTACT_NUMBER || ''}</div>
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Contact</th><th>Service</th><th>Message</th><th>Time</th></tr>
          </thead>
          <tbody>
  `;

  for (let i = 0; i < arr.length; i++) {
    const s = arr[i];
    html += `<tr>
      <td>${i+1}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.contact)}</td>
      <td>${escapeHtml(s.service)}</td>
      <td>${escapeHtml(s.message || '')}</td>
      <td>${escapeHtml(s.createdAt)}</td>
    </tr>`;
  }

  html += `</tbody></table></body></html>`;
  res.send(html);
});

// helper to avoid basic injection in admin display
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
