// -------------------------------
// SUPABASE SETUP
// -------------------------------
const supabaseUrl = "https://agqnakijoxjdcozoabox.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// -------------------------------
// HELPER FUNCTION
// -------------------------------
function escapeHtml(text){
  if(!text) return "";
  return text.replace(/[&<>"']/g, function(m){
    return ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
    })[m];
  });
}

// -------------------------------
// UPDATE PRODUCTS JSON FILE
// -------------------------------
async function updateProductsJSON(){
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if(error) throw error;

    const jsonStr = JSON.stringify(products);
    const { error: uploadError } = await supabase
      .storage
      .from('public-data') // your bucket name
      .upload('products.json', new Blob([jsonStr], { type: 'application/json' }), { upsert: true });

    if(uploadError) throw uploadError;
    console.log("✅ Products JSON updated successfully!");
  } catch(err){
    console.error("❌ Error updating products JSON:", err);
  }
}

// -------------------------------
// RENDER PRODUCTS (ADMIN PANEL)
// -------------------------------
async function renderProductsAdmin(){
  const list = document.getElementById("productListAdmin");
  if(!list) return;
  list.innerHTML = "<p>Loading...</p>";

  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if(error) throw error;

    list.innerHTML = products.map(p=>`
      <div class="productCard">
        <img src="${p.image_url || ''}" alt="${escapeHtml(p.name)}">
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.description || '')}</p>
        <strong>${p.price != null ? p.price : ''}</strong>
        <div>
          <button onclick="editProduct(${p.id})">Edit</button>
          <button onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </div>
    `).join("");
  } catch(err){
    list.innerHTML = "<p>Error loading products.</p>";
    console.error(err);
  }
}
window.renderProductsAdmin = renderProductsAdmin;

// -------------------------------
// RENDER PRODUCTS (PUBLIC FRONT)
// -------------------------------
async function renderProductsBuy(){
  const list = document.getElementById("productListBuy");
  if(!list) return;
  list.innerHTML = "<p>Loading products...</p>";

  try {
    const response = await fetch("https://YOUR-PROJECT.supabase.co/storage/v1/object/public/public-data/products.json");

    const products = await response.json();

    if(!products || !products.length){
      list.innerHTML = "<p>No products available.</p>";
      return;
    }

    list.innerHTML = products.map(p=>`
      <div class="product">
        <img src="${p.image_url || ''}" alt="${escapeHtml(p.name)}">
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.description || '')}</p>
        <strong>${p.price != null ? p.price : ''}</strong>
        <div><button onclick="openOrderForm('${escapeHtml(p.name)}')">Buy Now</button></div>
      </div>
    `).join("");
  } catch(err){
    console.error("Fast product loading error:", err);
    list.innerHTML = "<p>Could not load products.</p>";
  }
}
window.renderProductsBuy = renderProductsBuy;

// -------------------------------
// ADD NEW PRODUCT
// -------------------------------
async function saveNewProduct(p){
  try {
    const { data, error } = await supabase.from('products').insert([p]);
    if(error) throw error;

    alert("✅ Product added!");
    await updateProductsJSON();
    renderProductsAdmin();
    renderProductsBuy();
  } catch(err){
    console.error("Error adding product:", err);
    alert("❌ Error adding product. See console.");
  }
}

// -------------------------------
// EDIT PRODUCT
// -------------------------------
async function saveEditedProduct(){
  const id = document.getElementById("edit_id").value;
  if(!id) return;
  
  const name = document.getElementById("edit_pName").value.trim();
  const price = parseFloat(document.getElementById("edit_pPrice").value);
  const desc = document.getElementById("edit_pDesc").value.trim();
  const location = document.getElementById("edit_pLocation").value.trim();
  const file = document.getElementById("edit_pImage").files[0];

  try {
    const updates = { name, price, description: desc, location };

    if(file){
      const reader = new FileReader();
      reader.onload = async ()=>{
        updates.image_url = reader.result;
        const { error } = await supabase.from('products').update(updates).eq('id', id);
        if(error) throw error;
        await updateProductsJSON();
        renderProductsAdmin();
        renderProductsBuy();
        document.getElementById("editProductCard").style.display = 'none';
      };
      reader.readAsDataURL(file);
    } else {
      const { error } = await supabase.from('products').update(updates).eq('id', id);
      if(error) throw error;
      await updateProductsJSON();
      renderProductsAdmin();
      renderProductsBuy();
      document.getElementById("editProductCard").style.display = 'none';
    }
  } catch(err){
    console.error("Save edited product error:", err);
    alert("Error saving product. See console.");
  }
}

// -------------------------------
// DELETE PRODUCT
// -------------------------------
async function deleteProduct(id){
  if(!confirm("Delete this product?")) return;
  try {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if(error) throw error;
    await updateProductsJSON();
    renderProductsAdmin();
    renderProductsBuy();
  } catch(err){
    console.error("Delete product error:", err);
    alert("Error deleting product.");
  }
}

// -------------------------------
// SERVICE REQUESTS (ADMIN PANEL)
// -------------------------------
async function renderServiceRequests(){
  const list = document.getElementById("svcList");
  if(!list) return;
  list.innerHTML = "<p>Loading...</p>";

  try {
    const { data, error } = await supabase.from('service_forms').select('*').order('created_at', { ascending: false });
    if(error) throw error;

    list.innerHTML = data.map(r=>`
      <div class="reqCard">
        <h4>${escapeHtml(r.name)}</h4>
        <p><b>Email:</b> ${escapeHtml(r.email)}</p>
        <p><b>Service:</b> ${escapeHtml(r.service)}</p>
        <p>${escapeHtml(r.message)}</p>
      </div>
    `).join("");
  } catch(err){
    list.innerHTML = "<p>Error loading requests.</p>";
    console.error(err);
  }
}
window.renderServiceRequests = renderServiceRequests;

// -------------------------------
// PRODUCT ORDERS (ADMIN PANEL)
// -------------------------------
async function renderProductOrders(){
  const list = document.getElementById("orderList");
  if(!list) return;
  list.innerHTML = "<p>Loading...</p>";

  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if(error) throw error;

    list.innerHTML = data.map(o=>`
      <div class="orderCard">
        <h4>${escapeHtml(o.customer_name)}</h4>
        <p><b>Product:</b> ${escapeHtml(o.product_name)}</p>
        <p><b>Phone:</b> ${escapeHtml(o.phone)}</p>
        <p><b>Address:</b> ${escapeHtml(o.address)}</p>
      </div>
    `).join("");
  } catch(err){
    list.innerHTML = "<p>Error loading orders.</p>";
    console.error(err);
  }
}
window.renderProductOrders = renderProductOrders;
