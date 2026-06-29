// ============================================================
//  CART CONTROLLER (ตะกร้าสินค้า)
// ============================================================

//  โหลดรายการในตะกร้า
document.addEventListener("DOMContentLoaded", async () => {
  await loadCartItems();
  setupCheckboxListeners();
});

// ============================================================
//  ดึงข้อมูลจาก API /store/cart
// ============================================================
async function loadCartItems() {
  const container = document.querySelector(".totleCart");
  const header = container.querySelector(".Header");

  try {
    const res = await fetch("/cart/u-cart");
    const result = await res.json();

    container.innerHTML = "";
    container.appendChild(header);

    if (!result.status || !result.data || result.data.length === 0) {
      container.innerHTML += `<div class="empty">Your cart is empty </div>`;
      document.getElementById("showsum").innerText = 0;
      return;
    }

    result.data.forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("cartItem");
      div.dataset.gameId = item.game_id;
      console.log(item)
      div.innerHTML = `
  <div class="checkbox-wrapper-2">
    <label class="custom-checkbox">
      <input type="checkbox" class="item-check" checked>
      <span class="checkmark"></span>
    </label>
    <div class="poto">
      <img src="${item.image_poster || '/images/default-cover.jpg'}" alt="">
    </div>
    ${item.title}
  </div>
  <div class="drtail" data-stock="${item.stock_managed}">
    <div class="cost" price="${item.price}">${parseFloat(item.price).toLocaleString('en-US')}</div>
    <div class="amount">
      <div class="quantity-field">
        <button class="value-button decrease-button" onclick="decreaseValue(this)" title="ลดจำนวน">-</button>
        <div class="number">${item.qty}</div>
        <button class="value-button increase-button" onclick="increaseValue(this)" title="เพิ่มจำนวน">+</button>
      </div>
    </div>
  </div>
`;

      container.appendChild(div);
    });

    updateTotal();
  } catch (err) {
    console.error("Error loading cart:", err);
    container.innerHTML = `<div class="empty"> Failed to load cart</div>`;
  }
}

// ============================================================
//  เพิ่มจำนวน
// ============================================================
async function increaseValue(button) {
  const numberInput = button.parentElement.querySelector('.number');
  let value = parseInt(numberInput.innerHTML, 10);
  if (isNaN(value)) value = 0;

  //  ดึง stock จาก data attribute
  const stock = parseInt(
    button.closest('.drtail').getAttribute('data-stock'),
    10
  );

  if (value >= stock) {
    Swal.fire({
      icon: "warning",
      title: "ถึงจำนวนสูงสุดแล้ว!",
      text: `สินค้านี้มีในสต็อกเพียง ${stock} ชิ้น`,
      timer: 1500,
      showConfirmButton: false,
    });
    return; //  หยุด ไม่เพิ่มเกิน stock
  }

  value++;
  numberInput.innerHTML = value;
  updateTotal();

  const cartItem = button.closest(".cartItem");
  const game_id = cartItem.dataset.gameId;
  await updateCartQty(game_id, value);
}


// ============================================================
//  ลดจำนวน
// ============================================================
async function decreaseValue(button) {
  const numberInput = button.parentElement.querySelector('.number');
  let value = parseInt(numberInput.innerHTML, 10);
  if (isNaN(value)) value = 1;

  value--; // ลดจำนวนลง 1

  const cartItem = button.closest('.cartItem');
  const game_id = cartItem.dataset.gameId;

  if (value <= 0) {
    const confirmRemove = confirm("ต้องการลบสินค้านี้ออกจากตะกร้าหรือไม่?");
    if (confirmRemove) {
      await removeFromCart(game_id);
      cartItem.remove();
      updateTotal();
    } else {
      numberInput.innerHTML = 1;
    }
    return;
  }

  numberInput.innerHTML = value;
  updateTotal();
  await updateCartQty(game_id, value);
}

// ============================================================
//  อัปเดตจำนวนในฐานข้อมูล
// ============================================================
async function updateCartQty(game_id, quantity) {
  try {
    await fetch("/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id, quantity })
    });
  } catch (err) {
    console.error("Error updating cart quantity:", err);
  }
}

