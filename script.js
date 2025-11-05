// =========================
// SUPABASE SETUP (PASTE YOUR VALUES)
// =========================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://agqnakijoxjdcozoabox.supabase.co"; // <-- replace if different
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...IXM_4"; // <-- replace with your full anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// Helper: nowString (optional)
function nowString(){
  const d = new Date();
  return d.toLocaleString();
}

// =========================
// PAGE UTILS (keep these from your original file)
// =========================
function hideAllPages(){
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
    p.style.display = 'none';
  });
}
function showPage(pageId){
  hideAllPages();
  const el = document.getElementById(pageId);
  if(!el) return;
  el.classList.add("active");
  el.style.display = 'block';
  if(pageId === 'productsPage') renderProductsBuy();
  if(pageId === 'adminPanel') {
    renderProductsAdmin();
    renderServiceSubmissions();
    renderOrders();
    showAdminTab('manageProducts');
  }
}
window.showPage = showPage;

// =========================
// SERVICE FORM (Supabase insert) — final handler
// =========================
const serviceForm = document.getElementById("serviceForm");

serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("svc_name").value.trim();
  const email = document.getElementById("svc_email").value.trim();
  const contact = document.getElementById("svc_contact").value.trim();
  const service = document.getElementById("svc_service").value;
  const message = document.getElementById("svc_message").value.trim();

  // QUICK CLIENT-SIDE CHECK
  if(!name || !email || !contact || !service){
    document.getElementById("status").textContent = "Please fill required fields.";
    return;
  }

  const statusMsg = document.getElementById("status");
  statusMsg.textContent = "Submitting...";

  try {
    const { data, error } = await supabase
      .from("service_forms")    // <-- make sure this table name exists in Supabase
      .insert([{ name, email, contact, service, message }]);

    if (error) throw error;

    statusMsg.textContent = "✅ Submitted! We'll contact within 12 hrs.";
    serviceForm.reset();
  } catch (err) {
    console.error("Supabase insert error:", err);
    statusMsg.textContent = "❌ Error saving data (see console).";
  }

  setTimeout(()=> statusMsg.textContent = "", 3000);
});

// =========================
// PRODUCT + ORDER (keeps original local fallback until you want to convert)
// NOTE: I'll keep the original localStorage product/order handlers disabled here.
// If you want Supabase products/orders now, I can replace them too.
// =========================

// Small helper to escape quotes in names used inside onclick
function escapeHtml(s){ return String(s).replace(/'/g,"\\'").replace(/"/g,'\\"'); }

// Open order form (still uses selectedProduct input)
function openOrderForm(name){
  showPage('productFormPage');
  document.getElementById("selectedProduct").value = name;
}
window.openOrderForm = openOrderForm;

// ---- Admin login / autologin / logout (keep original logic) ----
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
window.loginAdmin = loginAdmin;

window.addEventListener("load", ()=> {
  const logged = localStorage.getItem("isLoggedIn");
  if(logged === "true") showPage("adminPanel"); else showPage("home");
});
function logout(){ localStorage.removeItem("isLoggedIn"); showPage('home'); }
window.logout = logout;

// =========================
// ADMIN: Render functions using localStorage for now (keeps current behavior)
// If you want Supabase versions for products/orders, say and I'll replace them.
// =========================
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
window.renderProductsBuy = renderProductsBuy;

function renderProductsAdmin(){
  const container = document.getElementById("adminProductList");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){ container.innerHTML = "<p class='muted'>No products yet.</p>"; return; }
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
window.renderProductsAdmin = renderProductsAdmin;

function deleteProduct(index){
  if(!confirm("Delete this product?")) return;
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(index,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProductsAdmin();
  renderProductsBuy();
}
window.deleteProduct = deleteProduct;

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
window.startEditProduct = startEditProduct;

function cancelEdit(){
  document.getElementById("editProductCard").style.display = 'none';
  document.getElementById("edit_pImage").value = '';
}
window.cancelEdit = cancelEdit;

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
window.saveEditedProduct = saveEditedProduct;

// Service submissions and orders (still using localStorage view)
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
window.renderServiceSubmissions = renderServiceSubmissions;

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
window.renderOrders = renderOrders;

// Admin tab show
function showAdminTab(tabId){
  document.querySelectorAll(".admin-section").forEach(s => s.style.display = 'none');
  const el = document.getElementById(tabId);
  if(el) el.style.display = 'block';
}
window.showAdminTab = showAdminTab;
