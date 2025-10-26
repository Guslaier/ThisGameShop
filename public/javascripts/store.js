

let container = document.getElementById("ShopExplo");
document.querySelectorAll('.layout').forEach(d => {
    d.addEventListener("click", (e) => {
        const el = e.currentTarget;
        if (el.getAttribute("active") === "False") {
            container.classList.toggle("horizontal");
            container.classList.toggle("normal");
            el.setAttribute("active", "True");
            if (el.getAttribute("id") === "gitQ") {
                document.getElementById("gitW").setAttribute("active", "False");
            }
            if (el.getAttribute("id") === "gitW") {
                document.getElementById("gitQ").setAttribute("active", "False");
            }
        } else if (el.getAttribute("active") != "True") {
            el.setAttribute("active", "False");
        }
    });
});



let allGames = []; // เก็บข้อมูลทั้งหมด

// แสดงเกมในหน้า
function renderGames(games) {
  const container = document.getElementById("ShopExplo");
  container.innerHTML = "";

  if (games.length === 0) {
    container.innerHTML = `<p style="color:white;text-align:center;">ไม่พบเกม</p>`;
    return;
  }

  games.forEach(g => {
    const card = document.createElement("div");
    card.className = "cards";

    const price = ((g.price_cents || 0) / 100).toLocaleString('en-US');
    const stock = g.stock !== undefined ? g.stock : 0;

    card.innerHTML = `
      <div class="poto">
        <img src="${g.image_poster || '/images/default-cover.jpg'}" alt="${g.title}">
        <img src="${g.image_poster || '/images/default-cover.jpg'}" alt="${g.title}">
      </div>
      <div class="footer">
        <div class="title">
          <h1>${g.title}</h1>
          <span>${g.platform_flags}</span>
        </div>
        <div class="con-price">
          <div class="price">
            <span>${price}</span><span>&nbsp;</span><span>฿</span>
          </div>
          <button class="addCart" onclick="addToCart(${g.id})">
            <i class="fi fi-rr-shopping-cart"></i>
          </button>
        </div>
        <div class="stock-info">
          <i class="fi fi-rr-box"></i> 
          <span>Stock: ${stock > 0 ? stock : '<span style="color:red;">Out of stock</span>'}</span>
        </div>
      </div>
    `;
    
    
    container.appendChild(card);
  });
}

// เพิ่มเกมลงตะกร้า
async function addToCart(id) {
  try {
    // ✅ 1. ตรวจสอบว่า login แล้วหรือยัง
    const sessionRes = await fetch("/account/session", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const sessionData = await sessionRes.json();

    if (!sessionData.loggedIn) {
      // 🔒 ถ้ายังไม่ล็อกอิน
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อน!",
        text: "คุณต้องเข้าสู่ระบบเพื่อเพิ่มสินค้าลงในตะกร้า 🛒",
        confirmButtonText: "เข้าสู่ระบบ",
        confirmButtonColor: "#3085d6",
        showCancelButton: true,
        cancelButtonText: "ยกเลิก",
        background: "#1e1e1e",
        color: "#fff",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/account/login"; // ✅ เปลี่ยนเส้นทางไปหน้า login
        }
      });
      return; // ❌ หยุดการทำงานต่อ
    }

    // ✅ 2. ถ้า login แล้ว เรียก API เพิ่มสินค้า
    const res = await fetch("../cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id: id, quantity: 1 }),
    });

    if (res.status === 403) return; // มี global fetch handler อยู่แล้ว

    const data = await res.json();

    // ✅ 3. แสดงผลตามสถานะ
    if (data.status) {
      Swal.fire({
        icon: "success",
        title: "เพิ่มลงตะกร้าแล้ว! 🛒",
        text: "คุณสามารถดูได้ที่หน้าตะกร้า",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "เพิ่มไม่สำเร็จ",
        text: data.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้า",
      });
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
    });
  }
}


const apiBase = '/stock/games';
let selectedGameId = null;
let deleteId = null;

// ✅ โหลดเกมทั้งหมดจาก API
async function loadGames() {
    try {
        const res = await fetch(apiBase);
        const data = await res.json();
        allGames = Array.isArray(data) ? data : data.data || [];
        console.log(allGames)
        renderGames(allGames);
    } catch (err) {
        console.error('❌ Error loading games:', err);
        gameGrid.innerHTML = `<p style="text-align:center; color:#bbb;">Failed to load games</p>`;
    }
}


