const apiBase = '/stock/games';
const gameGrid = document.getElementById('gameGrid');
const modal = document.getElementById('modalGame');
const confirmModal = document.getElementById('confirmDelete');
const gallerySection = document.getElementById('gallerySection');
const galleryGrid = document.getElementById('galleryGrid');

let allGames = [];
let selectedGameId = null;
let deleteId = null;
// ✅ โหลดเกมทั้งหมดจาก API
async function loadGames() {
    try {
        const res = await fetch(apiBase);
        const data = await res.json();
        allGames = Array.isArray(data) ? data : data.data || [];
        renderGames(allGames);
    } catch (err) {
        console.error('❌ Error loading games:', err);
        gameGrid.innerHTML = `<p style="text-align:center; color:#bbb;">Failed to load games</p>`;
    }
}

// ✅ แสดงเกมเป็นการ์ด
function renderGames(games) {
    gameGrid.innerHTML = '';
    if (games.length === 0) {
        gameGrid.innerHTML = `<p style="text-align:center; color:#bbb;">No games found</p>`;
        return;
    }

    games.forEach((g, i) => {
        const price = parseFloat(g.price_cents)
            ? ((g.price_cents || 0) / 100).toLocaleString('en-US')
            : '—';
        const stock = parseInt(g.stock_managed) ?? '—';
        const platform = g.platform_flags || '—';

        gameGrid.innerHTML += `
          <div class="game-card">
            <img class="cover" src="${g.image_poster || '/images/default-cover.jpg'}" alt="${g.title}">
            <div class="game-info">
              <div class="game-id">#${g.id}</div>
              <div class="title">${g.title}</div>
              <div class="platform">${g.platform_flags || '—'}</div>
              <div class="price">💰 ${(g.price_cents / 100).toLocaleString()} ฿</div>
              <div class="stock">📦 ${g.stock_managed ?? 0}</div>
            </div>
            <div class="actions">
              <button class="btn-small edit" onclick="editGame(${g.id})">Edit</button>
              <button class="btn-small" onclick="openGallery(${g.id})">Gallery</button>
              <button class="btn-small danger" onclick="confirmDelete(${g.id})">Delete</button>
            </div>
          </div>
        `;

    });

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
        const idMatch = String(g.id).includes(title);
        const platformMatch = platform ? g.platform_flags === platform : true;
        const priceValue = parseFloat(g.price_cents || g.price || 0) / 100;
        const stockValue = parseInt(g.stock_managed) ?? 0;
        const priceMatch = priceValue >= priceMin && priceValue <= priceMax;
        const stockMatch = stockValue >= stockMin && stockValue <= stockMax;

        return (titleMatch || idMatch) && platformMatch && priceMatch && stockMatch;
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

// ✅ Gallery
async function openGallery(id) {
    selectedGameId = id;
    gallerySection.classList.remove('hidden');

    // 🟢 ดึงข้อมูลเกมเพื่อแสดงชื่อในหัวข้อ
    try {
        const resGame = await fetch(`${apiBase}/${id}`);
        const gameData = await resGame.json();
        const { game } = gameData.rows?.[0] || gameData || {};
        const gameTitle = game.title || "Unknown";
        const gameId = game.id || id;
        // ✅ แสดงชื่อเกมในหัวข้อ
        document.getElementById('galleryHeader').innerText = `📸 กำลังจัดการ Gallery: ${gameTitle} (#${gameId})`;
    } catch (err) {
        console.warn("ไม่สามารถโหลดชื่อเกมได้:", err);
        document.getElementById('galleryHeader').innerText = `📸 กำลังจัดการ Gallery: #${id}`;
    }

    // 🔄 โหลดภาพในแกลเลอรี
    const res = await fetch(`${apiBase}/${id}/gallery`);
    const data = await res.json();
    const images = data.data || [];
    galleryGrid.innerHTML = images.length
        ? images.map(img => `
      <div class="gallery-item">
        <img src="${img.scr}" alt="${img.title}">
        <p>${img.title || ''}</p>
        <button class="btn-small danger" onclick="deleteGalleryImage(${img.id})">Delete</button>
      </div>
    `).join('')
        : '<p style="color:#ccc;">No images found</p>';
}


document.getElementById('btnCloseGallery').addEventListener('click', () => {
    gallerySection.classList.add('hidden');
    selectedGameId = null;
    document.getElementById('galleryHeader').innerText = "📸 Game Gallery";
});


document.getElementById('galleryForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // ✅ กันทุกกรณี
    if (!selectedGameId) {
        Swal.fire({
            icon: 'warning',
            title: '⚠ No Game Selected',
            text: 'กรุณาเลือกเกมก่อนอัปโหลดรูปภาพ',
            confirmButtonColor: '#3085d6'
        });
        return;
    }

    const formData = new FormData(e.target);
    galleryGrid.innerHTML = `<p style="color:#aaa;text-align:center;">⏳ กำลังโหลดรูปภาพ...</p>`;
    try {
        const res = await fetch(`${apiBase}/${selectedGameId}/gallery`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        if (res.ok && data.status) {
            Swal.fire({
                icon: 'success',
                title: '✅ อัปโหลดสำเร็จ!',
                text: data.message || 'เพิ่มรูปภาพเข้าสู่แกลเลอรีเรียบร้อยแล้ว',
                timer: 1500,
                showConfirmButton: false
            });

            await refreshGallery(); // ✅ โหลดเฉพาะ grid ใหม่
            e.target.reset(); // ล้างฟอร์ม
        }

        else {
            Swal.fire({
                icon: 'error',
                title: '❌ ไม่สามารถอัปโหลดได้',
                text: data.error || data.message || 'เกิดข้อผิดพลาดระหว่างการอัปโหลด',
                confirmButtonColor: '#d33'
            });
        }

    } catch (error) {
        console.error("Upload error:", error);
        Swal.fire({
            icon: 'error',
            title: '❌ Upload Failed',
            text: error.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            confirmButtonColor: '#d33'
        });
    }
});




async function deleteGalleryImage(imgId) {
    try {
        const res = await fetch(`${apiBase}/${selectedGameId}/gallery/${imgId}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok && data.status) {
            Swal.fire({
                icon: 'success',
                title: '🗑️ ลบรูปสำเร็จ',
                text: data.message || 'ลบภาพออกจากแกลเลอรีแล้ว',
                timer: 1200,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: '❌ ลบไม่สำเร็จ',
                text: data.message || 'ไม่สามารถลบรูปนี้ได้',
                confirmButtonColor: '#d33'
            });
        }
    } catch (err) {
        console.error("❌ Delete error:", err);
    }
}



// ✅ Delete
function confirmDelete(id) {
    deleteId = id;
    confirmModal.classList.remove('hidden');
}

document.getElementById('btnCancelDelete').addEventListener('click', () => confirmModal.classList.add('hidden'));
document.getElementById('btnYesDelete').addEventListener('click', async () => {
    if (!deleteId) return;
    await fetch(`${apiBase}/${deleteId}`, { method: 'DELETE' });
    confirmModal.classList.add('hidden');
    loadGames();
});

// ✅ Add Game
document.getElementById('btnAddGame').addEventListener('click', () => {
    document.getElementById('gameForm').reset();
    document.getElementById('modalTitle').innerText = "Add New Game";
    modal.classList.remove('hidden');
});

document.getElementById('btnCancel').addEventListener('click', () => modal.classList.add('hidden'));

document.getElementById('gameForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    document.getElementById('gameForm').querySelector('input[type="file"]'); const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput.files; // ✅ เอาไฟล์แรก
    // if (!file) return alert('กรุณาเลือกไฟล์');



    const res = await fetch('/stock/games', { method: 'POST', body: formData });
    if (!res.ok) {
        alert(res.id)
        return alert('❌ Failed to add game')
    } else {
        const newGame = await res.json();

        const fileInput = document.getElementById('gameForm').querySelector('input[type="file"]');
        if (fileInput.files[0]) {
            const imgData = new FormData();
            imgData.append('image', fileInput.files[0]);

            await fetch(`/stock/games/${newGame.data.id}/img`, {
                method: 'POST',
                body: imgData
            });
        }

    }

    modal.classList.add('hidden');
    loadGames();
});

function editGame(id) {
    alert(`🛠 Edit mode coming soon for game ID: ${id}`);
}
// ✅ โหลดเฉพาะรูปในแกลเลอรีใหม่ (ไม่รีทั้ง Section)
async function refreshGallery() {
    if (!selectedGameId) return;

    try {
        const res = await fetch(`${apiBase}/${selectedGameId}/gallery`);
        const data = await res.json();
        const images = data.data || [];

        galleryGrid.innerHTML = images.length
            ? images.map(img => `
        <div class="gallery-item">
          <img src="${img.scr}" alt="${img.title}">
          <p>${img.title || ''}</p>
          <button class="btn-small danger" onclick="deleteGalleryImage(${img.id})">Delete</button>
        </div>
      `).join('')
            : '<p style="color:#ccc;">No images found</p>';
    } catch (err) {
        console.error("Error reloading gallery:", err);
    }
}

loadGames();