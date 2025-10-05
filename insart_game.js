import { Client } from "pg";

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "ThisGameShop",
  password: "2547",
  port: 5432,
});

const games = [
  { title: "Elden Ring", desc: "Open-world action RPG by FromSoftware.", date: "2022-02-25", stock: 20, platform: "PC", price: 199900 },
  { title: "Baldur's Gate 3", desc: "Award-winning RPG adventure by Larian Studios.", date: "2023-08-03", stock: 15, platform: "PC", price: 239900 },
  { title: "Cyberpunk 2077", desc: "Futuristic open-world RPG set in Night City.", date: "2020-12-10", stock: 10, platform: "PC", price: 129900 },
  { title: "Red Dead Redemption 2", desc: "Epic Western adventure from Rockstar Games.", date: "2018-10-26", stock: 12, platform: "PC", price: 189900 },
  { title: "The Witcher 3: Wild Hunt", desc: "Fantasy RPG with monster hunting and deep lore.", date: "2015-05-19", stock: 18, platform: "PC", price: 99900 },
  { title: "GTA V", desc: "Action-adventure in Los Santos by Rockstar.", date: "2013-09-17", stock: 25, platform: "PC", price: 89900 },
  { title: "Hogwarts Legacy", desc: "Magic RPG set in the Harry Potter universe.", date: "2023-02-10", stock: 14, platform: "PS5", price: 219900 },
  { title: "Resident Evil 4 Remake", desc: "Modern remake of a survival horror classic.", date: "2023-03-24", stock: 13, platform: "PS5", price: 169900 },
  { title: "God of War Ragnarök", desc: "Kratos continues his Norse saga.", date: "2022-11-09", stock: 10, platform: "PS5", price: 249900 },
  { title: "Sekiro: Shadows Die Twice", desc: "Challenging samurai action game.", date: "2019-03-22", stock: 11, platform: "PS5", price: 149900 },
  { title: "Dark Souls III", desc: "Dark fantasy RPG by FromSoftware.", date: "2016-04-12", stock: 15, platform: "PS5", price: 119900 },
  { title: "Assassin's Creed Valhalla", desc: "Viking saga in the Assassin’s Creed universe.", date: "2020-11-10", stock: 16, platform: "PS5", price: 159900 },
  { title: "Far Cry 6", desc: "Revolution-themed open-world shooter.", date: "2021-10-07", stock: 12, platform: "PS5", price: 149900 },
  { title: "Death Stranding", desc: "Unique delivery-based adventure by Hideo Kojima.", date: "2019-11-08", stock: 8, platform: "PS5", price: 139900 },
  { title: "Ghost of Tsushima", desc: "Beautiful samurai epic by Sucker Punch.", date: "2020-07-17", stock: 9, platform: "PS5", price: 199900 },
  { title: "Spider-Man Remastered", desc: "Swing through NYC as Marvel's Spider-Man.", date: "2022-08-12", stock: 18, platform: "PS5", price: 179900 },
  { title: "Final Fantasy VII Remake", desc: "Reimagined classic JRPG.", date: "2020-04-10", stock: 10, platform: "PS5", price: 229900 },
  { title: "Monster Hunter: World", desc: "Hunt massive monsters with friends.", date: "2018-01-26", stock: 20, platform: "Xbox", price: 109900 },
  { title: "Monster Hunter Rise", desc: "Fast-paced monster hunting action.", date: "2021-03-26", stock: 17, platform: "Switch", price: 119900 },
  { title: "Diablo IV", desc: "Dark RPG returns from Blizzard.", date: "2023-06-06", stock: 14, platform: "PC", price: 239900 },
  { title: "Overwatch 2", desc: "Team-based FPS from Blizzard.", date: "2022-10-04", stock: 30, platform: "PC", price: 0 },
  { title: "Valorant", desc: "Competitive tactical shooter by Riot Games.", date: "2020-06-02", stock: 40, platform: "PC", price: 0 },
  { title: "League of Legends", desc: "Global MOBA phenomenon.", date: "2009-10-27", stock: 99, platform: "PC", price: 0 },
  { title: "Minecraft", desc: "Creative sandbox building game.", date: "2011-11-18", stock: 50, platform: "PC", price: 89900 },
  { title: "Terraria", desc: "2D sandbox crafting and exploration.", date: "2011-05-16", stock: 35, platform: "PC", price: 49900 },
  { title: "No Man's Sky", desc: "Procedural space exploration game.", date: "2016-08-09", stock: 20, platform: "PC", price: 129900 },
  { title: "ARK: Survival Evolved", desc: "Survive with dinosaurs in a harsh world.", date: "2017-08-29", stock: 25, platform: "Xbox", price: 79900 },
  { title: "Forza Horizon 5", desc: "Racing across Mexico in open-world style.", date: "2021-11-09", stock: 18, platform: "Xbox", price: 189900 },
  { title: "The Sims 4", desc: "Life simulation experience by EA.", date: "2014-09-02", stock: 40, platform: "PC", price: 0 },
  { title: "PUBG: Battlegrounds", desc: "Battle royale pioneer game.", date: "2017-12-20", stock: 60, platform: "PC", price: 0 },
  { title: "Animal Crossing: New Horizons", desc: "Relaxing life sim island adventure.", date: "2020-03-20", stock: 30, platform: "Switch", price: 179900 },
  { title: "Super Mario Odyssey", desc: "3D platform adventure with Mario.", date: "2017-10-27", stock: 20, platform: "Switch", price: 179900 },
  { title: "The Legend of Zelda: Breath of the Wild", desc: "Open-world Zelda adventure.", date: "2017-03-03", stock: 25, platform: "Switch", price: 219900 },
  { title: "The Legend of Zelda: Tears of the Kingdom", desc: "Massive sequel with new mechanics.", date: "2023-05-12", stock: 22, platform: "Switch", price: 229900 },
  { title: "Mario Kart 8 Deluxe", desc: "High-speed kart racing fun.", date: "2017-04-28", stock: 35, platform: "Switch", price: 169900 },
  { title: "Super Smash Bros. Ultimate", desc: "Crossover fighting game with 80+ characters.", date: "2018-12-07", stock: 30, platform: "Switch", price: 189900 },
  { title: "Metroid Dread", desc: "Fast-paced side-scrolling sci-fi action.", date: "2021-10-08", stock: 15, platform: "Switch", price: 179900 },
  { title: "Pikmin 4", desc: "Strategic exploration and puzzle adventure.", date: "2023-07-21", stock: 12, platform: "Switch", price: 189900 },
  { title: "Kirby and the Forgotten Land", desc: "3D platform adventure featuring Kirby.", date: "2022-03-25", stock: 20, platform: "Switch", price: 179900 },
  { title: "Luigi's Mansion 3", desc: "Funny ghost-hunting adventure with Luigi.", date: "2019-10-31", stock: 15, platform: "Switch", price: 179900 },
];

async function insertGames() {
  await db.connect();
  console.log("📡 Connected to ThisGameShop");

  try {
    for (const g of games) {
      const result = await db.query(
        `INSERT INTO games (title, description_md, release_date, stock_managed, platform_flags)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id;`,
        [g.title, g.desc, g.date, g.stock, g.platform]
      );

      const gameId = result.rows[0].id;

      await db.query(
        `INSERT INTO prices (game_id, amount_cents, is_active)
         VALUES ($1, $2, TRUE);`,
        [gameId, g.price]
      );

      console.log(`✅ Added ${g.title} | ${g.platform} | ฿${(g.price / 100).toFixed(2)}`);
    }

    console.log("🎮 All 40 games inserted successfully!");
  } catch (err) {
    console.error("❌ Error inserting games:", err);
  } finally {
    await db.end();
  }
}

insertGames();
