// =========================
// SUPABASE SETUP (PASTE YOUR VALUES)
// =========================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://agqnakijoxjdcozoabox.supabase.co"; // <-- replace if different
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4"; // <-- replace with your anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper time string
function nowString(){
  const d = new Date();
  return d.toLocaleString();
}

// --------------------------
// Page switching logic
// --------------------------
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

  // render dynamic content when needed
  if(pageId === 'productsPage') renderProductsBuy();
  if(pageId === 'adminPanel') {
    renderProductsAdmin();
    renderServiceSubmissions();
    renderOrders();
    showAdminTab('manageProducts');
  }
}
window.showPage = showPage;

// --------------------------
// SERVICE FORM -> supabase insert
// --------------------------
const serviceForm = document.getElementById("serviceForm");
serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const statusMsg = document.getElementById("status");

  const name = document.getElementById("svc_name").value.trim();
  const email = document.getElementById("svc_email").value.trim();
  const contact = document.getElementById("svc_contact").value.trim();
  const service = document.getElementById("svc_service").value;
  const description = document.getElementById("svc_message").value.trim();

  if(!name || !email || !contact || !service){
    statusMsg.textContent = "Please fill required fields.";
    return;
  }
  statusMsg.textContent = "Submitting...";

  try {
    const { data, error } = await supabase
      .from("service_forms")
      .insert([{ name, email, contact, service, description }]);

    if (error) throw error;
    statusMsg.textContent = "✅ Submitted! We'll contact you shortly.";
    serviceForm.reset();
  } catch (err) {
    console.error("Supabase insert error:", err);
    statusMsg.textContent = "❌ Error saving data. See console.";
  }

  setTimeout(()=> statusMsg.textContent = "", 3500);
});