// ============================================================
// ️ ลบสินค้าออกจากตะกร้า
// ============================================================
async function removeFromCart(game_id) {
  try {
    const res = await fetch("/cart/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game_id })
    });
    const data = await res.json();

    if (data.status) {
      Swal.fire({
        icon: "success",
        title: "Removed",
        text: "Item removed from cart.",
        timer: 1000,
        showConfirmButton: false
      });
    } else {
      Swal.fire("Error", data.message || "Failed to remove item", "error");
    }
  } catch (err) {
    console.error("Error removing item:", err);
  }
}

// ============================================================
//  อัปเดตราคารวม
// ============================================================
function updateTotal() {
  let total = 0;
  const items = document.querySelectorAll('.cartItem');
  items.forEach(item => {
    const checkbox = item.querySelector('.item-check');
    if (checkbox && checkbox.checked) {
      const price = parseFloat(item.querySelector('.cost').getAttribute("price")) || 0;
      const qty = parseInt(item.querySelector('.number').innerHTML, 10) || 1;
      total += price * qty;
    }
  });
  document.getElementById('showsum').innerText = (total).toLocaleString('en-US');
}

// ============================================================
//  Checkbox เลือกทั้งหมด
// ============================================================
function setupCheckboxListeners() {
  const selectAllCheck = document.getElementById('selectAllCheck');
  if (selectAllCheck) {
    selectAllCheck.addEventListener('change', function () {
      const checked = this.checked;
      document.querySelectorAll('.item-check').forEach(cb => cb.checked = checked);
      updateTotal();
    });
  }

  document.addEventListener('change', e => {
    if (e.target.classList.contains('item-check')) updateTotal();
  });
}

// ============================================================
// ️ ปุ่ม Buy (สร้างออเดอร์)
// ============================================================
// ช่วยจัดรูปแบบเงิน
const formatMoney = (n) => (parseFloat(n || 0)).toFixed(2);

