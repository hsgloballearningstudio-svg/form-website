// =================== SUPABASE INITIALIZATION ===================
const supabaseUrl = "https://agqnakijoxjdcozoabox.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFncW5ha2lqb3hqZGNvem9hYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNDM1NzcsImV4cCI6MjA3NzkxOTU3N30.9N2xn3k5EtmKyCL04GUzmbX1rsSMd3pqJwSBX6IxM_4";

// Create Supabase client
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// =================== ADMIN SETTINGS ===================
const ADMIN_EMAIL = "hsadvertiserofficial@gmail.com";
const ADMIN_WHATSAPP = "whatsapp:+923086036049";

// =================== HELPERS ===================
function nowString() {
    return new Date().toLocaleString();
}

function escapeHtml(s) {
    return String(s).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// =================== PAGE CONTROL ===================
function hideAllPages() {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
        p.style.display = 'none';
    });
}

function showPage(pageId) {
    hideAllPages();
    const el = document.getElementById(pageId);
    if (!el) return;
    el.classList.add("active");
    el.style.display = 'block';

    if (pageId === 'productsPage') renderProductsBuy();
    if (pageId === 'adminPanel') {
        renderProductsAdmin();
        renderServiceSubmissions();
        renderOrders();
        showAdminTab('manageProducts');
    }
}

// Expose to global
window.showPage = showPage;

// =================== SERVICE FORM ===================
const serviceForm = document.getElementById("serviceForm");
serviceForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("svc_name").value.trim();
    const email = document.getElementById("svc_email").value.trim();
    const contact = document.getElementById("svc_contact").value.trim();
    const service = document.getElementById("svc_service").value;
    const message = document.getElementById("svc_message").value.trim();

    // Save to Supabase
    const { error } = await supabase.from("service_forms").insert([{ name, email, contact, service, description: message }]);
    if (error) return alert("Error saving service form: " + error.message);

    // Mock Notifications
    sendEmailNotification("New Service Request", `Name: ${name}\nEmail: ${email}\nContact: ${contact}\nService: ${service}\nMessage: ${message}`);
    sendWhatsAppNotification(`Service Request:\nName: ${name}\nEmail: ${email}\nContact: ${contact}\nService: ${service}\nMessage: ${message}`);

    serviceForm.reset();
    const status = document.getElementById("status");
    if (status) {
        status.textContent = "Your request has been submitted successfully! We will contact you soon.";
        setTimeout(() => status.textContent = "", 5000);
    }
});

// =================== PRODUCT ORDER FORM ===================
const orderForm = document.getElementById("productOrderForm");

function openOrderForm(name) {
    showPage('productFormPage');
    document.getElementById("selectedProduct").value = name;
}
window.openOrderForm = openOrderForm;

orderForm.addEventListener("submit", async e => {
    e.preventDefault();

    const productName = document.getElementById("selectedProduct").value;
    const name = document.getElementById("ord_name").value.trim();
    const email = document.getElementById("ord_email").value.trim();
    const contact = document.getElementById("ord_contact").value.trim();
    const address = document.getElementById("ord_address").value.trim();

    const { error } = await supabase.from("product_orders").insert([{ product_name: productName, name, email, contact, address }]);
    if (error) return alert("Error saving product order: " + error.message);

    sendEmailNotification("New Product Order", `Product: ${productName}\nName: ${name}\nEmail: ${email}\nContact: ${contact}\nAddress: ${address}`);
    sendWhatsAppNotification(`Product Order:\nProduct: ${productName}\nName: ${name}\nEmail: ${email}\nContact: ${contact}\nAddress: ${address}`);

    orderForm.reset();
    const status = document.getElementById("productOrderStatus");
    if (status) {
        status.textContent = "Your order has been submitted successfully! We will contact you soon.";
        setTimeout(() => status.textContent = "", 5000);
    }
    showPage("productsPage");
});

