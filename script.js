document.getElementById("year").textContent = new Date().getFullYear();

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="home") renderProducts();
  if(id==="adminPanel") renderOrders();
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
  list.innerHTML=products.map(p=>`
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
    </div>
  `).join("");
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
      <strong>Contact:</strong> ${o.contact}<br>
      <strong>Service:</strong> ${o.service}<br>
      <strong>Message:</strong> ${o.message || '—'}
    </li>
  `).join("");
}