// ดึงชื่อเกมจาก DOM (พยายามอ่านจาก data-title ก่อน)
function getCartItemTitle(itemEl) {
  if (itemEl.dataset.title) return itemEl.dataset.title;
  const wrap = itemEl.querySelector('.checkbox-wrapper-2');
  if (!wrap) return 'Unknown Game';
  // พยายามหยิบ text node ท้ายๆ ที่เป็นชื่อเกม
  const nodes = Array.from(wrap.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
  const lastText = nodes.pop()?.textContent?.trim();
  return (lastText && lastText.length > 0) ? lastText : wrap.textContent.trim();
}

document.addEventListener("click", async (e) => {
  if (e.target && e.target.closest(".footer button")) {
    try {
      // 1) ตรวจ login
      const sessionRes = await fetch("/account/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const sessionData = await sessionRes.json();
      if (!sessionData.loggedIn) {
        Swal.fire({
          icon: "warning",
          title: "กรุณาเข้าสู่ระบบก่อนสั่งซื้อ ",
          text: "คุณต้องเข้าสู่ระบบเพื่อดำเนินการต่อ",
          confirmButtonText: "เข้าสู่ระบบ",
          cancelButtonText: "ยกเลิก",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          background: "#1e1e1e",
          color: "#fff",
        }).then((r) => { if (r.isConfirmed) window.location.href = "/account"; });
        return;
      }

      // 2) รวบรวมเฉพาะสินค้าที่ติ๊ก
      const selectedEls = Array.from(document.querySelectorAll(".cartItem"))
        .filter((el) => el.querySelector(".item-check")?.checked);

      if (selectedEls.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ยังไม่ได้เลือกสินค้า!",
          text: "กรุณาเลือกสินค้าที่ต้องการสั่งซื้อก่อน",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      // รวมข้อมูลรายการเพื่อแสดงยืนยัน
      const selectedView = selectedEls.map((el) => {
        const game_id = parseInt(el.dataset.gameId, 10);
        const title = getCartItemTitle(el);
        const price = parseFloat(el.querySelector(".cost")?.getAttribute("price") || "0");
        const qty = parseInt(el.querySelector(".number")?.innerText || "1", 10);
        const sub = price * qty;
        return { game_id, title, price, qty, sub };
      });

      const total = selectedView.reduce((s, it) => s + it.sub, 0);

      // 3) หน้าสรุป/ยืนยันออเดอร์ (ก่อนสร้างออเดอร์จริง)
      const summaryHTML = `
        <div style="max-height:50vh;overflow:auto;text-align:left">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="text-align:left;padding:6px 4px;border-bottom:1px solid #333">สินค้า</th>
                <th style="text-align:right;padding:6px 4px;border-bottom:1px solid #333">ราคา</th>
                <th style="text-align:right;padding:6px 4px;border-bottom:1px solid #333">จำนวน</th>
                <th style="text-align:right;padding:6px 4px;border-bottom:1px solid #333">รวม</th>
              </tr>
            </thead>
            <tbody>
              ${selectedView.map(it => `
                <tr>
                  <td style="padding:6px 4px">${it.title}</td>
                  <td style="padding:6px 4px;text-align:right">${formatMoney(it.price)}</td>
                  <td style="padding:6px 4px;text-align:right">${it.qty}</td>
                  <td style="padding:6px 4px;text-align:right">${formatMoney(it.sub)}</td>
                </tr>
              `).join("")}
              <tr>
                <td colspan="3" style="padding:10px 4px;text-align:right;border-top:1px solid #333"><b>TOTAL</b></td>
                <td style="padding:10px 4px;text-align:right;border-top:1px solid #333"><b>${formatMoney(total)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      const confirm = await Swal.fire({
        title: "ยืนยันคำสั่งซื้อ",
        html: summaryHTML,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ยืนยันคำสั่งซื้อ",
        cancelButtonText: "ตรวจแก้ตะกร้า",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        background: "#1e1e1e",
        color: "#fff",
        width: 700
      });

      if (!confirm.isConfirmed) return; // ผู้ใช้กดยกเลิกเพื่อกลับไปแก้

      // 4) สร้างออเดอร์ (pending) หลังยืนยันแล้วเท่านั้น
      const payload = selectedView.map(({ game_id, qty }) => ({ game_id, qty }));
      const res = await fetch("/order/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
      });
      const data = await res.json();
      if (!data.status) throw new Error(data.message || "Failed to create order");

      // 5) เลือกวิธีชำระเงิน (จ่ายตอนนี้/ภายหลัง)
      Swal.fire({
        title: "เลือกวิธีชำระเงิน ",
        text: `Order #${data.order_no} — ยอดรวม ${data.total} บาท`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "สแกน QR เพื่อชำระตอนนี้",
        cancelButtonText: "ชำระภายหลัง",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#6c757d",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // 6) แสดง QR ปลอม + ปุ่มยืนยันการชำระเงิน
          const qrHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <img src="/images/fake-qr.png" alt="Fake QR" style="width:200px;height:200px;border-radius:10px;margin-bottom:1rem;">
              <p>โปรดสแกน QR เพื่อจำลองการชำระเงิน</p>
            </div>
          `;

          Swal.fire({
            title: "จำลองการชำระเงิน",
            html: qrHTML,
            showCancelButton: true,
            confirmButtonText: "ยืนยันการชำระเงิน",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#28a745",
            background: "#1e1e1e",
            color: "#fff",
            preConfirm: async () => {
              const payRes = await fetch("/order/payment/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: data.order_id }),
              });
              const payData = await payRes.json();
              if (!payData.status) throw new Error(payData.message || "Payment failed");
              return payData;
            },
          })
            .then((payResult) => {
              if (payResult.isConfirmed) {
                Swal.fire({
                  icon: "success",
                  title: "ชำระเงินสำเร็จ ",
                  text: "ระบบได้เพิ่มเกมของคุณเข้าสู่ Library แล้ว",
                  confirmButtonColor: "#3085d6",
                }).then(() => (location.href = "/account/libery-oder")); // หรือ "/history" ตามที่คุณต้องการ
              }
            })
            .catch((err) => {
              Swal.fire("Error", err.message || "เกิดข้อผิดพลาด", "error");
            });

        } else {
          // ชำระภายหลัง
          Swal.fire({
            icon: "info",
            title: "เก็บไว้ก่อน ",
            text: "คุณสามารถกลับมาชำระภายหลังได้ในหน้าประวัติคำสั่งซื้อ",
            confirmButtonColor: "#3085d6",
          }).then(() => (location.href = "."));
        }
      });

    } catch (err) {
      console.error("Error during checkout:", err);
      Swal.fire("Error", err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้", "error");
    }
  }
});



