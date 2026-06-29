
(() => {
  // =========================================
  // CONFIG: กำหนดเส้นทาง API ไว้ที่เดียว
  // =========================================
  const ENDPOINTS = {
    libraryList : '/lib/api/library',              // GET
    ordersList  : '/order/my',                     // GET
    orderDetail : (id) => `/order/detail/${id}`,   // GET
    payConfirm  : '/order/payment/confirm',        // POST
    cancelOrder : (id) => `/order/cancel/${id}`,   // PATCH
  };

  // =========================================
  // UTILS
  // =========================================
  const fmtTHB  = (n) => new Intl.NumberFormat('th-TH', { style:'currency', currency:'THB' }).format(Number(n || 0));
  const fmtDate = (d) => new Date(d).toLocaleString('th-TH');
  const safeNum = (v) => (v == null ? 0 : Number(v));
  const badge   = (txt, kind='') => {
    const map = { paid:'ok', pending:'warn', cancelled:'err' };
    kind = map[kind] || kind;
    return `<span class="badge ${kind}">${txt}</span>`;
  };

  // =========================================
  // TABS
  // =========================================
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.section').forEach(s => {
        s.classList.toggle('active', s.id === btn.dataset.tab);
      });
    });
  });

  // =========================================
  // SWEETALERT HELPERS
  // =========================================
  const swalConfirm = async (title, text, confirmText='ยืนยัน') => {
    const { isConfirmed } = await Swal.fire({
      title, text, icon:'question',
      showCancelButton:true,
      confirmButtonText:confirmText,
      cancelButtonText:'ยกเลิก',
      reverseButtons:true
    });
    return isConfirmed;
  };

  const swalToast = (title, icon='success') => {
    return Swal.fire({
      toast:true, position:'top-end', timer:2200, showConfirmButton:false,
      icon, title
    });
  };

  // =========================================
  // HTML BUILDER: รายละเอียดออเดอร์ (ตาราง)
  // =========================================
  function buildOrderDetailHTML(order) {
    const total = typeof order.total_cents === 'number' ? order.total_cents / 100 : safeNum(order.total);
    const items = Array.isArray(order.items) ? order.items : [];

    const rows = items.map((it, i) => {
      const qty = safeNum(it.qty);
      const unit = (typeof it.unit_price_cents === 'number') ? it.unit_price_cents / 100 : safeNum(it.unit_price);
      const line = qty * unit;
      return `
        <tr>
          <td style="padding:6px 8px;">${i+1}</td>
          <td style="padding:6px 8px;min-width:180px">${it.title || it.name || '-'}</td>
          <td style="padding:6px 8px;text-align:right">${qty}</td>
          <td style="padding:6px 8px;text-align:right">${fmtTHB(unit)}</td>
          <td style="padding:6px 8px;text-align:right">${fmtTHB(line)}</td>
        </tr>
      `;
    }).join('');

    const table = items.length ? `
      <div style="margin:.5rem 0 0">
        <table style="width:100%;border-collapse:collapse;font-size:.95rem">
          <thead>
            <tr style="background:rgba(0,0,0,.06)">
              <th style="padding:6px 8px;text-align:left">#</th>
              <th style="padding:6px 8px;text-align:left">รายการ</th>
              <th style="padding:6px 8px;text-align:right">จำนวน</th>
              <th style="padding:6px 8px;text-align:right">ราคาต่อหน่วย</th>
              <th style="padding:6px 8px;text-align:right">รวม</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    ` : `<div style="opacity:.7">ไม่มีรายการสินค้าในออเดอร์นี้</div>`;

    return `
      <div style="text-align:left">
        ${table}
        <div style="margin-top:.5rem;text-align:right;font-weight:700">ยอดสุทธิ: ${fmtTHB(total)}</div>
      </div>
    `;
  }

  // =========================================
  // LOADERS
  // =========================================
  async function loadLibrary() {
    const tbody = document.getElementById('libTbody');
    tbody.innerHTML = '<tr><td colspan="5" class="empty">กำลังโหลด...</td></tr>';
    try {
      const res  = await fetch(ENDPOINTS.libraryList, { headers:{ Accept:'application/json' } });
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty">ยังไม่มีเกมใน Library</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map((x, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${x.title}</td>
          <td>${x.platform_flags}</td>
          <td><span class="key-box">${x.cd_key}</span></td>
          <td>${fmtDate(x.acquired_at)}</td>
        </tr>
      `).join('');
    } catch {
      tbody.innerHTML = '<tr><td colspan="5" class="empty" style="color:red">โหลดไม่สำเร็จ</td></tr>';
    }
  }

  async function loadOrders() {
    const tbody = document.getElementById('ordersTbody');
    tbody.innerHTML = '<tr><td colspan="6" class="empty">กำลังโหลด...</td></tr>';
    try {
      const res  = await fetch(ENDPOINTS.ordersList, { headers:{ Accept:'application/json' } });
      const json = await res.json();
      const rows = Array.isArray(json?.data) ? json.data : [];
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty">ยังไม่มีออเดอร์</td></tr>';
        return;
      }
      tbody.innerHTML = rows.map((o, i) => {
        const st = (o.status || '').toLowerCase();
        const isPending = st === 'pending';
        const isPaid    = st === 'paid';
        const isCancel  = st === 'cancelled';
        const statusEl  = isPaid   ? badge('ชำระแล้ว', 'paid')
                        : isPending? badge('รอชำระ',  'pending')
                        : isCancel ? badge('ยกเลิก',   'cancelled')
                        : o.status;

        const payBtn    = isPending ? `<button class="btn primary act-pay"    data-id="${o.id}" data-total="${o.total}">ชำระเงิน</button>` : '';
        const cancelBtn = isPending ? `<button class="btn danger   act-cancel" data-id="${o.id}">ยกเลิก</button>` : '';

        return `
          <tr data-id="${o.id}">
            <td>${i+1}</td>
            <td><a href="#" class="order-link" data-id="${o.id}">${o.order_no}</a></td>
            <td>${fmtTHB(o.total)}</td>
            <td>${statusEl}</td>
            <td>${o.created_at}</td>
            <td><div class="actions">${payBtn}${cancelBtn}</div></td>
          </tr>
        `;
      }).join('');
    } catch {
      tbody.innerHTML = '<tr><td colspan="6" class="empty" style="color:red">โหลดไม่สำเร็จ</td></tr>';
    }
  }

  // =========================================
  // ACTIONS: ชำระเงิน
  // =========================================
  async function payOrder(id) {
    try {
      // 1) ดึงรายละเอียดออเดอร์
      const detRes  = await fetch(ENDPOINTS.orderDetail(id), { headers:{ Accept:'application/json' }});
      const detData = await detRes.json();
      if (!detRes.ok || !detData.status) throw new Error(detData.message || 'ไม่พบข้อมูลออเดอร์');

      const o       = detData.data;
      const total   = typeof o.total_cents === 'number' ? o.total_cents / 100 : safeNum(o.total);
      const orderNo = o.order_no || o.number || id;
      const detailHTML = buildOrderDetailHTML(o);

      // 2) เลือกวิธีชำระ + โชว์รายละเอียด
      const { isConfirmed } = await Swal.fire({
        title: 'เลือกวิธีชำระเงิน ',
        html: `
          <div style="text-align:left">
            <div style="margin-bottom:.5rem"><b>Order #${orderNo}</b></div>
            ${detailHTML}
          </div>
        `,
        icon:'info',
        width:720,
        showCancelButton:true,
        confirmButtonText:'สแกน QR เพื่อชำระตอนนี้',
        cancelButtonText:'ชำระภายหลัง',
        confirmButtonColor:'#28a745',
        cancelButtonColor:'#6c757d',
        reverseButtons:true,
      });
      if (!isConfirmed) {
        await Swal.fire({ icon:'info', title:'เก็บไว้ก่อน ', text:'คุณสามารถกลับมาชำระภายหลังได้ในหน้าประวัติคำสั่งซื้อ', confirmButtonColor:'#3085d6' });
        return;
      }

      // 3) ยอด 0 บาท → ยืนยันทันที
      if (Number(total) === 0) {
        const confirm0 = await Swal.fire({
          title: 'ยืนยันการชำระเงิน (0 บาท)',
          html: `
            <div style="text-align:left">
              <div style="margin-bottom:.5rem"><b>Order #${orderNo}</b></div>
              ${detailHTML}
            </div>
          `,
          icon:'question',
          width:720,
          showCancelButton:true,
          confirmButtonText:'ยืนยันการชำระเงิน',
          cancelButtonText:'ยกเลิก',
          confirmButtonColor:'#28a745',
          reverseButtons:true,
          preConfirm: async () => {
            const payRes  = await fetch(ENDPOINTS.payConfirm, {
              method:'POST',
              headers:{ 'Content-Type':'application/json' },
              body:JSON.stringify({ order_id:id })
            });
            const payData = await payRes.json().catch(()=> ({}));
            if (!payRes.ok || !payData.status) throw new Error(payData.message || 'Payment failed');
            return payData;
          },
          allowOutsideClick: () => !Swal.isLoading(),
        
        });

        if (confirm0.isConfirmed) {
          await Swal.fire({ icon:'success', title:'ชำระเงินสำเร็จ ', text:'ระบบได้เพิ่มเกมของคุณเข้าสู่ Library แล้ว', confirmButtonColor:'#3085d6' });
          loadOrders(); loadLibrary();
        }
        return;
      }

      // 4) มียอด → แสดง QR + ยืนยัน
      const qrHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:1rem">
          <img src="/images/fake-qr.png" alt="Fake QR" style="width:220px;height:220px;border-radius:12px;margin-bottom:1rem;box-shadow:0 6px 24px rgba(0,0,0,.15);" />
          <p style="margin:0 0 .25rem;">โปรดสแกน QR เพื่อจำลองการชำระเงิน</p>
          <small style="opacity:.75;">Order #${orderNo} • ${fmtTHB(total)}</small>
        </div>
        ${detailHTML}
      `;

      const payModal = await Swal.fire({
        title:'จำลองการชำระเงิน',
        html:qrHTML,
        width:720,
        showCancelButton:true,
        confirmButtonText:'ยืนยันการชำระเงิน',
        cancelButtonText:'ยกเลิก',
        confirmButtonColor:'#28a745',
        background:'#1e1e1e',
        color:'#fff',
        reverseButtons:true,
        preConfirm: async () => {
          const payRes  = await fetch(ENDPOINTS.payConfirm, {
            method:'POST',
            headers:{ 'Content-Type':'application/json' },
            body:JSON.stringify({ order_id:id })
          });
          const payData = await payRes.json().catch(()=> ({}));
          if (!payRes.ok || !payData.status) throw new Error(payData.message || 'Payment failed');
          return payData;
        },
        allowOutsideClick: () => !Swal.isLoading(),
      });

      if (payModal.isConfirmed) {
        await Swal.fire({ icon:'success', title:'ชำระเงินสำเร็จ ', text:'ระบบได้เพิ่มเกมของคุณเข้าสู่ Library แล้ว', confirmButtonColor:'#3085d6' });
        loadOrders(); loadLibrary();
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'เกิดข้อผิดพลาด', 'error');
    }
  }

  // =========================================
  // ACTIONS: ยกเลิกออเดอร์
  // =========================================
  async function cancelOrder(id) {
    try {
      const ok = await swalConfirm('ยกเลิกออเดอร์', 'ต้องการยกเลิกออเดอร์นี้หรือไม่?', 'ยกเลิกออเดอร์');
      if (!ok) return;

      const res  = await fetch(ENDPOINTS.cancelOrder(id), { method:'PATCH', headers:{ Accept:'application/json' }});
      const data = await res.json().catch(()=> ({}));
      if (res.ok && data.status) {
        await swalToast('ยกเลิกสำเร็จ ', 'success');
        loadOrders();
      } else {
        Swal.fire('ยกเลิกไม่สำเร็จ', data.message || 'โปรดลองอีกครั้ง', 'error');
      }
    } catch {
      Swal.fire('ผิดพลาด', 'ไม่สามารถทำรายการได้', 'error');
    }
  }

  // =========================================
  // ORDER DETAIL (เปิดจากการคลิกเลขออเดอร์)
  // =========================================
  async function showOrderDetail(id) {
    try {
      const res  = await fetch(ENDPOINTS.orderDetail(id), { headers:{ Accept:'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || 'ไม่พบข้อมูลออเดอร์');

      const order = data.data;
      const total = typeof order.total_cents === 'number' ? order.total_cents / 100 : Number(order.total || 0);
      const items = order.items || [];

      const rows = items.map((it, i) => `
        <tr>
          <td style="padding:4px 8px;">${i+1}</td>
          <td style="padding:4px 8px;">${it.title || '-'}</td>
          <td style="padding:4px 8px;text-align:right;">${it.qty}</td>
          <td style="padding:4px 8px;text-align:right;">${fmtTHB(it.unit_price_cents ? it.unit_price_cents/100 : it.unit_price)}</td>
          <td style="padding:4px 8px;text-align:right;">${fmtTHB((it.qty) * (it.unit_price_cents ? it.unit_price_cents/100 : it.unit_price))}</td>
        </tr>
      `).join('');

      const html = `
        <div style="text-align:left;">
          <p><b>หมายเลขออเดอร์:</b> ${order.order_no || order.id}</p>
          <p><b>สถานะ:</b> ${order.status}</p>
          <p><b>วันที่สั่งซื้อ:</b> ${order.created_at || '-'}</p>
          <hr>
          <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
            <thead>
              <tr style="background:#f4f4f4;">
                <th style="padding:4px 8px;text-align:left;">#</th>
                <th style="padding:4px 8px;text-align:left;">ชื่อเกม</th>
                <th style="padding:4px 8px;text-align:right;">จำนวน</th>
                <th style="padding:4px 8px;text-align:right;">ราคาต่อหน่วย</th>
                <th style="padding:4px 8px;text-align:right;">รวม</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <hr>
          <div style="text-align:right;font-weight:bold;">ยอดสุทธิ: ${fmtTHB(total)}</div>
        </div>
      `;

      await Swal.fire({
        title:'รายละเอียดคำสั่งซื้อ ',
        html, width:720, icon:'info',
        confirmButtonText:'ปิด', confirmButtonColor:'#3085d6'
      });
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', err.message || 'ไม่สามารถโหลดข้อมูลออเดอร์ได้', 'error');
    }
  }

  // =========================================
  // EVENT DELEGATION
  // =========================================
  document.addEventListener('click', (e) => {
    const pay       = e.target.closest('.act-pay');
    const cancelBtn = e.target.closest('.act-cancel');
    const orderLink = e.target.closest('.order-link');

    if (pay)       payOrder(pay.dataset.id);
    if (cancelBtn) cancelOrder(cancelBtn.dataset.id);
    if (orderLink) { e.preventDefault(); showOrderDetail(orderLink.dataset.id); }
  });

  // =========================================
  // INIT
  // =========================================
  loadLibrary();
  loadOrders();
})();

