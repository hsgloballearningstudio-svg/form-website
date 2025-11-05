// Step 2 — Connect Supabase to your website

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ⚠️ In dono jagah apni real values paste karo jo tumne Step 1 mein copy ki thi
const SUPABASE_URL = 'https://agqnakijoxjdcozoabox.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const form = document.getElementById('serviceForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const contact = document.getElementById('contact').value;
  const service = document.getElementById('service').value;
  const message = document.getElementById('message').value;

  const { data, error } = await supabase
    .from('service_forms')
    .insert([{ name, email, contact, service, message }]);

  if (error) {
    alert('Error saving data: ' + error.message);
  } else {
    alert('Form submitted successfully!');
    form.reset();
  }
});

// Helper to get formatted date-time
function nowString(){
  const d = new Date();
  return d.toLocaleString();
}

// ---- Page switching logic ----
function hideAllPages(){
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
    p.style.display = 'none';
  });
}
function showPage(pageId){
  hideAllPages();

  // show the selected page
  const el = document.getElementById(pageId);
  if(!el) return;
  el.classList.add("active");
  el.style.display = 'block';

  // admin area should be hidden except admin pages
  if(pageId === 'adminLogin' || pageId === 'adminPanel'){
    // keep admin visible
  } else {
    // ensure admin-specific sections hidden
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
  }

  // render dynamic content if needed
  if(pageId === 'productsPage') renderProductsBuy();
  if(pageId === 'adminPanel') {
    renderProductsAdmin();
    renderServiceSubmissions();
    renderOrders();
    showAdminTab('manageProducts');
  }
}

// ---- SERVICE FORM ----
const serviceForm = document.getElementById("serviceForm");
serviceForm.addEventListener("submit", e=>{
  e.preventDefault();
  const data = {
    name: document.getElementById("svc_name").value.trim(),
    email: document.getElementById("svc_email").value.trim(),
    contact: document.getElementById("svc_contact").value.trim(),
    service: document.getElementById("svc_service").value,
    message: document.getElementById("svc_message").value.trim(),
    date: nowString()
  };
  const arr = JSON.parse(localStorage.getItem("serviceSubmissions")||"[]");
  arr.push(data);
  localStorage.setItem("serviceSubmissions", JSON.stringify(arr));
  serviceForm.reset();
  document.getElementById("status").textContent = "Submitted! We'll contact within 12 hrs.";
  setTimeout(()=> document.getElementById("status").textContent="", 3000);
});

// ---- PRODUCT ORDER FORM ----
const orderForm = document.getElementById("productOrderForm");
function openOrderForm(name){
  showPage('productFormPage');
  document.getElementById("selectedProduct").value = name;
}
orderForm.addEventListener("submit", e=>{
  e.preventDefault();
  const data = {
    productName: document.getElementById("selectedProduct").value,
    name: document.getElementById("ord_name").value.trim(),
    email: document.getElementById("ord_email").value.trim(),
    contact: document.getElementById("ord_contact").value.trim(),
    address: document.getElementById("ord_address").value.trim(),
    date: nowString()
  };
  const arr = JSON.parse(localStorage.getItem("orders")||"[]");
  arr.push(data);
  localStorage.setItem("orders", JSON.stringify(arr));
  orderForm.reset();
  document.getElementById("productOrderStatus").textContent = "Order submitted! We'll contact within 12 hrs.";
  setTimeout(()=> document.getElementById("productOrderStatus").textContent="", 3000);
  showPage("productsPage");
});

// ---- PRODUCTS: render for buying ----
function renderProductsBuy(){
  const list = document.getElementById("productListBuy");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){
    list.innerHTML = "<p class='muted'>No products available right now.</p>";
    return;
  }
  list.innerHTML = products.map((p,i)=>`
    <div class="product">
      <img src="${p.img || ''}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p style="min-height:40px">${p.desc || ''}</p>
      <p class="muted">Location: ${p.location || '—'}</p>
      <strong>${p.price}</strong>
      <div style="margin-top:8px;">
        <button onclick="openOrderForm('${escapeHtml(p.name)}')">Buy Now</button>
      </div>
    </div>
  `).join("");
}

// small helper to avoid single-quote issues
function escapeHtml(s){ return String(s).replace(/'/g,"\\'").replace(/"/g,'\\"'); }

// ---- ADMIN LOGIN ----
function loginAdmin(){
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const msg = document.getElementById('loginMsg');

  if(user === 'admin' && pass === '1234'){
    localStorage.setItem("isLoggedIn","true");
    msg.style.color = 'green';
    msg.textContent = 'Login successful! Opening panel...';
    setTimeout(()=> {
      msg.textContent = '';
      document.getElementById('adminUser').value = '';
      document.getElementById('adminPass').value = '';
      showPage('adminPanel');
    }, 700);
  } else {
    msg.style.color = 'red';
    msg.textContent = 'Invalid username or password!';
  }
}

// auto-login check on load
window.addEventListener("load", ()=>{
  const logged = localStorage.getItem("isLoggedIn");
  if(logged === "true"){
    showPage("adminPanel");
  } else {
    showPage("home");
  }
});

// logout
function logout(){
  localStorage.removeItem("isLoggedIn");
  showPage('home');
}

// ---- ADMIN: manage products (add, edit, delete) ----
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", e=>{
  e.preventDefault();
  const name = document.getElementById("pName").value.trim();
  const price = document.getElementById("pPrice").value.trim();
  const desc = document.getElementById("pDesc").value.trim();
  const location = document.getElementById("pLocation").value.trim();
  const file = document.getElementById("pImage").files[0];

  if(!name || !price){
    return alert("Fill product name and price!");
  }

  if(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      saveNewProduct({name, price, desc, location, img: reader.result});
      addProductForm.reset();
    };
    reader.readAsDataURL(file);
  } else {
    // allow adding without image (will show blank)
    saveNewProduct({name, price, desc, location, img: ''});
    addProductForm.reset();
  }
});

