// =========================
// SUPABASE SETUP
// =========================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://agqnakijoxjdcozoabox.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// PAGE HANDLING
// =========================
function hideAllPages(){
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
}
function showPage(id){
  hideAllPages();
  const el = document.getElementById(id);
  if(el) el.style.display = "block";

  if(id === "productsPage") renderProductsBuy();
  if(id === "adminPanel"){
    renderProductsAdmin();
    renderServiceSubmissions();
    renderOrders();
    showAdminTab("manageProducts");
  }
}
window.showPage = showPage;

// =========================
// HELPER FUNCTIONS
// =========================
function escapeHtml(s){return String(s||"").replace(/"/g,'\\"').replace(/'/g,"\\'");}

// =========================
// SERVICE FORM -> SUPABASE
// =========================
document.getElementById("serviceForm").addEventListener("submit", async(e)=>{
  e.preventDefault();
  const name = svc_name.value.trim();
  const email = svc_email.value.trim();
  const contact = svc_contact.value.trim();
  const service = svc_service.value;
  const description = svc_message.value.trim();
  const statusMsg = document.getElementById("status");

  if(!name || !email || !contact || !service){
    statusMsg.textContent = "Please fill required fields.";
    return;
  }

  statusMsg.textContent = "Submitting...";
  const { error } = await supabase.from("service_forms").insert([{ name, email, contact, service, description }]);
  if(error){
    console.error(error);
    statusMsg.textContent = "❌ Error saving request.";
  } else {
    statusMsg.textContent = "✅ Submitted successfully!";
    e.target.reset();
  }
  setTimeout(()=>statusMsg.textContent="",3000);
});

// =========================
// ORDER FORM -> SUPABASE
// =========================
document.getElementById("productOrderForm").addEventListener("submit", async(e)=>{
  e.preventDefault();
  const product_name = selectedProduct.value;
  const name = ord_name.value.trim();
  const email = ord_email.value.trim();
  const contact = ord_contact.value.trim();
  const address = ord_address.value.trim();
  const status = document.getElementById("productOrderStatus");

  if(!product_name || !name || !email || !contact || !address){
    status.textContent = "Please fill required fields.";
    return;
  }

  status.textContent = "Submitting order...";
  const { error } = await supabase.from("product_orders").insert([{ product_name, name, email, contact, address }]);
  if(error){
    console.error(error);
    status.textContent = "❌ Error submitting order.";
  } else {
    status.textContent = "✅ Order submitted!";
    e.target.reset();
    showPage("productsPage");
  }
  setTimeout(()=>status.textContent="",3000);
});

// =========================
// PRODUCTS (FAST RENDER)
// =========================
async function renderProductsBuy(){
  const list = document.getElementById("productListBuy");
  list.innerHTML = "<p class='muted'>Loading...</p>";

  try {
    const { data: products, error } = await supabase.from("products").select("*").order("created_at",{ascending:false});
    if(error) throw error;

    if(!products.length){
      list.innerHTML = "<p>No products available.</p>";
      return;
    }

    list.innerHTML = products.map(p=>`
      <div class="product">
        <img src="${p.image_url||''}" alt="${escapeHtml(p.name)}">
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.description||'')}</p>
        <p class="muted">Location: ${escapeHtml(p.location||'—')}</p>
        <strong>${p.price}</strong>
        <button onclick="openOrderForm('${escapeHtml(p.name)}')">Buy Now</button>
      </div>
    `).join("");
  } catch(err){
    console.error(err);
    list.innerHTML = "<p>Failed to load products.</p>";
  }
}
window.renderProductsBuy = renderProductsBuy;

window.openOrderForm = (n)=>{
  showPage("productFormPage");
  document.getElementById("selectedProduct").value = n;
};

// =========================
// ADMIN LOGIN
// =========================
window.loginAdmin = ()=>{
  const u = adminUser.value.trim();
  const p = adminPass.value.trim();
  const msg = loginMsg;
  if(u==="admin" && p==="1234"){
    msg.style.color="green";
    msg.textContent="Login successful!";
    localStorage.setItem("isLoggedIn","true");
    setTimeout(()=>showPage("adminPanel"),700);
  } else {
    msg.style.color="red";
    msg.textContent="Invalid credentials!";
  }
};
window.logout = ()=>{ localStorage.removeItem("isLoggedIn"); showPage("home"); };
window.addEventListener("load",()=> localStorage.getItem("isLoggedIn")==="true"?showPage("adminPanel"):showPage("home"));

