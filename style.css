:root {
  --accent: #007bff;
  --bg: #f5f7fb;
  --card: #fff;
  --text: #222;
  --muted: #666;
  --header-height: 60px;
}

/* Reset & basic */
* { box-sizing: border-box; margin:0; padding:0; }
body {
  font-family: "Segoe UI", Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* Topbar / Header */
.topbar {
  background: var(--card);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}
.topbar h1 {
  font-size: 1.4rem;
}
.top-right {
  position: relative;
}
#profileBtn {
  background: var(--accent);
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
}
#profileBtn:hover { opacity: 0.9; }

/* Dropdown Menu */
#dropdownMenu button {
  cursor: pointer;
}
#dropdownMenu button:hover {
  background: var(--bg);
}

/* Main content */
main {
  max-width: 1000px;
  margin: 20px auto;
  padding: 0 16px;
  min-height: 70vh;
}

/* Pages */
.page { display: none; }
.page.active { display: block; animation: fade .4s ease; }
@keyframes fade {
  from {opacity:0; transform: translateY(10px);}
  to {opacity:1; transform: translateY(0);}
}

/* Cards & Forms */
form, .card {
  background: var(--card);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}
label { font-weight: 600; display: block; margin-top: 10px; }
input, select, textarea {
  width: 100%;
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
}
button {
  background: var(--accent);
  border: none;
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  margin-top: 14px;
  cursor: pointer;
  font-weight: 600;
}
button:hover { opacity: .9; }
.logout { background: crimson; }

/* Products Grid */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(220px,1fr));
  gap: 15px;
  margin-top: 15px;
}
.product {
  background: var(--card);
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.2s;
}
.product:hover { transform: translateY(-3px); }
.product img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

/* Footer */
.footer-sections {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  text-align: left;
  margin-bottom: 15px;
}
.footer-sections div { margin: 10px; }
.footer-sections h4 { margin-bottom: 8px; }
.footer-sections a {
  margin-right: 6px;
  color: #fff;
  font-size: 20px;
}
.footer-sections a:hover { color: var(--accent); }
footer {
  text-align: center;
  padding: 25px;
  background: #222;
  color: #fff;
  margin-top: 30px;
}

/* Login Form */
.login-card {
  max-width: 400px;
  margin: 40px auto;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.loginInput {
  padding: 10px;
  margin: 5px 0;
  width: 250px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.loginBtn {
  padding: 10px 20px;
  background: #2d89ef;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.loginBtn:hover { background: #1b5fc4; }

/* Admin Panel */
.admin-section { margin-top: 12px; }
#adminProductList li {
  list-style: none;
  padding:10px;
  border-bottom:1px solid #eee;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
}
.muted { color: var(--muted); margin-top:8px; }

/* Responsive */
@media (max-width:600px){
  .products { grid-template-columns: repeat(auto-fill,minmax(160px,1fr)); }
  #dropdownMenu {
    right: 10px;
    min-width: 140px;
  }
}
