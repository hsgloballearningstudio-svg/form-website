// ===================== FOOTER YEAR =====================
document.getElementById("year").textContent = new Date().getFullYear();

// ===================== PAGE SWITCHING =====================
function showPage(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id === "home") renderProducts();
  if(id === "adminPanel") renderOrders();
}

// ===================== SERVICE FORM =====================
const form = document.getElementById("serviceForm");
form.addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(data);
  localStorage.setItem("orders", JSON.stringify(orders));
  form.reset();
  document.getElementById("status").textContent = "Request submitted successfully!";
  setTimeout(()=> document.getElementById("status").textContent = "", 3000);
});

// ===================== ADMIN LOGIN =====================
const ADMIN = { user: "admin", pass: "1234" };
function loginAdmin() {
  const u = document.getElementById("adminUser").value;
  const p = document.getElementById("adminPass").value;
  if(u === ADMIN.user && p === ADMIN.pass){
    showPage("adminPanel");
    document.getElementById("loginMsg").textContent = "";
  } else {
    document.getElementById("loginMsg").textContent = "Invalid username or password!";
  }
}
function logout() { showPage("home"); }

// ===================== PRODUCTS =====================
function renderProducts(){
  const list = document.getElementById("productList");
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  if(!products.length){ 
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

// ===================== ADD PRODUCT (ADMIN) =====================
function addProduct(){
  const name = document.getElementById("pName").value.trim();
  const price = document.getElementById("pPrice").value.trim();
  const desc = document.getElementById("pDesc").value.trim();
  const fileInput = document.getElementById("pImage");

  if(!name || !price){
    return alert("Product name and price are required!");
  }

  // Read file if selected
  if(fileInput.files && fileInput.files[0]){
    const reader = new FileReader();
    reader.onload = function(e){
      saveProduct({name, price, desc, img: e.target.result});
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    const url = prompt("Enter image URL for product:","https://via.placeholder.com/200");
    saveProduct({name, price, desc, img: url});
  }
}

function saveProduct(product){
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  products.push(product);
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added successfully!");
  document.getElementById("pName").value = "";
  document.getElementById("pPrice").value = "";
  document.getElementById("pDesc").value = "";
  document.getElementById("pImage").value = "";
  renderProducts();
}

// ===================== ADMIN ORDERS =====================
function renderOrders(){
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  if(!orders.length){ 
    list.innerHTML = "<li>No requests yet.</li>"; 
    return; 
  }
  list.innerHTML = orders.map(o => `
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Name:</strong> ${o.name}<br>
      <strong>Email:</strong> ${o.email}<br>
      <strong>Contact:</strong> ${o.contact}<br>
      <strong>Service:</strong> ${o.service}<br>
      <strong>Message:</strong> ${o.message || '—'}
    </li>
  `).join("");
}