// =========================
// ADMIN: PRODUCT MANAGEMENT
// =========================
document.getElementById("addProductForm").addEventListener("submit",async(e)=>{
  e.preventDefault();
  const name = pName.value.trim();
  const price = parseFloat(pPrice.value);
  const description = pDesc.value.trim();
  const location = pLocation.value.trim();
  const file = pImage.files[0];
  if(!name || isNaN(price)) return alert("Fill name and numeric price");

  let image_url = "";
  if(file){
    const fileName = `product_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("public-data").upload(fileName, file);
    if(uploadError) console.error(uploadError);
    const { data } = supabase.storage.from("public-data").getPublicUrl(fileName);
    image_url = data.publicUrl;
  }

  const { error } = await supabase.from("products").insert([{ name, price, description, location, image_url }]);
  if(error){
    console.error(error);
    alert("Error adding product!");
  } else {
    alert("✅ Product added!");
    renderProductsAdmin();
    renderProductsBuy();
    e.target.reset();
  }
});

async function renderProductsBuy() {
  const list = document.getElementById("productListBuy");
  list.innerHTML = "<p class='muted'>Loading products...</p>";

  // Step 1: show cached data instantly
  const cached = localStorage.getItem("cachedProducts");
  if (cached) {
    const products = JSON.parse(cached);
    list.innerHTML = products.map(p => productCard(p)).join("");
  }

  // Step 2: fetch latest data in background
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, description, price, location, image_url")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!products || !products.length) {
      list.innerHTML = "<p class='muted'>No products available right now.</p>";
      return;
    }

    // update cache + UI
    localStorage.setItem("cachedProducts", JSON.stringify(products));
    list.innerHTML = products.map(p => productCard(p)).join("");
  } catch (err) {
    console.error("Fetch products error:", err);
    if (!cached) list.innerHTML = "<p class='muted'>Could not load products.</p>";
  }
}

function productCard(p) {
  return `
    <div class="product">
      <img loading="lazy" src="${p.image_url || ''}" alt="${escapeHtml(p.name)}">
      <h4>${escapeHtml(p.name)}</h4>
      <p style="min-height:40px">${escapeHtml(p.description || '')}</p>
      <p class="muted">Location: ${escapeHtml(p.location || '—')}</p>
      <strong>${p.price != null ? p.price : ''}</strong>
      <div style="margin-top:8px;">
        <button onclick="openOrderForm('${escapeHtml(p.name)}')">Buy Now</button>
      </div>
    </div>
  `;
}

// background auto-refresh every 60s
setInterval(() => renderProductsBuy(), 60000);


window.startEditProduct = async(id)=>{
  const { data:p, error } = await supabase.from("products").select("*").eq("id",id).single();
  if(error) return alert("Error loading product");
  edit_id.value=p.id;
  edit_pName.value=p.name;
  edit_pPrice.value=p.price;
  edit_pDesc.value=p.description||'';
  edit_pLocation.value=p.location||'';
  document.getElementById("editProductCard").style.display="block";
  window.scrollTo({top:0,behavior:"smooth"});
};

window.cancelEdit = ()=> document.getElementById("editProductCard").style.display="none";

window.saveEditedProduct = async()=>{
  const id = edit_id.value;
  const name = edit_pName.value.trim();
  const price = parseFloat(edit_pPrice.value);
  const description = edit_pDesc.value.trim();
  const location = edit_pLocation.value.trim();
  const file = edit_pImage.files[0];
  let updates = { name, price, description, location };

  if(file){
    const fileName = `product_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("public-data").upload(fileName, file);
    if(uploadError) console.error(uploadError);
    const { data } = supabase.storage.from("public-data").getPublicUrl(fileName);
    updates.image_url = data.publicUrl;
  }

  const { error } = await supabase.from("products").update(updates).eq("id",id);
  if(error){ console.error(error); alert("Error saving!"); }
  else{
    document.getElementById("editProductCard").style.display="none";
    renderProductsAdmin();
    renderProductsBuy();
  }
};

// =========================
// SERVICE REQUESTS & ORDERS
// =========================
async function renderServiceSubmissions(){
  const list = document.getElementById("svcList");
  const { data, error } = await supabase.from("service_forms").select("*").order("created_at",{ascending:false});
  if(error){ console.error(error); list.textContent="Error."; return; }
  if(!data.length){ list.textContent="No requests yet."; return; }

  list.innerHTML = data.map(i=>`
    <li style="border-bottom:1px solid #ccc;margin-bottom:8px;padding-bottom:6px;">
      <strong>${escapeHtml(i.name)}</strong> • ${escapeHtml(i.service)}<br>
      ${escapeHtml(i.email)} | ${escapeHtml(i.contact)}<br>
      <em>${escapeHtml(i.description||'')}</em><br>
      <small>${i.created_at}</small>
    </li>
  `).join("");
}
window.renderServiceSubmissions = renderServiceSubmissions;

async function renderOrders(){
  const list = document.getElementById("orderList");
  const { data, error } = await supabase.from("product_orders").select("*").order("created_at",{ascending:false});
  if(error){ console.error(error); list.textContent="Error."; return; }
  if(!data.length){ list.textContent="No orders yet."; return; }

  list.innerHTML = data.map(i=>`
    <li style="border-bottom:1px solid #ccc;margin-bottom:8px;padding-bottom:6px;">
      <strong>${escapeHtml(i.product_name)}</strong><br>
      ${escapeHtml(i.name)} | ${escapeHtml(i.contact)}<br>
      ${escapeHtml(i.email)}<br>
      Address: ${escapeHtml(i.address||'—')}<br>
      <small>${i.created_at}</small>
    </li>
  `).join("");
}
window.renderOrders = renderOrders;

// =========================
// ADMIN TAB SWITCH
// =========================
window.showAdminTab = (id)=>{
  document.querySelectorAll(".admin-section").forEach(s=>s.style.display="none");
  const el = document.getElementById(id);
  if(el) el.style.display="block";
};

