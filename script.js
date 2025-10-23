// ======== FOOTER YEAR ========
document.getElementById("year").textContent = new Date().getFullYear();

// ======== PAGE SWITCHING ========
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "home") renderProducts();
  if (id === "adminPanel") renderOrders();
}

// ======== SERVICE FORM ========
const form = document.getElementById("serviceForm");
form.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  data.time = new Date().toISOString(); // store time

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(data);
  localStorage.setItem("orders", JSON.stringify(orders));

  form.reset();
  document.getElementById("status").textContent = "Request submitted successfully!";
  setTimeout(() => document.getElementById("status").textContent = "", 3000);
});

// ======== ADMIN LOGIN ========
const ADMIN = { user: "admin", pass: "1234" };
function loginAdmin() {
  const u = document.getElementById("adminUser").value.trim();
  const p = document.getElementById("adminPass").value.trim();
  if (u === ADMIN.user && p === ADMIN.pass) {
    showPage("adminPanel");
    document.getElementById("loginMsg").textContent = "";
    renderOrders();
  } else {
    document.getElementById("loginMsg").textContent = "Invalid username or password!";
  }
}
function logout() { showPage("home"); }

// ======== PRODUCTS ========
function renderProducts() {
  const list = document.getElementById("productList");
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  if (!products.length) {
    list.innerHTML = "<p>No products added yet.</p>";
    return;
  }
  list.innerHTML = products.map(p => `
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
    </div>
  `).join("");
}

// ======== ADD PRODUCT ========
function addProduct() {
  const name = document.getElementById("pName").value.trim();
  const price = document.getElementById("pPrice").value.trim();
  const desc = document.getElementById("pDesc").value.trim();
  const file = document.getElementById("pImage").files[0];

  if (!name || !price || !file) return alert("Fill all product fields!");

  const reader = new FileReader();
  reader.onload = () => {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    products.push({ name, price, desc, img: reader.result });
    localStorage.setItem("products", JSON.stringify(products));
    alert("Product added successfully!");
    renderProducts();
  };
  reader.readAsDataURL(file);
}

// ======== ADMIN ORDERS (Service Requests) ========
function renderOrders() {
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  if (!orders.length) {
    list.innerHTML = "<li>No customer requests yet.</li>";
    return;
  }
  list.innerHTML = orders.map(o => `
    <li><strong>${o.name}</strong> (${o.email}) — ${o.service}</li>
  `).join("");
}

  list.innerHTML = orders.map(o => `
    <li style="margin-bottom:10px;">
      <strong>${o.name}</strong> (${o.email})<br>
      📞 <b>${o.contact || 'N/A'}</b><br>
      🧾 <b>Service:</b> ${o.service}<br>
      💬 <b>Message:</b> ${o.description || 'No details provided'}<br>
      ⏰ <small>${new Date(o.time).toLocaleString()}</small>
    </li>
  `).join("");
}

