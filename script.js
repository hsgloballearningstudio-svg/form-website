<script>
/* ===================== Data keys ===================== */
const KEY_SUB = 'hsFormSubmissions';
const KEY_PRODUCTS = 'hsProducts';
const KEY_ORDERS = 'hsOrders';
const KEY_ADMIN = 'hsAdminLogged'; // 'true' when logged

/* ===================== Utility ===================== */
function nowISO(){ return new Date().toISOString(); }
function uid(){ return Date.now() + Math.floor(Math.random()*999); }
function q(id){ return document.getElementById(id); }
function save(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function load(k){ try{ return JSON.parse(localStorage.getItem(k) || '[]'); }catch(e){ return []; } }
function escape(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeTel(s){ if(!s) return ''; return String(s).replace(/\s+/g,'').replace(/[^\d\+]/g,''); }

/* ===================== Show / Hide sections ===================== */
function showSection(name){
  const all = document.querySelectorAll('main > section');
  all.forEach(s=>s.classList.add('hidden'));
  const el = document.getElementById(name);
  if(el) el.classList.remove('hidden');
  window.scrollTo({top:0,behavior:'smooth'});
  q('loginMsg') && (q('loginMsg').textContent='');

  // ✅ Access control for admin areas
  const adminPages = ['admin','manageProducts','manageSubmissions','manageOrders'];
  const logged = localStorage.getItem(KEY_ADMIN)==='true';
  if(adminPages.includes(name) && !logged){
    alert('Access denied! Please login first.');
    showSection('adminLogin');
    return;
  }
  refreshUI();
}

/* ===================== Initial UI ===================== */
q('year').textContent = new Date().getFullYear();
showSection('shop');
refreshUI();

/* ===================== SERVICE FORM ===================== */
q('serviceForm').addEventListener('submit', function(e){
  e.preventDefault();
  const f = e.target;
  const d = {
    id: uid(),
    name: f.name.value.trim(),
    email: f.email.value.trim(),
    contact: f.contact.value.trim(),
    service: f.service.value,
    message: f.message.value.trim(),
    time: nowISO()
  };
  const arr = load(KEY_SUB); arr.unshift(d); save(KEY_SUB, arr);
  q('formStatus').textContent='Submitted — thank you!';
  q('formStatus').style.color='green';
  f.reset();
});

/* ===================== SHOP ===================== */
q('searchInput').addEventListener('input', renderProducts);
q('categoryFilter').addEventListener('change', renderProducts);

function renderProducts(){
  const all = load(KEY_PRODUCTS).filter(p=>p.status==='approved');
  const qstr = q('searchInput').value.trim().toLowerCase();
  const cat = q('categoryFilter').value;
  let filtered = all;
  if(cat) filtered = filtered.filter(p=>p.category===cat);
  if(qstr) filtered = filtered.filter(p=>(p.title+' '+p.desc).toLowerCase().includes(qstr));
  const grid = q('productsGrid');
  if(filtered.length===0){ grid.innerHTML=''; q('noProducts').classList.remove('hidden'); return; }
  q('noProducts').classList.add('hidden');
  grid.innerHTML = filtered.map(p=>`
    <div class="product card-relative">
      <div style="position:relative">
        <img src="${p.img||'https://via.placeholder.com/600x400?text=No+Image'}" alt="">
        <div class="price-badge">Rs ${escape(p.price)}</div>
      </div>
      <div>
        <strong>${escape(p.title)}</strong>
        <div class="small">${escape(p.category)}</div>
        <p>${escape(p.desc||'')}</p>
        <div class="actions">
          <a class="btn" href="tel:${escapeTel(p.contact||'')}">Call / WhatsApp</a>
          <button class="btn alt" onclick="openOrderModal('${p.id}')">Order Now</button>
        </div>
      </div>
    </div>`).join('');
}

/* ===================== ORDER MODAL ===================== */
function openOrderModal(pid){
  const p = load(KEY_PRODUCTS).find(x=>x.id===pid);
  if(!p) return;
  const html = `
  <div class="modal-back" id="modal">
    <div class="modal">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Order: ${escape(p.title)}</h3><button class="close-x" onclick="closeModal()">X</button>
      </div>
      <label>Name</label><input id="oName">
      <label>Phone</label><input id="oPhone">
      <label>Address</label><input id="oAddr">
      <label>Qty</label><input id="oQty" type="number" value="1" min="1">
      <div class="actions"><button class="btn" onclick="submitOrder('${pid}')">Submit</button><button class="btn alt" onclick="closeModal()">Cancel</button></div>
    </div>
  </div>`;
  q('modalRoot').innerHTML=html; q('modalRoot').classList.remove('hidden');
}
function closeModal(){ q('modalRoot').innerHTML=''; q('modalRoot').classList.add('hidden'); }
function submitOrder(pid){
  const name=q('oName').value.trim(), phone=q('oPhone').value.trim(), addr=q('oAddr').value.trim(), qty=parseInt(q('oQty').value)||1;
  if(!name||!phone||!addr)return alert('Please fill all fields');
  const prod=load(KEY_PRODUCTS).find(x=>x.id===pid);
  const orders=load(KEY_ORDERS);
  orders.unshift({id:uid(),productTitle:prod.title,name,phone,address:addr,qty,time:nowISO()});
  save(KEY_ORDERS,orders);
  closeModal(); alert('Order placed!');
}

/* ===================== ADMIN AUTH ===================== */
q('doLogin').addEventListener('click',()=>{
  const u=q('adminUser').value.trim(), p=q('adminPass').value.trim();
  if(u==='admin' && p==='1234'){
    localStorage.setItem(KEY_ADMIN,'true');
    showSection('admin');
  } else {
    q('loginMsg').textContent='Invalid credentials';
    q('loginMsg').style.color='red';
  }
});
q('logoutBtn').addEventListener('click',()=>{
  localStorage.removeItem(KEY_ADMIN);
  alert('Logged out!');
  showSection('shop');
});

/* ===================== ADMIN UI REFRESH ===================== */
function refreshUI(){
  const logged = localStorage.getItem(KEY_ADMIN)==='true';
  q('adminBtnTop').classList.toggle('hidden', logged);
  if(!document.querySelector('#shop').classList.contains('hidden')) renderProducts();
}

/* ===================== Product Management ===================== */
function openAddProduct(){
  const html = `
  <div class="modal-back">
    <div class="modal">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Add Product</h3><button class="close-x" onclick="closeModal()">X</button>
      </div>
      <label>Image</label><input id="fileInput" type="file" accept="image/*">
      <label>Title</label><input id="prodTitle">
      <label>Description</label><textarea id="prodDesc" rows="2"></textarea>
      <label>Price</label><input id="prodPrice">
      <label>Category</label>
      <select id="prodCategory">
        <option>Smartwatch</option><option>Bluetooth Speaker</option>
        <option>AirPods</option><option>Earbuds</option>
        <option>Gaming Headset</option><option>Ring Light</option>
        <option>Power Bank</option><option>Others</option>
      </select>
      <label>Contact</label><input id="prodContact" placeholder="+92...">
      <div class="actions"><button class="btn" onclick="handleAddProduct()">Save</button><button class="btn alt" onclick="closeModal()">Cancel</button></div>
    </div>
  </div>`;
  q('modalRoot').innerHTML=html; q('modalRoot').classList.remove('hidden');
}
function handleAddProduct(){
  const t=q('prodTitle').value.trim(), d=q('prodDesc').value.trim(), pr=q('prodPrice').value.trim(), c=q('prodCategory').value, con=q('prodContact').value.trim();
  if(!t||!pr)return alert('Title and Price required');
  const f=q('fileInput');
  const p={id:uid(),title:t,desc:d,price:pr,category:c,contact:con,status:'approved',time:nowISO()};
  if(f.files&&f.files[0]){const r=new FileReader();r.onload=e=>{p.img=e.target.result;pushProduct(p)};r.readAsDataURL(f.files[0]);}
  else{p.img='https://via.placeholder.com/600x400?text=No+Image';pushProduct(p);}
}
function pushProduct(p){const a=load(KEY_PRODUCTS);a.unshift(p);save(KEY_PRODUCTS,a);closeModal();renderProducts();alert('Product added!');}

/* ===================== Final Init ===================== */
renderProducts();
refreshUI();
</script>
