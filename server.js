document.getElementById("year").textContent = new Date().getFullYear();

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="home") renderProductsHome();
  if(id==="productsPage") renderProductsBuy();
  if(id==="adminPanel") renderAdminProducts();
}

// ===== SERVICE FORM =====
const form = document.getElementById("serviceForm");
form.addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  orders.push({...data, type:"service"});
  localStorage.setItem("orders", JSON.stringify(orders));
  form.reset();
  document.getElementById("status").textContent="Submitted! We’ll contact within 12 hrs.";
  setTimeout(()=> document.getElementById("status").textContent="",3000);
});

// ===== PRODUCT ORDER FORM =====
const productOrderForm = document.getElementById("productOrderForm");
productOrderForm.addEventListener("submit", e=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(productOrderForm).entries());
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  orders.push({...data, type:"product"});
  localStorage.setItem("orders", JSON.stringify(orders));
  productOrderForm.reset();
  document.getElementById("productOrderStatus").textContent="Order submitted! Admin will contact you within 12 hrs.";
  setTimeout(()=> document.getElementById("productOrderStatus").textContent="",3000);
  showPage("productsPage");
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
function addProduct(){
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const desc = document.getElementById("pDesc").value;
  const file = document.getElementById("pImage").files[0];
  if(!name || !price || !file) return alert("Fill all product fields!");
  const reader = new FileReader();
  reader.onload = ()=>{
    const products = JSON.parse(localStorage.getItem("products")||"[]");
    products.push({name, price, desc, img:reader.result});
    localStorage.setItem("products", JSON.stringify(products));
    renderProductsHome();
    renderProductsBuy();
    renderAdminProducts();
  };
  reader.readAsDataURL(file);
}

// ===== RENDER PRODUCTS =====
function renderProductsHome(){
  const list = document.getElementById("productList");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  list.innerHTML = products.map((p,i)=>`
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
    </div>
  `).join("");
}

function renderProductsBuy(){
  const list = document.getElementById("productListBuy");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  list.innerHTML = products.map((p,i)=>`
    <div class="product">
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p>${p.desc}</p>
      <strong>${p.price}</strong>
      <button onclick="selectProduct('${p.name}')">Buy Now</button>
    </div>
  `).join("");
}

function selectProduct(name){
  document.getElementById("selectedProduct").value = name;
  showPage("productFormPage");
}

// ===== ADMIN PANEL =====
function renderAdminProducts(){
  const list = document.getElementById("adminProductList");
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  if(!products.length){ list.innerHTML="<li>No products added yet.</li>"; return; }
  list.innerHTML = products.map((p,i)=>`
    <li>
      <strong>${p.name}</strong> - ${p.price} 
      <button onclick="deleteProduct(${i})" style="margin-left:10px;">Delete</button>
    </li>
  `).join("");

  renderOrders();
}

// ===== DELETE PRODUCT =====
function deleteProduct(index){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(index,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProductsHome();
  renderProductsBuy();
  renderAdminProducts();
}

// ===== ORDERS =====
function renderOrders(){
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  if(!orders.length){ list.innerHTML="<li>No requests yet.</li>"; return; }

  list.innerHTML = orders.map(o=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Type:</strong> ${o.type}<br>
      <strong>Product / Service:</strong> ${o.service || o.productName}<br>
      <strong>Name:</strong> ${o.name}<br>
      <strong>Email:</strong> ${o.email}<br>
      <strong>Contact:</strong> ${o.contact}<br>
      ${o.address ? `<strong>Address:</strong> ${o.address}<br>` : ""}
      ${o.message ? `<strong>Message:</strong> ${o.message}` : ""}
    </li>
  `).join("");
}