// --------------------------
// PRODUCT ORDER FORM -> supabase insert
const orderForm = document.getElementById("productOrderForm");
orderForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("productOrderStatus");

  const product_name = document.getElementById("selectedProduct").value;
  const name = document.getElementById("ord_name").value.trim();
  const email = document.getElementById("ord_email").value.trim();
  const contact = document.getElementById("ord_contact").value.trim();
  const address = document.getElementById("ord_address").value.trim();

  if(!product_name || !name || !email || !contact || !address){
    status.textContent = "Please fill required fields.";
    return;
  }
  status.textContent = "Submitting order...";

  try {
    const { data, error } = await supabase
      .from("product_orders")
      .insert([{ product_name, name, email, contact, address }]);

    if (error) throw error;
    status.textContent = "✅ Order submitted! We'll contact you.";
    orderForm.reset();
    showPage('productsPage');
  } catch (err) {
    console.error("Supabase insert error:", err);
    status.textContent = "❌ Error saving order. See console.";
  }

  setTimeout(()=> status.textContent = "", 3500);
});
// --------------------------
// PRODUCTS: fetch & render (public page)
// --------------------------
async function renderProductsBuy(){
  const list = document.getElementById("productListBuy");
  list.innerHTML = "<p class='muted'>Loading products...</p>";
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order('created_at', { ascending: false });

    if (error) throw error;
    if(!products || !products.length){
      list.innerHTML = "<p class='muted'>No products available right now.</p>";
      return;
    }

    list.innerHTML = products.map(p=>`
      <div class="product">
        <img src="${p.image_url || ''}" alt="${escapeHtml(p.name)}">
        <h4>${escapeHtml(p.name)}</h4>
        <p style="min-height:40px">${escapeHtml(p.description || '')}</p>
        <p class="muted">Location: ${escapeHtml(p.location || '—')}</p>
        <strong>${p.price != null ? p.price : ''}</strong>
        <div style="margin-top:8px;">
          <button onclick="openOrderForm('${escapeHtml(p.name)}')">Buy Now</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Fetch products error:", err);
    list.innerHTML = "<p class='muted'>Could not load products. See console.</p>";
  }
}
window.renderProductsBuy = renderProductsBuy;

// helper to prevent HTML breakage in onclick
function escapeHtml(s){ return String(s||'').replace(/'/g,"\\'").replace(/"/g,'\\"'); }

// open order form
function openOrderForm(name){
  showPage('productFormPage');
  document.getElementById("selectedProduct").value = name;
}
window.openOrderForm = openOrderForm;

// --------------------------
// ADMIN LOGIN / AUTH (simple)
// --------------------------
function loginAdmin(){
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const msg = document.getElementById('loginMsg');

  // change these credentials if you want
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

// --------------------------
// ADMIN: Products management (Supabase)
// --------------------------

// Add product: read file image as DataURL (base64) and insert
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("pName").value.trim();
  const price = parseFloat(document.getElementById("pPrice").value);
  const desc = document.getElementById("pDesc").value.trim();
  const location = document.getElementById("pLocation").value.trim();
  const file = document.getElementById("pImage").files[0];

  if(!name || isNaN(price)){
    return alert("Fill product name and numeric price!");
  }

  // read image if provided
  if(file){
    const reader = new FileReader();
    reader.onload = async ()=>{
      const imgData = reader.result; // base64
      await saveNewProduct({ name, price, description: desc, location, image_url: imgData });
      addProductForm.reset();
    };
    reader.readAsDataURL(file);
  } else {
    await saveNewProduct({ name, price, description: desc, location, image_url: '' });
    addProductForm.reset();
  }
});

// Save to Supabase
async function saveNewProduct(p){
  try {
    const { data, error } = await supabase.from('products').insert([p]);
    if (error) throw error;
    alert("Product added successfully!");
    renderProductsAdmin();
    renderProductsBuy();
  } catch (err) {
    console.error("Error adding product:", err);
    alert("Error adding product. See console.");
  }
}

// render admin products list (with edit/delete)
async function renderProductsAdmin(){
  const container = document.getElementById("adminProductList");
  container.innerHTML = "<p class='muted'>Loading...</p>";
  try {
    const { data: products, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if(!products || !products.length){
      container.innerHTML = "<p class='muted'>No products yet.</p>";
      return;
    }
    container.innerHTML = "<ul style='padding:0; margin:0;'>" + products.map(p=>`
      <li>
        <div style="display:flex; gap:10px; align-items:center;">
          <img src="${p.image_url || ''}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;">
          <div>
            <strong>${escapeHtml(p.name)}</strong><br>
            <span class="muted">${p.price} • ${escapeHtml(p.location || '—')}</span><br>
            <small class="muted">Added: ${p.created_at || '—'}</small>
          </div>
        </div>
        <div>
          <button onclick="startEditProduct('${p.id}')">Edit</button>
          <button onclick="deleteProduct('${p.id}')" style="background:#e74c3c; margin-left:8px;">Delete</button>
        </div>
      </li>
    `).join("") + "</ul>";
  } catch (err) {
    console.error("Render admin products error:", err);
    container.innerHTML = "<p class='muted'>Could not load products. See console.</p>";
  }
}
window.renderProductsAdmin = renderProductsAdmin;

// delete product by id
async function deleteProduct(id){
  if(!confirm("Delete this product?")) return;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    renderProductsAdmin();
    renderProductsBuy();
  } catch (err) {
    console.error("Delete product error:", err);
    alert("Error deleting product. See console.");
  }
}
window.deleteProduct = deleteProduct;

// start edit -> populate edit form
async function startEditProduct(id){
  try {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error) throw error;
    const p = data;
    document.getElementById("edit_id").value = p.id;
    document.getElementById("edit_pName").value = p.name;
    document.getElementById("edit_pPrice").value = p.price;
    document.getElementById("edit_pDesc").value = p.description || '';
    document.getElementById("edit_pLocation").value = p.location || '';
    document.getElementById("editProductCard").style.display = 'block';
    window.scrollTo({top:0, behavior:'smooth'});
  } catch (err) {
    console.error("Start edit error:", err);
    alert("Error loading product. See console.");
  }
}
window.startEditProduct = startEditProduct;

function cancelEdit(){
  document.getElementById("editProductCard").style.display = 'none';
  document.getElementById("edit_pImage").value = '';
}
window.cancelEdit = cancelEdit;

// save edited product (supports changing image)
function saveEditedProduct(){
  const idx = document.getElementById("edit_id").value;
  if(!idx) return;
  const name = document.getElementById("edit_pName").value.trim();
  const price = parseFloat(document.getElementById("edit_pPrice").value);
  const desc = document.getElementById("edit_pDesc").value.trim();
  const location = document.getElementById("edit_pLocation").value.trim();
  const file = document.getElementById("edit_pImage").files[0];

  if(isNaN(price)){
    return alert("Price must be numeric");
  }

  if(file){
    const reader = new FileReader();
    reader.onload = async ()=>{
      try {
        const updates = { name, price, description: desc, location, image_url: reader.result };
        const { error } = await supabase.from('products').update(updates).eq('id', idx);
        if (error) throw error;
        document.getElementById("editProductCard").style.display = 'none';
        renderProductsAdmin(); renderProductsBuy();
      } catch (err) {
        console.error("Save edited product error:", err);
        alert("Error saving product. See console.");
      }
    };
    reader.readAsDataURL(file);
  } else {
    (async ()=>{
      try {
        const updates = { name, price, description: desc, location };
        const { error } = await supabase.from('products').update(updates).eq('id', idx);
        if (error) throw error;
        document.getElementById("editProductCard").style.display = 'none';
        renderProductsAdmin(); renderProductsBuy();
      } catch (err) {
        console.error("Save edited product error:", err);
        alert("Error saving product. See console.");
      }
    })();
  }
}
window.saveEditedProduct = saveEditedProduct;

// --------------------------
// Service submissions & orders rendering for admin (fetch from supabase)
// --------------------------
async function renderServiceSubmissions(){
  const list = document.getElementById("svcList");
  list.innerHTML = "<p class='muted'>Loading...</p>";
  try {
    const { data, error } = await supabase.from('service_forms').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if(!data || !data.length){ list.innerHTML = "<p class='muted'>No service requests yet.</p>"; return; }
    list.innerHTML = data.map(i=>`
      <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
        <strong>Name:</strong> ${escapeHtml(i.name)}<br>
        <strong>Email:</strong> ${escapeHtml(i.email)}<br>
        <strong>Contact:</strong> ${escapeHtml(i.contact)}<br>
        <strong>Service:</strong> ${escapeHtml(i.service)}<br>
        <strong>Description:</strong> ${escapeHtml(i.description || '—')}<br>
        <small class="muted">Submitted: ${i.created_at || '—'}</small>
      </li>
    `).join("");
  } catch (err) {
    console.error("Render svc submissions error:", err);
    list.innerHTML = "<p class='muted'>Could not load service requests. See console.</p>";
  }
}
window.renderServiceSubmissions = renderServiceSubmissions;

async function renderOrders(){
  const list = document.getElementById("orderList");
  list.innerHTML = "<p class='muted'>Loading...</p>";
  try {
    const { data, error } = await supabase.from('product_orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    if(!data || !data.length){ list.innerHTML = "<p class='muted'>No product orders yet.</p>"; return; }
    list.innerHTML = data.map(i=>`
      <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
        <strong>Product:</strong> ${escapeHtml(i.product_name)}<br>
        <strong>Name:</strong> ${escapeHtml(i.name)}<br>
        <strong>Email:</strong> ${escapeHtml(i.email)}<br>
        <strong>Contact:</strong> ${escapeHtml(i.contact)}<br>
        <strong>Address:</strong> ${escapeHtml(i.address || '—')}<br>
        <small class="muted">Ordered: ${i.created_at || '—'}</small>
      </li>
    `).join("");
  } catch (err) {
    console.error("Render orders error:", err);
    list.innerHTML = "<p class='muted'>Could not load orders. See console.</p>";
  }
}
window.renderOrders = renderOrders;

// Admin tab show
function showAdminTab(tabId){
  document.querySelectorAll(".admin-section").forEach(s => s.style.display = 'none');
  const el = document.getElementById(tabId);
  if(el) el.style.display = 'block';
}
window.showAdminTab = showAdminTab;





