// ====== YEAR ======
document.getElementById("year").textContent = new Date().getFullYear();

// ====== SERVICE FORM ======
const serviceForm = document.getElementById("serviceForm");
if(serviceForm){
  serviceForm.addEventListener("submit", e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(serviceForm).entries());
    const orders = JSON.parse(localStorage.getItem("orders")||"[]");
    data.type="service";
    orders.push(data);
    localStorage.setItem("orders", JSON.stringify(orders));
    serviceForm.reset();
    document.getElementById("status").textContent = "Submitted! We’ll contact within 12 hrs.";
    setTimeout(()=> document.getElementById("status").textContent="",4000);
  });
}

// ====== PRODUCT LIST (HOME & PRODUCTS PAGE) ======
function renderProducts(){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  // Home Page
  const homeList = document.getElementById("productList");
  if(homeList){
    homeList.innerHTML = products.length ? products.map(p=>`
      <div class="product">
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <strong>${p.price}</strong>
        <button onclick="buyProduct('${p.name}')">Buy Now</button>
      </div>
    `).join("") : "<p>No products added yet.</p>";
  }

  // Products Page
  const productsBuy = document.getElementById("productListBuy");
  if(productsBuy){
    productsBuy.innerHTML = products.length ? products.map(p=>`
      <div class="product">
        <img src="${p.img}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <strong>${p.price}</strong>
        <button onclick="buyProduct('${p.name}')">Buy Now</button>
      </div>
    `).join("") : "<p>No products available.</p>";
  }

  // Admin Page
  const adminList = document.getElementById("adminProductList");
  if(adminList){
    adminList.innerHTML = products.length ? products.map((p,i)=>`
      <li>
        <strong>${p.name}</strong> - ${p.price} 
        <button onclick="deleteProduct(${i})">Delete</button>
      </li>
    `).join("") : "<li>No products added.</li>";
  }
}

// ====== BUY PRODUCT ======
function buyProduct(name){
  localStorage.setItem("selectedProduct", name);
  location.href = "products.html#productFormPage";
}

// ====== PRODUCT FORM ======
const productOrderForm = document.getElementById("productOrderForm");
if(productOrderForm){
  const selected = localStorage.getItem("selectedProduct");
  if(selected) document.getElementById("selectedProduct").value = selected;

  productOrderForm.addEventListener("submit", e=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(productOrderForm).entries());
    data.type="product";
    const orders = JSON.parse(localStorage.getItem("orders")||"[]");
    orders.push(data);
    localStorage.setItem("orders", JSON.stringify(orders));
    productOrderForm.reset();
    document.getElementById("productOrderStatus").textContent = "Submitted! We’ll contact within 12 hrs.";
    setTimeout(()=> document.getElementById("productOrderStatus").textContent="",4000);
    location.href="products.html";
  });
}

// ====== ADMIN PRODUCT ======
function addProduct(){
  const name = document.getElementById("pName").value;
  const price = document.getElementById("pPrice").value;
  const desc = document.getElementById("pDesc").value;
  const file = document.getElementById("pImage").files[0];
  if(!name||!price||!file) return alert("Fill all fields!");
  const reader = new FileReader();
  reader.onload = ()=>{
    const products = JSON.parse(localStorage.getItem("products")||"[]");
    products.push({name, price, desc, img: reader.result});
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    alert("Product added!");
    document.getElementById("pName").value="";
    document.getElementById("pPrice").value="";
    document.getElementById("pDesc").value="";
    document.getElementById("pImage").value="";
  };
  reader.readAsDataURL(file);
}

function deleteProduct(i){
  const products = JSON.parse(localStorage.getItem("products")||"[]");
  products.splice(i,1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
}

// ====== ADMIN ORDERS ======
function renderOrders(){
  const list = document.getElementById("orderList");
  const orders = JSON.parse(localStorage.getItem("orders")||"[]");
  if(!list) return;
  if(!orders.length){ list.innerHTML="<li>No requests yet.</li>"; return;}
  list.innerHTML = orders.map(o=>`
    <li style="margin-bottom:12px;border-bottom:1px solid #ddd;padding-bottom:8px;">
      <strong>Type:</strong> ${o.type==="service"?"Service Request":"Product Order"}<br>
      <strong>Name:</strong> ${o.name}<br>
      <strong>Email:</strong> ${o.email}<br>
      <strong>Contact:</strong> ${o.contact}<br>
      ${o.address?`<strong>Address:</strong> ${o.address}<br>`:""}
      <strong>Service/Product:</strong> ${o.service||o.productName}<br>
      <strong>Message:</strong> ${o.message||'—'}
    </li>
  `).join("");
}

// ===== INITIAL RENDER =====
renderProducts();
renderOrders();
