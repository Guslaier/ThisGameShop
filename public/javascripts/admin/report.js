// ============================================================
// 📊 Order Report Table (Report Page)
// ============================================================

const orderTableBody = document.querySelector("#orderTable tbody");
const totalDisplay = document.getElementById("totalRevenueDisplay");

let allOrders = []; // store all fetched orders for filtering

async function loadOrders() {
  try {
    const res = await fetch("/order/all");
    const data = await res.json();
    console.log("📦 Orders:", data);

    if (!data.status || !data.data?.length) {
      orderTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding:1rem; color:#aaa;">
            ❌ No orders found
          </td>
        </tr>`;
      totalDisplay.textContent = "฿ 0.00";
      document.getElementById("totalOrders").textContent = `0 Orders`;
      document.getElementById("totalAmount").textContent = `฿ 0`;
      return;
    }

    allOrders = data.data;
    renderOrders(allOrders);
    updateSummary(allOrders);
    populateYearDropdown(allOrders);
  } catch (err) {
    console.error("❌ Error loading orders:", err);
    Swal.fire("Error", "Failed to load order data", "error");
  }
}

// ============================================================
// 🧾 Render Orders into Table
// ============================================================
function renderOrders(orders) {
  let total = 0;

  orderTableBody.innerHTML = orders.map((o, i) => {
    const orderNo = o.order_no || o.id || `#${i + 1}`;
    const customer = o.customer_name || "-";
    const date = new Date(o.paid_at || o.created_at).toLocaleDateString("en-EN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    const cost = (o.total_cents ? o.total_cents / 100 : o.total_cost || 0);
    total += cost;

    return `
      <tr>
        <td>${orderNo}</td>
        <td>${date}</td>
        <td>${customer}</td>
        <td>฿ ${cost.toLocaleString()}</td>
      </tr>
    `;
  }).join("");

  totalDisplay.textContent = `฿ ${total.toLocaleString()}`;
}

// ============================================================
// 🧮 Update KPI Cards
// ============================================================
function updateSummary(orders) {
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

  document.getElementById("totalOrders").textContent = `${totalOrders} Orders`;
  document.getElementById("totalAmount").textContent = `฿ ${totalAmount.toLocaleString()}`;
  totalDisplay.textContent = `฿ ${totalAmount.toLocaleString()}`;
}

// ============================================================
// 📅 Filter by Month & Year
// ============================================================
function applyFilter() {
  const month = document.getElementById("filterMonth").value;
  const year = document.getElementById("filterYear").value;

  const filtered = allOrders.filter(o => {
    const d = new Date(o.paid_at || o.created_at);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    return (!month || m == month) && (!year || y == year);
  });

  renderOrders(filtered);
  updateSummary(filtered);
}

// ============================================================
// 🧾 Populate Year Dropdown
// ============================================================
function populateYearDropdown(orders) {
  const yearSelect = document.getElementById("filterYear");
  const years = [...new Set(orders.map(o => new Date(o.paid_at || o.created_at).getFullYear()))]
    .sort((a, b) => b - a);

  yearSelect.innerHTML = `<option value="">All</option>` +
    years.map(y => `<option value="${y}">${y}</option>`).join("");
}

// ============================================================
// 🎯 Filter Buttons
// ============================================================
document.getElementById("btnFilter").addEventListener("click", applyFilter);
document.getElementById("btnClear").addEventListener("click", () => {
  document.getElementById("filterMonth").value = "";
  document.getElementById("filterYear").value = "";
  renderOrders(allOrders);
  updateSummary(allOrders);
});

// ============================================================
// 📤 Export CSV
// ============================================================
function exportCSV() {
  const rows = [["Order ID", "Date", "Customer Name", "Cost (฿)"]];
  let total = 0;

  // ✅ Loop through table rows and collect data
  document.querySelectorAll("#orderTable tbody tr").forEach(tr => {
    const cols = Array.from(tr.querySelectorAll("td")).map(td => {
      const txt = td.innerText.replace(/"/g, '""'); // escape quotes
      return `"${txt}"`;
    });

    // extract cost as number (remove non-digits)
    const costText = tr.querySelector("td:last-child")?.innerText.replace(/[^\d.]/g, "") || "0";
    total += parseFloat(costText) || 0;

    rows.push(cols);
  });

  // ✅ Add Total Revenue row
  rows.push(["", "", `"💰 Total Revenue"`, `"฿ ${total.toLocaleString()}"`]);

  // ✅ Join into CSV text
  const csv = rows.map(r => r.join(",")).join("\n");

  // ✅ Add UTF-8 BOM (for Excel Thai text)
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `order_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}
s

// ============================================================
// 🔄 Initialize
// ============================================================
document.addEventListener("DOMContentLoaded", loadOrders);