// =================== PRODUCTS ADMIN ===================
const addProductForm = document.getElementById("addProductForm");
addProductForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("pName").value.trim();
    const price = document.getElementById("pPrice").value.trim();
    const desc = document.getElementById("pDesc").value.trim();
    const location = document.getElementById("pLocation").value.trim();
    const file = document.getElementById("pImage").files[0];

    let image_url = "";
    if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
            image_url = reader.result;
            await saveProduct({ name, price, desc, location, image_url });
        };
        reader.readAsDataURL(file);
    } else {
        await saveProduct({ name, price, desc, location, image_url });
    }
});

async function saveProduct(p) {
    const { error } = await supabase.from("products").insert([p]);
    if (error) return alert("Error adding product: " + error.message);
    alert("Product added successfully!");
    renderProductsAdmin();
    renderProductsBuy();
}

// =================== RENDER PRODUCTS ===================
async function renderProductsBuy() {
    const { data: products } = await supabase.from("products").select("*");
    const list = document.getElementById("productListBuy");
    if (!products || products.length === 0) {
        list.innerHTML = "<p class='muted'>No products available right now.</p>";
        return;
    }
    list.innerHTML = products.map(p => `
        <div class="product">
            <img src="${p.image_url || ''}" alt="${p.name}">
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

// =================== ADMIN LOGIN ===================
function loginAdmin(e) {
    e.preventDefault();
    const user = document.getElementById("adminUser").value.trim();
    const pass = document.getElementById("adminPass").value.trim();
    const msg = document.getElementById("loginMsg");
    if (user === "admin" && pass === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        msg.style.color = "green";
        msg.textContent = "Login successful! Opening panel...";
        setTimeout(() => { msg.textContent = ""; showPage("adminPanel"); }, 700);
    } else {
        msg.style.color = "red";
        msg.textContent = "Invalid username or password!";
    }
}
window.loginAdmin = loginAdmin;

function logout() {
    localStorage.removeItem("isLoggedIn");
    showPage("home");
}
window.logout = logout;

window.addEventListener("load", () => {
    if (localStorage.getItem("isLoggedIn") === "true") showPage("adminPanel");
    else showPage("home");
});

// =================== ADMIN VIEW ===================
async function renderProductsAdmin() {
    const { data: products } = await supabase.from("products").select("*");
    const container = document.getElementById("adminProductList");
    if (!products || products.length === 0) { container.innerHTML = "<p class='muted'>No products yet.</p>"; return; }
    container.innerHTML = "<ul style='padding:0; margin:0;'>" + products.map((p) => `
        <li style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <strong>${p.name}</strong> • ${p.price} • ${p.location || '—'}<br><small class="muted">Added: ${p.created_at || '—'}</small>
            </div>
            <div>
                <button onclick="deleteProduct(${p.id})" style="background:#e74c3c;">Delete</button>
            </div>
        </li>
    `).join("") + "</ul>";
}

async function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    renderProductsAdmin();
    renderProductsBuy();
}

async function renderServiceSubmissions() {
    const { data: items } = await supabase.from("service_forms").select("*");
    const list = document.getElementById("svcList");
    if (!items || items.length === 0) { list.innerHTML = "<p class='muted'>No service requests yet.</p>"; return; }
    list.innerHTML = items.map(i => `<li><strong>${i.name}</strong> • ${i.service} • ${i.email} • ${i.contact} <br>${i.description || ''}</li>`).join("");
}

async function renderOrders() {
    const { data: items } = await supabase.from("product_orders").select("*");
    const list = document.getElementById("orderList");
    if (!items || items.length === 0) { list.innerHTML = "<p class='muted'>No product orders yet.</p>"; return; }
    list.innerHTML = items.map(i => `<li><strong>${i.product_name}</strong> • ${i.name} • ${i.email} • ${i.contact} <br>${i.address || ''}</li>`).join("");
}

// =================== ADMIN TABS ===================
function showAdminTab(tabId) {
    document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
    document.getElementById(tabId).style.display = "block";
}
window.showAdminTab = showAdminTab;

// =================== EMAIL & WHATSAPP MOCK ===================
function sendEmailNotification(subject, body) {
    console.log("Email notification (mock):", subject, body);
    // Replace with EmailJS or backend in production
}

function sendWhatsAppNotification(messageText) {
    console.log("WhatsApp notification (mock):", messageText);
    // Replace with backend WhatsApp API in production
}
