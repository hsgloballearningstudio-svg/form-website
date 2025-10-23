document.getElementById("year").textContent = new Date().getFullYear();

// ===== PAGE SWITCHING =====
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="home") renderProducts();
  if(id==="adminPanel") renderOrders();
}

// ===== SERVICE FORM =====
const serviceForm = document.getElementById("serviceForm");
serviceForm.addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(serviceForm).entries());
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  orders.push(data);
  localStorage.setItem("orders", JSON.stringify(orders));
  serviceForm.reset();
  document.getElementById("status").textContent="Submitted! We’ll contact within 12 hrs.";
  setTimeout(()=> document.getElementById("status").textContent="",3000);
});

// ===== ADMIN LOGIN =====
const ADMIN = { user:"admin", pass:"1234" };
function loginAdmin(){
  const u=document.getElementById("adminUser").value;
  const p=document.getElementById("adminPass").value;
  if(u===ADMIN.user && p===ADMIN.pass){
    showPage("adminPanel");
    document.getElementById("loginMsg").textContent="";
    renderAdminProducts();
  } else {
    document.getElementById("loginMsg").textContent="Invalid username or password!";
  }
}
function logout(){ showPage("home"); }

// ===== PRODUCTS =====
function renderProducts(){
  const list=document.getElementById("productList");
  const products=JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){ list.innerHTML="<p>No products added yet.</p>"; return; }
  list.innerHTML=products.map((p,i)=>`
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
      <button class="buyBtn" onclick="openProductForm(${i})">Buy Now</button>
    </div>
  `).join("");
}

// ===== ADMIN ADD PRODUCT =====
function addProduct(){
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const desc = document.getElementById("pDesc").value;
  const file = document.getElementById("pImage").files[0];
  if(!name || !price || !file) return alert("Fill all product fields!");

  const reader = new FileReader();
  reader.onload = ()=>{
    const products = JSON.parse(localStorage.getItem("products")||"[]");
    products.push({ name, price, desc, img: reader.result });
    localStorage.setItem("products", JSON.stringify(products));
    alert("Product added successfully!");
    renderProducts();
    renderAdminProducts();
  };
  reader.readAsDataURL(file);
}

// ===== ADMIN PRODUCTS LIST WITH DELETE =====
function renderAdminProducts(){
  const list=document.getElementById("adminProductList");
  const products=JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){ list.innerHTML="<p>No products added yet.</p>"; return; }
  list.innerHTML=products.map((p,i)=>`
    <div class="admin-product">
      <strong>${p.name}</strong> — ${p.price}
      <button onclick="deleteProduct(${i})" style="margin-left:10px;background:red;color:white;padding:4px 8px;border:none;border-radius:5px;cursor:pointer;">Delete</button>
    </div>
  `).join("");
}

function deleteProduct(index){
  let products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(index,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
  renderAdminProducts();
}

// ===== PRODUCT BUY NOW FORM =====
function openProductForm(index){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  const p = products[index];
  // store selected product for form
  localStorage.setItem("selectedProduct", JSON.stringify(p));
  showPage("productFormPage"); // Make sure new product form section has id="productFormPage"
}

// ===== PRODUCT FORM SUBMIT =====
const productForm = document.getElementById("productForm");
if(productForm){
  productForm.addEventListener("submit", e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(productForm).entries());
    const selected = JSON.parse(localStorage.getItem("selectedProduct")||"{}");
    data.productName = selected.name;
    const orders = JSON.parse(localStorage.getItem("orders")||"[]");
    orders.push(data);
    localStorage.setItem("orders", JSON.stringify(orders));
    productForm.reset();
    document.getElementById("productStatus").textContent="Submitted! We’ll contact within 12 hrs.";
    setTimeout(()=> document.getElementById("productStatus").textContent="",3000);
  });
}

// ===== ADMIN ORDERS =====
function renderOrders(){
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  if(!orders.length){ list.innerHTML="<li>No requests yet.</li>"; return; }

  list.innerHTML = orders.map(o=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Name:</strong> ${o.name}<br>
      <strong>Email:</strong> ${o.email}<br>
      <strong>Contact:</strong> ${o.contact || o.whatsapp || '—'}<br>
      <strong>Service / Product:</strong> ${o.service || o.productName}<br>
      <strong>Message / Address:</strong> ${o.message || o.address || '—'}
    </li>
  `).join("");
}
