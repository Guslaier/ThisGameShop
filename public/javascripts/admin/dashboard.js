document.addEventListener("DOMContentLoaded", async () => {
  async function fetchJSON(url) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Fetch error:", err);
      return null;
    }
  }

  // โหลดสรุป Dashboard
  const usersRes = await fetchJSON("/ad-m/api/users");
  document.getElementById("usersCount").innerText = usersRes?.data?.length ?? 0;

  const gamesRes = await fetchJSON("/ad-m/api/games");
  document.getElementById("stockCount").innerText = gamesRes?.data?.length ?? 0;


  fetch('/ad-m/stats/purchases')
    .then(res => res.json())
    .then(data => {
      console.log(data.data)
      document.getElementById('totalOrders').textContent = `${data.data.total_orders} Orders`;
      document.getElementById('totalAmount').textContent = `฿ ${(data.data.total_amount / 100).toLocaleString('en-US')}`;
    });
  // โหลดตาราง Games
  async function loadGames() {
    const tableBody = document.querySelector("#gameTable tbody");
    tableBody.innerHTML = `<tr><td colspan="5">⏳ กำลังโหลดข้อมูล...</td></tr>`;

    const result = await fetchJSON("/ad-m/api/games");
    if (!result?.status) {
      tableBody.innerHTML = `<tr><td colspan="5">❌ โหลดข้อมูลเกมไม่สำเร็จ</td></tr>`;
      return;
    }

    // ✅ เรียงจาก id มาก → น้อย
    const sortedGames = result.data.sort((a, b) => b.id - a.id);

    tableBody.innerHTML = "";
    sortedGames.forEach((game) => {
      // ✅ ตรวจสอบสถานะของเกม
      let statusText = "";
      let statusColor = "";

      if (game.deleted_at) {
        statusText = "❌ ถูกลบ";
        statusColor = "red";
      } else if (game.stock_managed > 0) {
        statusText = "🟢 มีในสต็อก";
        statusColor = "green";
      } else {
        statusText = "⚠️ หมดสต็อก";
        statusColor = "orange";
      }

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${game.id}</td>
        <td>${game.title}</td>
        <td>${game.platform_flags || "-"}</td>
        <td>${game.stock_managed ?? "-"}</td>
        <td>
          <span style="color:${statusColor};font-weight:600;">${statusText}</span>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  loadGames();

  // ✅ ค้นหาเกมในตาราง
  document.querySelector(".header input").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();

    document.querySelectorAll("#gameTable tbody tr").forEach((row) => {
      const id = row.children[0].innerText.toLowerCase();     // ✅ ช่อง ID
      const title = row.children[1].innerText.toLowerCase();  // ✅ ช่องชื่อเกม

      // ✅ ค้นจากทั้ง id และชื่อเกม
      const match = id.includes(query) || title.includes(query);

      row.style.display = match ? "" : "none";
    });
  });

});