function saveNewProduct(p){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  p.dateAdded = nowString();
  products.push(p);
  localStorage.setItem("products", JSON.stringify(products));
  alert("Product added successfully!");
  renderProductsAdmin();
  renderProductsBuy();
}

function renderProductsAdmin(){
  const container = document.getElementById("adminProductList");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){
    container.innerHTML = "<p class='muted'>No products yet.</p>";
    return;
  }
  container.innerHTML = "<ul style='padding:0; margin:0;'>" + products.map((p,i)=>`
    <li>
      <div style="display:flex; gap:10px; align-items:center;">
        <img src="${p.img || ''}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;">
        <div>
          <strong>${p.name}</strong><br>
          <span class="muted">${p.price} • ${p.location || '—'}</span><br>
          <small class="muted">Added: ${p.dateAdded || '—'}</small>
        </div>
      </div>
      <div>
        <button onclick="startEditProduct(${i})">Edit</button>
        <button onclick="deleteProduct(${i})" style="background:#e74c3c; margin-left:8px;">Delete</button>
      </div>
    </li>
  `).join("") + "</ul>";
}

// delete
function deleteProduct(index){
  if(!confirm("Delete this product?")) return;
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(index,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProductsAdmin();
  renderProductsBuy();
}

// start edit
function startEditProduct(index){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  const p = products[index];
  if(!p) return;
  document.getElementById("edit_index").value = index;
  document.getElementById("edit_pName").value = p.name;
  document.getElementById("edit_pPrice").value = p.price;
  document.getElementById("edit_pDesc").value = p.desc || '';
  document.getElementById("edit_pLocation").value = p.location || '';
  document.getElementById("editProductCard").style.display = 'block';
  window.scrollTo({top:0, behavior:'smooth'});
}

function cancelEdit(){
  document.getElementById("editProductCard").style.display = 'none';
  document.getElementById("edit_pImage").value = '';
}

// save edited
function saveEditedProduct(){
  const idx = parseInt(document.getElementById("edit_index").value,10);
  if(isNaN(idx)) return;
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products[idx]) return;

  const name = document.getElementById("edit_pName").value.trim();
  const price = document.getElementById("edit_pPrice").value.trim();
  const desc = document.getElementById("edit_pDesc").value.trim();
  const location = document.getElementById("edit_pLocation").value.trim();
  const file = document.getElementById("edit_pImage").files[0];

  if(file){
    const reader = new FileReader();
    reader.onload = ()=>{
      products[idx].img = reader.result;
      products[idx].name = name;
      products[idx].price = price;
      products[idx].desc = desc;
      products[idx].location = location;
      products[idx].dateEdited = nowString();
      localStorage.setItem("products", JSON.stringify(products));
      document.getElementById("editProductCard").style.display = 'none';
      document.getElementById("edit_pImage").value = '';
      renderProductsAdmin();
      renderProductsBuy();
    };
    reader.readAsDataURL(file);
  } else {
    products[idx].name = name;
    products[idx].price = price;
    products[idx].desc = desc;
    products[idx].location = location;
    products[idx].dateEdited = nowString();
    localStorage.setItem("products", JSON.stringify(products));
    document.getElementById("editProductCard").style.display = 'none';
    renderProductsAdmin();
    renderProductsBuy();
  }
}

// ---- ADMIN: view service submissions and orders ----
function renderServiceSubmissions(){
  const list = document.getElementById("svcList");
  const items = JSON.parse(localStorage.getItem("serviceSubmissions")||"[]");
  if(!items.length){
    list.innerHTML = "<p class='muted'>No service requests yet.</p>";
    return;
  }
  list.innerHTML = items.map(i=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Name:</strong> ${i.name}<br>
      <strong>Email:</strong> ${i.email}<br>
      <strong>Contact:</strong> ${i.contact}<br>
      <strong>Service:</strong> ${i.service}<br>
      <strong>Description:</strong> ${i.message || '—'}<br>
      <small class="muted">Submitted: ${i.date}</small>
    </li>
  `).join("");
}

function renderOrders(){
  const list = document.getElementById("orderList");
  const items = JSON.parse(localStorage.getItem("orders")||"[]");
  if(!items.length){
    list.innerHTML = "<p class='muted'>No product orders yet.</p>";
    return;
  }
  list.innerHTML = items.map(i=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Product:</strong> ${i.productName}<br>
      <strong>Name:</strong> ${i.name}<br>
      <strong>Email:</strong> ${i.email}<br>
      <strong>Contact:</strong> ${i.contact}<br>
      <strong>Address:</strong> ${i.address || '—'}<br>
      <small class="muted">Ordered: ${i.date}</small>
    </li>
  `).join("");
}

// ---- Admin tabs ----
function showAdminTab(tabId){
  document.querySelectorAll(".admin-section").forEach(s => s.style.display = 'none');
  const el = document.getElementById(tabId);
  if(el) el.style.display = 'block';
}

// expose some functions to global (used by inline onclicks)
window.showPage = showPage;
window.openOrderForm = openOrderForm;
window.loginAdmin = loginAdmin;
window.logout = logout;
window.startEditProduct = startEditProduct;
window.deleteProduct = deleteProduct;
window.saveEditedProduct = saveEditedProduct;
window.cancelEdit = cancelEdit;
window.showAdminTab = showAdminTab;
window.renderProductsBuy = renderProductsBuy;
window.renderProductsAdmin = renderProductsAdmin;
window.renderServiceSubmissions = renderServiceSubmissions;
window.renderOrders = renderOrders;

