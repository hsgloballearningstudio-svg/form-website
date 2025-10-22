const adminCreds = { user: "admin", pass: "1234" };
const products = JSON.parse(localStorage.getItem("products") || "[]");
const orders = JSON.parse(localStorage.getItem("orders") || "[]");
document.getElementById("year").textContent = new Date().getFullYear();

function showSection(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "home") renderProducts();
}

function adminLogin() {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;
  if (u === adminCreds.user && p === adminCreds.pass) {
    showSection("adminPanel");
    document.getElementById("loginMsg").textContent = "";
    renderOrders();
  } else {
    document.getElementById("loginMsg").textContent = "Invalid login!";
  }
}

function logout() {
  showSection("home");
}

document.getElementById("hsForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  orders.push(data);
  localStorage.setItem("orders", JSON.stringify(orders));
  e.target.reset();
  document.getElementById("status").textContent = "Submitted!";
});

function addProduct() {
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const desc = document.getElementById("pDesc").value;
  const file = document.getElementById("pImage").files[0];
  if (!name || !price || !file) return alert("Please fill all fields");

  const reader = new FileReader();
  reader.onload = () => {
    products.push({ name, price, desc, img: reader.result });
    localStorage.setItem("products", JSON.stringify(products));
    alert("Product added!");
    renderProducts();
  };
  reader.readAsDataURL(file);
}

function renderProducts() {
  const list = document.getElementById("productList");
  list.innerHTML = products.map(p => `
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <b>Price: ${p.price}</b>
    </div>
  `).join("");
}

function renderOrders() {
  const ul = document.getElementById("ordersList");
  ul.innerHTML = orders.map(o => `<li>${o.name} - ${o.service} (${o.email})</li>`).join("");
}