// ✅ ฟิลเตอร์เกม
function applyFilters() {
    const title = document.getElementById('filterTitle').value.toLowerCase();
    const platform = document.getElementById('filterPlatform').value;
    const priceMin = parseFloat(document.getElementById('filterPriceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('filterPriceMax').value) || Infinity;
    const stockMin = parseFloat(document.getElementById('filterStockMin').value) || 0;
    const stockMax = parseFloat(document.getElementById('filterStockMax').value) || Infinity;

    const filtered = allGames.filter(g => {
        const titleMatch = g.title.toLowerCase().includes(title);
        const platformMatch = platform ? g.platform_flags === platform : true;
        const priceValue = parseFloat(g.price_cents || g.price || 0) / 100;
        const stockValue = parseInt(g.stock_managed) ?? 0;
        const priceMatch = priceValue >= priceMin && priceValue <= priceMax;
        const stockMatch = stockValue >= stockMin && stockValue <= stockMax;

        return titleMatch && platformMatch && priceMatch && stockMatch;
    });

    renderGames(filtered);
}

// ✅ Event listeners สำหรับ filter
['filterTitle', 'filterPlatform', 'filterPriceMin', 'filterPriceMax', 'filterStockMin', 'filterStockMax']
    .forEach(id => document.getElementById(id).addEventListener('input', applyFilters));

// ✅ เรียงเกม
function sortGames(field, order) {
    let sorted = [...allGames];
    sorted.sort((a, b) => {
        let valA = 0, valB = 0;
        if (field === 'price') {
            valA = parseFloat(a.price_cents || a.price || 0);
            valB = parseFloat(b.price_cents || b.price || 0);
        } else if (field === 'stock') {
            valA = parseInt(a.stock_managed || 0);
            valB = parseInt(b.stock_managed || 0);
        }
        return order === 'asc' ? valA - valB : valB - valA;
    });
    renderGames(sorted);
}

loadGames()
document.addEventListener("DOMContentLoaded", async () => {
  // ✅ รอจนกว่าเกมทั้งหมดถูกโหลดเข้า #ShopExplo แล้ว
  const waitForGames = async () => {
    let retries = 20;
    while (retries-- > 0) {
      if (document.querySelectorAll("#ShopExplo .cards").length > 0) return;
      await new Promise(r => setTimeout(r, 150));
    }
  };
  await waitForGames();

  // ✅ อ่านค่า platform จาก URL เช่น ?platform=PS5
  const params = new URLSearchParams(window.location.search);
  const platform = params.get("platform");

  if (platform) {
    console.log(`🟢 Filter platform: ${platform}`);
    const select = document.getElementById("filterPlatform");

    // ตั้งค่า dropdown ให้ตรง
    if (select) select.value = platform;

    // ✅ เรียกฟังก์ชันกรอง (ต้องมีอยู่ใน store.js)
    if (typeof applyFilters === "function") {
      applyFilters();
    } else {
      console.warn("⚠️ applyFilters() not found in store.js");
    }

    // ✅ แสดง platform ปัจจุบันใน title
    const title = document.querySelector(".title");
    if (title) title.innerHTML = `Explore : ${platform}`;
  }
});

function renderGames(games) {
  const container = document.getElementById("ShopExplo");
  container.innerHTML = "";

  if (games.length === 0) {
    container.innerHTML = `<p style="color:white;text-align:center;">ไม่พบเกม</p>`;
    return;
  }

  games.forEach(g => {
    const card = document.createElement("div");
    card.className = "cards";

    const price = ((g.price_cents || 0) / 100).toLocaleString('en-US');
    const stock = g.stock_managed ?? 0;

    // ✅ ถ้า stock = 0 ให้ปุ่มถูก disable
    const isOutOfStock = stock <= 0;
    const addCartClass = isOutOfStock ? "addCart disabled" : "addCart";
    const addCartAttr = isOutOfStock ? "disabled" : `onclick="addToCart(${g.id})"`;

    card.addEventListener("click", e => {
      if (e.target.closest(".addCart")) return;
      // ✅ go to /store/gamedetail/:id instead
      window.location.href = `/store/gamedetail/${g.id}`;
    });  
    
    card.innerHTML = `
      <div class="poto">
        <img src="${g.image_poster || '/images/default-cover.jpg'}" alt="${g.title}">
      </div>
      <div class="footer">
        <div class="title">
          <h1>${g.title}</h1>
          <span>${g.platform_flags}</span>
        </div>
        <div>
        <div class="con-price">
        <div class="price">
        <span>${price}</span><span>&nbsp;</span><span>฿</span>
        </div>
        <button class="${addCartClass}" ${addCartAttr}>
        <i class="fi fi-rr-shopping-cart"></i>
        </button>
        </div>
        <div class="stock-info">
            <span>Stock: ${stock > 0 ? stock : '<span style="color:red;">Out of stock</span>'}</span>
        </div>
        </div>
      </div>
    `;

    container.appendChild(card);
    
  });
}


