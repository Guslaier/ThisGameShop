/* ========= Utility helpers ========= */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("❌ Fetch error:", url, err);
    return null;
  }
}
function toTHB(cents) {
  return cents ? (cents / 100).toLocaleString("en-US") : "0";
}
function ym(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* ========= Load KPI cards ========= */
async function loadKPIs() {
  const [usersRes, gamesRes, purchasesRes] = await Promise.all([
    fetchJSON("/ad-m/api/users"),
    fetchJSON("/ad-m/api/games"),
    fetchJSON("/ad-m/stats/purchases")
  ]);

  // 🧮 Users
  const usersCount = usersRes?.data?.length ?? 0;
  document.getElementById("usersCount").textContent = usersCount;

  // 🧮 Games
  const games = gamesRes?.data ?? [];
  const stockCount = games.length;
  const lowStock = games.filter(g => (parseInt(g.stock_managed ?? 0) || 0) <= 5).length;
  document.getElementById("stockCount").textContent = stockCount;
  document.getElementById("lowStock").textContent = lowStock;

  // 🧮 Orders / Revenue
  const tOrders = purchasesRes?.data?.total_orders ?? 0;
  const tAmount = purchasesRes?.data?.total_amount ?? 0;
  document.getElementById("totalOrders").textContent = `${tOrders} Orders`;
  document.getElementById("totalAmount").textContent = `฿ ${toTHB(tAmount)}`;

  return { games };
}

/* ========= Fill Game Table ========= */
async function loadOrders() {
  try {
    const res = await fetch("../order/all");
    const data = await res.json();
    if (!data.status) throw new Error(data.message || "Failed to load");

    renderTable(data.data);
  } catch (err) {
    console.error("❌ Error loading orders:", err);
    document.querySelector("#orderTable tbody").innerHTML = `
      <tr><td colspan="8" style="text-align:center;color:red;">Load error</td></tr>`;
  }
}

function renderTable(list) {
  const tbody = document.querySelector("#orderTable tbody");
  tbody.innerHTML = "";
  list.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${o.customer_id || '-'}</td>
        <td>${o.customer_name || '-'}</td>
        <td>${new Date(o.created_at).toLocaleDateString("en-GB")}</td>
        <td>${o.game_title || '-'}</td>
        <td>${o.platform_flags || '-'}</td>
        <td>${o.order_no || o.id}</td>
        <td>฿ ${(o.total_cents/100).toLocaleString()}</td>
        <td class="status ${o.status?.toLowerCase() || 'pending'}"><span class="dot"></span>${o.status}</td>
        <td>${o.payment_status || '-'}</td>`;
    tbody.appendChild(tr);
  });
}

function filterTable() {
  const search = document.getElementById("search").value.toLowerCase();
  const status = document.getElementById("status").value;
  const platform = document.getElementById("platform").value;

  const rows = document.querySelectorAll("#orderTable tbody tr");
  rows.forEach(row => {
    const name = row.children[0].innerText.toLowerCase();
    const orderId = row.children[4].innerText.toLowerCase();
    const stat = row.children[6].innerText;
    const plat = row.children[3].innerText;
    const matchSearch = !search || name.includes(search) || orderId.includes(search);
    const matchStatus = !status || stat === status;
    const matchPlatform = !platform || plat === platform;
    row.style.display = matchSearch && matchStatus && matchPlatform ? "" : "none";
  });
}

loadOrders();

/* ========= Charts from real orders ========= */
async function loadCharts() {
  const ordersRes = await fetchJSON("../order/all");
  const orders = ordersRes?.status ? ordersRes.data : [];

  // 🧮 Monthly revenue
  const monthly = new Map();
  orders.forEach(o => {
    const key = ym(o.created_at);
    monthly.set(key, (monthly.get(key) ?? 0) + (o.total_cents || 0));
  });
  const labels = Array.from(monthly.keys()).sort();
  const revenue = labels.map(k => (monthly.get(k) || 0) / 100);

  // 🧮 Platform share
  const platformMap = new Map();
  orders.forEach(o => {
    const p = o.platform || o.platform_flags || "Unknown";
    platformMap.set(p, (platformMap.get(p) ?? 0) + 1);
  });
  const platLabels = Array.from(platformMap.keys());
  const platData = platLabels.map(k => platformMap.get(k));

  // 📈 Draw charts
  new Chart(document.getElementById("salesChart"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue (฿)",
        data: revenue,
        borderColor: "#00ff80",
        backgroundColor: "rgba(0,255,128,0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      plugins:{legend:{labels:{color:"whitesmoke"}}},
      scales:{
        x:{ticks:{color:"white"},grid:{color:"rgba(255,255,255,0.1)"}},
        y:{ticks:{color:"white"},grid:{color:"rgba(255,255,255,0.1)"}}
      }
    }
  });
}

/* ========= Export CSV ========= */
function exportCSV() {
  const rows = [["Customer","Date","Game","Platform","Order ID","Cost","Status","Payment"]];
  document.querySelectorAll("#orderTable tbody tr").forEach(tr=>{
    const cols = Array.from(tr.querySelectorAll("td")).map(td=>td.innerText);
    rows.push(cols);
  });
  const csv = rows.map(r=>r.join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "orders-report.csv";
  link.click();
}
/* ========= Init ========= */
document.addEventListener("DOMContentLoaded", async () => {
  const { games } = await loadKPIs();
  await loadGamesTable(games);
  await loadCharts();
});
