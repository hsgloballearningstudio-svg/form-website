document.getElementById("year").textContent = new Date().getFullYear();

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="home") renderProducts();
  if(id==="adminPanel") renderOrders();
  if(id==="adminPanel") renderAdminProducts();
}

// ===== SERVICE FORM =====
const form = document.getElementById("serviceForm");
form.addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  orders.push(data);
  localStorage.setItem("orders", JSON.stringify(orders));
  form.reset();
  document.getElementById("status").textContent="Submitted successfully!";
  setTimeout(()=> document.getElementById("status").textContent="",3000);
});

// ===== PRODUCT ORDER FORM =====
const productOrderForm = document.getElementById("productOrderForm");
productOrderForm.addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(productOrderForm).entries());
  const custOrders = JSON.parse(localStorage.getItem("custOrders")||"[]");
  custOrders.push(data);
  localStorage.setItem("custOrders", JSON.stringify(custOrders));
  alert("Customer order submitted!");
  productOrderForm.reset();
  showPage("home");
});

// ===== ADMIN LOGIN =====
const ADMIN = { user:"admin", pass:"1234" };
function loginAdmin(){
  const u=document.getElementById("adminUser").value;
  const p=document.getElementById("adminPass").value;
  if(u===ADMIN.user && p===ADMIN.pass){
    showPage("adminPanel");
    document.getElementById("loginMsg").textContent="";
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
    <div class="product" onclick="openProductForm(${i})">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
    </div>
  `).join("");
}

function openProductForm(index){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  const prod = products[index];
  document.getElementById("prodTitleHeading").textContent = prod.name;
  document.getElementById("prodIdInput").value = index;
  showPage("productOrder");
}

// ===== ADD PRODUCT =====
function addProduct(){
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const desc = document.getElementById("pDesc").value;
  const img = document.getElementById("pImage").value;

  if(!name || !price || !img) return alert("Fill all product fields!");

  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.push({ name, price, desc, img });
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added successfully!");
  renderProducts();
  renderAdminProducts();
  document.getElementById("pName").value="";
  document.getElementById("pPrice").value="";
  document.getElementById("pDesc").value="";
  document.getElementById("pImage").value="";
}

// ===== ADMIN PRODUCTS LIST WITH DELETE =====
function renderAdminProducts(){
  const list = document.getElementById("adminProductList");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){ list.innerHTML="<li>No products yet.</li>"; return; }

  list.innerHTML = products.map((p,i)=>`
    <li>
      ${p.name} - ${p.price} 
      <button onclick="deleteProduct(${i})" style="margin-left:10px;">Delete</button>
    </li>
  `).join("");
}

function deleteProduct(index){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(index,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
  renderAdminProducts();
}

// ===== ADMIN ORDERS =====
function renderOrders(){
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  const custOrders = JSON.parse(localStorage.getItem("custOrders")||"[]");
  const allOrders = orders.concat(custOrders);

  if(!allOrders.length){ list.innerHTML="<li>No requests yet.</li>"; return; }

  list.innerHTML = allOrders.map(o=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Name:</strong> ${o.name || o.custName}<br>
      <strong>Email:</strong> ${o.email || o.custEmail}<br>
      <strong>Contact:</strong> ${o.contact || o.custPhone}<br>
      <strong>Service / Product:</strong> ${o.service || JSON.parse(localStorage.getItem("products"))[o.productId]?.name}<br>
      <strong>Address / Message:</strong> ${o.message || o.custAddress || '—'}
    </li>
  `).join("");
}
