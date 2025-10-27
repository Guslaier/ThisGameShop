// build_steam_dataset.js
// Node 18+ (มี fetch ในตัว) หรือใช้ node-fetch ก็ได้
import fs from "node:fs";

// ======= วาง header URLs ของคุณตรงนี้ =======
const headerUrls = [
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3513350/7ec18f44e089bf340391c6470218ddf3fea2007d/header.jpg?t=1759954991",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2479810/ed59c6cad28e80a984040d7783705515c422ff92/header.jpg?t=1760105847",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/header.jpg?t=1759298078",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2253100/81c5fb1f7602d9fe92ae9971e9c2b587e6cbeb54/header.jpg?t=1760289797",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1623730/058bd87dc17a7179e07c446aa64d0574ca43ab9d/header.jpg?t=1760634660",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg?t=1752704051",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg?t=1761553736",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg?t=1727184011",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/962130/header.jpg?t=1727719725",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg?t=1731252354",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg?t=1739309087",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/513710/a33eb72f52841f591b296f78e46824d7aabb2c87/header.jpg?t=1759911435",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/9ecc87d1062c690c96adeebd33ed761c1bda842f/header_alt_assets_25.jpg?t=1761138171",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1149460/header.jpg?t=1753143921",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/815370/header.jpg?t=1757690850",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg?t=1699381053",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg?t=1759172507",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg?t=1760636583",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/header.jpg?t=1745368562",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/924970/header.jpg?t=1746220006",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg?t=1741142800",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/594650/b816a0a1a2afaadc224e6cfe150c1b273f1d0457/header_alt_assets_21.jpg?t=1761063726",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg?t=1748630546",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg?t=1695270428",
  "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/7983574d464e6559ac7e24275727f73a8bcca1f3/header.jpg?t=1756994410"
];

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127 Safari/537.36";
const MAX_SCREENSHOTS = 8;

const stripQuery = (u) => u.split("?")[0];
const getAppId = (u) => (u.match(/\/apps\/(\d+)\//) || [])[1] || null;
const uniq = (arr) => [...new Set(arr)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function toFullSize(src) {
  if (!src) return null;
  let u = src.replace(/\.116x65(\.\w+)$/i, "$1"); // thumb -> full
  if (u.startsWith("//")) u = "https:" + u;
  return u;
}

function looksLikeMovieThumb(src) {
  const s = (src || "").toLowerCase();
  return (
    s.includes("/movie") ||
    s.includes("/apps/256") ||   // วิดีโอของ Steam มักอยู่โฟลเดอร์ 256...
    s.includes("_thumb") ||
    s.includes("-thumb")
  );
}

async function fetchStorePageScreenshots(appid) {
  const url = `https://store.steampowered.com/app/${appid}`;
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`store ${res.status}`);
  const html = await res.text();

  // ดึงเฉพาะ <img> ใน #highlight_strip_scroll โดยไม่ใช้ lib เพิ่ม เติม regex พอเอาอยู่
  const section = html.split('id="highlight_strip_scroll"')[1]?.split("</div>")[0] || "";
  const imgSrcs = [...section.matchAll(/<img[^>]+src="([^"]+)"/gi)].map(m => m[1]);

  // เฉพาะภาพ (ไม่เอา movie)
  const images = imgSrcs
    .filter(src => !looksLikeMovieThumb(src))
    .map(toFullSize)
    .filter(Boolean);

  return uniq(images);
}

async function fetchAppDetailsScreenshots(appid) {
  const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&l=en&cc=us`;
  const res = await fetch(url, { headers: { "user-agent": UA, "accept": "application/json" } });
  if (!res.ok) throw new Error(`api ${res.status}`);
  const json = await res.json();
  const node = json?.[appid];
  if (!node?.success || !node?.data) return { title: `App ${appid}`, desc: "", date: null, screenshots: [] };

  const data = node.data;
  const title = data.name || `App ${appid}`;
  const desc = (data.short_description || "").replace(/\s+/g, " ").trim();
  const dateText = data.release_date?.date || null;
  const date = normalizeDate(dateText);
  const shots = Array.isArray(data.screenshots) ? data.screenshots.map(s => s.path_full) : [];

  return { title, desc, date, screenshots: shots };
}

// แปลง date text → YYYY-MM-DD (หรือ null)
function normalizeDate(s) {
  if (!s) return null;
  if (/coming soon/i.test(s)) return null;
  const d1 = new Date(s);
  if (!isNaN(d1.getTime())) return d1.toISOString().slice(0,10);

  const m = s.match(/(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})/);
  if (m) {
    const [ , dd, mon, yyyy ] = m;
    const map = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const mm = map[mon.slice(0,3).toLowerCase()];
    if (mm) return `${yyyy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
  }
  return null;
}

async function build() {
  const output = [];

  for (const header of headerUrls) {
    const appid = getAppId(header);
    if (!appid) {
      console.warn(`⚠️ ข้าม (หา appid ไม่เจอ): ${header}`);
      continue;
    }

    const headerClean = stripQuery(header);

    // พยายามดึงจากหน้า Store ก่อน (เพื่อให้ได้เฉพาะภาพจริงๆ)
    let shots = [];
    let meta = { title: `App ${appid}`, desc: "", date: null };

    try {
      const pageShots = await fetchStorePageScreenshots(appid);
      shots = pageShots;
    } catch (e) {
      console.warn(`ℹ️ หน้า Store ดึงรูปไม่ได้ (appid=${appid}): ${e.message}`);
    }

    // ถ้ารูปจากหน้า Store ว่าง → fallback ไป API
    if (!shots.length) {
      try {
        const api = await fetchAppDetailsScreenshots(appid);
        meta = { title: api.title, desc: api.desc, date: api.date };
        shots = api.screenshots;
      } catch (e) {
        console.warn(`ℹ️ API fallback ล้มเหลว (appid=${appid}): ${e.message}`);
      }
    } else {
      // ดึงชื่อ/คำอธิบายจาก API สั้น ๆ (เพื่อความสวยงามใน dataset)
      try {
        const api = await fetchAppDetailsScreenshots(appid);
        meta = { title: api.title, desc: api.desc, date: api.date };
      } catch {}
    }

    // จำกัดจำนวนรูป + unique
    shots = uniq(shots).slice(0, MAX_SCREENSHOTS);

    // เตรียม dataset item
    output.push({
      game: {
        appid: Number(appid),
        title: meta.title,
        desc: meta.desc,
        date: meta.date,   // YYYY-MM-DD หรือ null
        stock: 20,         // ตัวอย่าง แก้ทีหลังได้
        platform: "PC",    // ตัวอย่าง แก้ทีหลังได้
        price: 0,          // ตัวอย่าง แก้ทีหลังได้ (สตางค์)
        image_url: headerClean
      },
      images: [
        { title: "Header", scr: headerClean },
        ...shots.map((u, i) => ({ title: `Screenshot ${i+1}`, scr: u }))
      ]
    });

    // กัน rate limit: หน่วงนิดหน่อย
    await sleep(400);
  }

  // พ่นผลลัพธ์เป็นไฟล์และ console
  fs.writeFileSync("steam_dataset.json", JSON.stringify(output, null, 2));
  console.log("✅ สร้างไฟล์ steam_dataset.json เรียบร้อย\n");
  console.log("const dataset = ");
  console.log(JSON.stringify(output, null, 2), ";");
}

build().catch(err => {
  console.error("❌ Error:", err);
});
