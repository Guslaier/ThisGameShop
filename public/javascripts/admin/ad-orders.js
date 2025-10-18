// ============================================================
// 📦 Orders Management
// ============================================================
const orderTableBody = document.getElementById("orderGrid");

async function loadOrders() {
  try {
    const res = await fetch("../order/all");
    const data = await res.json();
    console.log(data)
    if (!data.status || data.data.length === 0) {
      orderTableBody.innerHTML = `<div style="display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1rem;
  color: #fff;
">No orders found</div>`;
      return;
    }

    renderOrders(data.data);
  } catch (err) {
    console.error("Error loading orders:", err);
  }
}

function renderOrders(orders) {
  orderGrid.innerHTML = orders.map((o, i) => `
    <div class="order-card">
      <div class="order-left">
        <div class="order-number">#${i + 1}</div>
        <div class="order-id">${o.order_no || o.order_id}</div>
        <div class="order-customer">${o.customer_name || '-'}</div>
        <div class="order-date">📅 ${new Date(o.created_at).toLocaleDateString()}</div>
        <div class="order-total">💰 ${(o.total_cents/100)?.toLocaleString('en-EN') || 0} ฿</div>
      </div>

      <div class="order-status">
        <span class="status-label ${o.status}">${o.status}</span>
      </div>

      <div class="order-actions">
        <button class="btn-small info" onclick="viewOrder(${o.id})">View</button>
        <button class="btn-small edit" onclick="updateStatus(${o.id})">Update</button>
        <button class="btn-small danger" onclick="deleteOrder(${o.id})">Delete</button>
      </div>
    </div>
  `).join("");
}



// ✅ ฟิลเตอร์
document.getElementById("filterOrder").addEventListener("input", applyFilters);
document.getElementById("filterStatus").addEventListener("change", applyFilters);

function applyFilters() {
  const query = document.getElementById("filterOrder").value.toLowerCase();
  const status = document.getElementById("filterStatus").value.toLowerCase();

  // ✅ เลือกการ์ดทั้งหมดใน grid
  const cards = document.querySelectorAll(".order-card");

  cards.forEach(card => {
    const id = card.querySelector(".order-id")?.innerText.toLowerCase() || "";
    const customer = card.querySelector(".order-customer")?.innerText.toLowerCase() || "";
    const state = card.querySelector(".status-label")?.innerText.toLowerCase() || "";

    const matchQuery = id.includes(query) || customer.includes(query);
    const matchStatus = !status || state.includes(status);

    card.style.display = (matchQuery && matchStatus) ? "" : "none";
  });
}


// ✅ ปุ่มต่าง ๆ
async function viewOrder(id) {
  try {
    const res = await fetch(`../order/detail/${id}`);
    const data = await res.json();

    if (!data.status || !data.data) {
      Swal.fire("❌ Error", "ไม่พบข้อมูลคำสั่งซื้อ", "error");
      return;
    }

    const order = data.data;
    const items = order.items || [];

    // แปลงรายการเกมเป็น HTML
    const itemList = items.map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.title}</td>
        <td>${it.qty}</td>
        <td>${(it.unit_price_cents / 100).toLocaleString()} ฿</td>
        <td>${((it.qty * it.unit_price_cents) / 100).toLocaleString()} ฿</td>
      </tr>
    `).join("");

    const total = (order.total_cents / 100).toLocaleString();

    Swal.fire({
      title: `🧾 รายละเอียดคำสั่งซื้อ #${order.order_no}`,
      html: `
        <div class="showdetill" style="text-align:left">
          <p><b>สถานะ:</b> <span class="status-label ${order.status}">${order.status}</span></p>
          <p><b>วันที่สั่งซื้อ:</b> ${new Date(order.created_at).toLocaleDateString()}</p>
          <p><b>ชื่อลูกค้า:</b> ${order.customer_name || '-'}</p>
          <hr/>
          <table style="width:100%;font-size:0.9rem;text-align:left;border-collapse:collapse">
            <thead>
              <tr style="background:#2a2a2a;color:#fff">
                <th>#</th>
                <th>เกม</th>
                <th>จำนวน</th>
                <th>ราคา/ชิ้น</th>
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>${itemList}</tbody>
          </table>
          <hr/>
          <p style="text-align:right;font-weight:bold;">💰 รวมทั้งหมด: ${total} ฿</p>
        </div>
      `,
      width: 700,
      confirmButtonText: "ปิด",
      background: "#202420",
      color: "#fff"
    });

  } catch (err) {
    console.error("Error loading order detail:", err);
    Swal.fire("❌ Error", "เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
  }
}


function updateStatus(id) {
  const card = document.querySelector(`.order-card button[onclick="updateStatus(${id})"]`)
  const statusLabel = card?.closest(".order-card").querySelector(".status-label");
  if (statusLabel && statusLabel.classList.contains("cancelled")) {
    Swal.fire("⚠️ ไม่สามารถแก้ไขได้", "คำสั่งซื้อนี้ถูกยกเลิกแล้ว", "warning");
    return;
  }
  if (statusLabel && statusLabel.classList.contains("paid")) {
    Swal.fire("⚠️ ไม่สามารถแก้ไขได้", "คำสั่งซื้อนี้ถูกดำเนินการไปแล้ว", "warning");
    return;
  }
  Swal.fire({
    title: "เปลี่ยนสถานะคำสั่งซื้อ",
    input: "select",
    inputOptions: {
      pending: "Pending",
      paid: "Paid",
      cancelled: "Cancelled"
    },
    showCancelButton: true,
    confirmButtonText: "Save"
  }).then(async result => {
    if (result.isConfirmed) {
      const res = await fetch(`/order/update-status/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: result.value })
      });

      const data = await res.json();
      if (!data.status) {
        Swal.fire("⚠️ Error", data.message, "error");
        return;
      }

      Swal.fire("✅ Updated!", "สถานะอัปเดตเรียบร้อย", "success");
      loadOrders();
    }
  });
}


async function deleteOrder(id) {
  const card = document.querySelector(`.order-card button[onclick="deleteOrder(${id})"]`);
  const statusLabel = card?.closest(".order-card").querySelector(".status-label");
  const currentStatus = statusLabel?.innerText.toLowerCase();

  // ❌ ถ้าไม่ใช่ pending → ห้ามลบ
  if (!(currentStatus == "cancelled") ) {
    Swal.fire("⚠️ ไม่สามารถลบได้", "สามารถลบได้เฉพาะคำสั่งซื้อที่เป็น cancelled เท่านั้น", "warning");
    return;
  }

  // ✅ ถ้าเป็น pending → ลบตามปกติ
  const confirm = await Swal.fire({
    title: "ลบคำสั่งซื้อ?",
    text: "การลบนี้ไม่สามารถกู้คืนได้!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#d33"
  });
  if (!confirm.isConfirmed) return;

  const res = await fetch(`/order/delete/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (!data.status) {
    Swal.fire("❌ Error", data.message || "ไม่สามารถลบคำสั่งซื้อนี้ได้", "error");
    return;
  }

  Swal.fire("✅ Deleted!", "คำสั่งซื้อถูกลบเรียบร้อย", "success");
  loadOrders();
}


document.getElementById("btnReload").addEventListener("click", loadOrders);
loadOrders();
