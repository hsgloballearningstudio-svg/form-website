// =========================
// SUPABASE SETUP (PASTE YOUR VALUES)
// =========================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://agqnakijoxjdcozoabox.supabase.co"; // <-- replace if different
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4";

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

// --------------
// FAST PRODUCT LOADING (direct from Supabase table)
// --------------
async function renderProductsBuy() {
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

    // instantly render products
    list.innerHTML = products.map(p => `
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
  if(logged === "true") showPage("adminPanel"); 
  else showPage("productsPage"); // <-- Home page now directly shows products
});
function logout(){ localStorage.removeItem("isLoggedIn"); showPage('productsPage'); }
window.logout = logout;

// --------------------------
// ADMIN: Products management (Supabase)
// --------------------------
// ADD / EDIT / DELETE products code remains exactly same as before
// ... (same as your current working code, no changes)
