import 'dotenv/config';
import { Client } from "pg";

const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const dataset = [
  {
    "game": {
      "appid": 3513350,
      "title": "Wuthering Waves",
      "desc": "Wuthering Waves is a story-rich open-world action RPG with a high degree of freedom. You wake from your slumber as Rover, joined by a vibrant cast of Resonators on a journey to reclaim your lost memories and change the world.",
      "date": "2025-04-27",
      "stock": 20,
      "platform": "PC",
      "price": 0,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3513350/7ec18f44e089bf340391c6470218ddf3fea2007d/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3513350/7ec18f44e089bf340391c6470218ddf3fea2007d/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/dae6d8c5c3f6de45aae22ede58471e263fd50f6a/ss_dae6d8c5c3f6de45aae22ede58471e263fd50f6a.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/fd60c6202917ca591582f9134bfd5b3af87f30b8/ss_fd60c6202917ca591582f9134bfd5b3af87f30b8.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/4aa2a949817ac8bddcf6106340b92037cc224c82/ss_4aa2a949817ac8bddcf6106340b92037cc224c82.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/a541cd10c034234f4df294808dec9b5a1cc9d42b/ss_a541cd10c034234f4df294808dec9b5a1cc9d42b.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/ae599fb61aef90294f94f0ba63b19dd677a83bf0/ss_ae599fb61aef90294f94f0ba63b19dd677a83bf0.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/d31f822787d496f98fb13a6ee687363a1548058b/ss_d31f822787d496f98fb13a6ee687363a1548058b.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/740fe3b1ed7e5f2e8bc0a13fb4e4da19cf888ce8/ss_740fe3b1ed7e5f2e8bc0a13fb4e4da19cf888ce8.1920x1080.jpg?t=1759954991" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3513350/9fb1386066ccdcbcf7291ac38faebd5598331a6a/ss_9fb1386066ccdcbcf7291ac38faebd5598331a6a.1920x1080.jpg?t=1759954991" }
    ]
  },
  {
    "game": {
      "appid": 2479810,
      "title": "Gray Zone Warfare",
      "desc": "Gray Zone Warfare is a hardcore tactical FPS extraction shooter set in Southeast Asia’s jungle. Join a Private Military Company, fight in intense PvPvE battles, customize your weapons, and survive every mission!",
      "date": "2024-04-29",
      "stock": 20,
      "platform": "PS5",
      "price": 69900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2479810/ed59c6cad28e80a984040d7783705515c422ff92/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2479810/ed59c6cad28e80a984040d7783705515c422ff92/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/9d3ac033a7fb87599a72f3f2b289e7e94a575733/ss_9d3ac033a7fb87599a72f3f2b289e7e94a575733.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/dbb0ad37b00c531f78cd83fcab0d2081885e2eeb/ss_dbb0ad37b00c531f78cd83fcab0d2081885e2eeb.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/554761289ced02f8b33e1e7f6b89c470032c8def/ss_554761289ced02f8b33e1e7f6b89c470032c8def.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/95d4487061f64b552288e87458a4dc7b76642f3e/ss_95d4487061f64b552288e87458a4dc7b76642f3e.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/7968de28c22b0cdf6fefbad740969fe67afd7d8c/ss_7968de28c22b0cdf6fefbad740969fe67afd7d8c.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/b8d00d144e76bea32d6ea16e5d622cb9ca803810/ss_b8d00d144e76bea32d6ea16e5d622cb9ca803810.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/44e6f375cf03845bc7d09d5182bd6ca0643ff63b/ss_44e6f375cf03845bc7d09d5182bd6ca0643ff63b.1920x1080.jpg?t=1760105847" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2479810/c1fc2aa9ee275680100fb5d07cb9b1b3cb777ab7/ss_c1fc2aa9ee275680100fb5d07cb9b1b3cb777ab7.1920x1080.jpg?t=1760105847" }
    ]
  },
  {
    "game": {
      "appid": 1874880,
      "title": "Arma Reforger",
      "desc": "Experience authentic Cold War combat and join the struggle for the sprawling, mid-Atlantic island of Everon and its smaller, offshore territory, Arland – or take on the role of Game Master and create your very own scenarios for others to enjoy.",
      "date": "2023-11-15",
      "stock": 20,
      "platform": "Xbox",
      "price": 149900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1874880/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_70d3b4416f7c191d01b96253957bee9b6cab47be.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_e89540e53a4969f3de49ad6238fe29ff859ecfd2.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_c09c59c3d65086cc4020fd55659cc5ffaaa79333.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_3f3ff3f68acb3194931fb6cffd4565325c98d833.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_f7ea90e5ffd1c59453b358fa446eb0b1759ba9c7.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_a05d4a7f125269a9e990b97b0dfac4e1e0ba8965.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_50c23791527e3a8c0aa0b95fcf6aefed5f80cec4.1920x1080.jpg?t=1759298078" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1874880/ss_e14eba1ed73ddce4c95c12877eb93e33090bcc55.1920x1080.jpg?t=1759298078" }
    ]
  },
  {
    "game": {
      "appid": 2253100,
      "title": "Everwind",
      "desc": "Everwind is a novel take on RPG and Sandbox Survival genre in First-Person-Perspective. Embark on the adventure with your friends - Build a base on a flying island-ship, gather resources, craft, loot, and fight while you rise above the clouds to uncover the mysteries of this world!",
      "date": null,
      "stock": 20,
      "platform": "Switch",
      "price": 79900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2253100/81c5fb1f7602d9fe92ae9971e9c2b587e6cbeb54/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2253100/81c5fb1f7602d9fe92ae9971e9c2b587e6cbeb54/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/ss_d1b5ff54fde7d093ed6ec520b4a3ba624cfec627.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/556a1d63c643595bcd4117e11314bed4611a7937/ss_556a1d63c643595bcd4117e11314bed4611a7937.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/bf766405df221146b39e2fcf6425bcdeef1375e1/ss_bf766405df221146b39e2fcf6425bcdeef1375e1.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/80f714f6757d3e3bf83397bd35313c8fa3f777c5/ss_80f714f6757d3e3bf83397bd35313c8fa3f777c5.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/0755ecd178804945f96f27108abff1e2e7796ed3/ss_0755ecd178804945f96f27108abff1e2e7796ed3.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/ss_4c7d2c0c12979b0c363e55a945c65fd164573683.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/ss_17cca07ec95507e3a81305be1ec3cffc69b1d496.1920x1080.jpg?t=1760289797" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2253100/65c9fb3216b62b0993204a51bdab38035242da1c/ss_65c9fb3216b62b0993204a51bdab38035242da1c.1920x1080.jpg?t=1760289797" }
    ]
  },
  {
    "game": {
      "appid": 1623730,
      "title": "Palworld",
      "desc": "Fight, farm, build and work alongside mysterious creatures called &quot;Pals&quot; in this completely new multiplayer, open world survival and crafting game!",
      "date": "2024-01-17",
      "stock": 20,
      "platform": "PC",
      "price": 89900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1623730/058bd87dc17a7179e07c446aa64d0574ca43ab9d/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1623730/058bd87dc17a7179e07c446aa64d0574ca43ab9d/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_f81b7c4f20be3b99f76a1415c4cdb9b444c99b97.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_a9fa84f0c21bc536f00925ab4586e8c4f587c2b7.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_b3cea7c9f04a67d784d4c6a0c157a11d6268b189.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_06e27c15c7b4b10233c937b887cf6a6925c83009.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_0c8cbc20442b948c91b02d9e1b41bf0638a07c08.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_a99fba5536acde781bd863cb3555c10b5b96c0ae.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_1e47bb8bbfaaaf3282bfb5d253378832b55c4e56.1920x1080.jpg?t=1760634660" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/ss_6ce0960860f1009b7d10ba225ead4cc377286115.1920x1080.jpg?t=1760634660" }
    ]
  },
  {
    "game": {
      "appid": 346110,
      "title": "ARK: Survival Evolved",
      "desc": "Stranded on the shores of a mysterious island, you must learn to survive. Use your cunning to kill or tame the primeval creatures roaming the land, and encounter other players to survive, dominate... and escape!",
      "date": "2017-08-26",
      "stock": 20,
      "platform": "PS5",
      "price": 79900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/346110/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_2fd997a2f7151cb2187043a1f41589cc6a9ebf3a.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_01cbef83fe28d64ee5a3d39a86043fb1e49abd31.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_164a92a53f9bcbb728b391fc0719f9769c2e1249.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_46778c08a1a5ac5bdbaf8a5bf844fa666f66a14b.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_ffe9f0e2e23892f3bb6188e5a3eed0f60a08baf4.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_cada382a940c062a1a5244db8da1326de55ddeae.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_1a7f5508e5384a759ccc83fa484db04513213698.1920x1080.jpg?t=1752704051" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/346110/ss_ffd48da603fa700d10738ae4ee44ce2b9113cb64.1920x1080.jpg?t=1752704051" }
    ]
  },
  {
    "game": {
      "appid": 252490,
      "title": "Rust",
      "desc": "The only aim in Rust is to survive. Everything wants you to die - the island’s wildlife, other inhabitants, the environment, and other survivors. Do whatever it takes to last another night.",
      "date": "2018-02-07",
      "stock": 20,
      "platform": "Xbox",
      "price": 79900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/252490/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_271feae67943bdc141c1249aba116349397e9ba9.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_e825b087b95e51c3534383cfd75ad6e8038147c3.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_0e646f1a70e5cb8eed00efef8adb9579d40d5b2e.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_1c2d0d1eefee54f0c67626c74eb21699bbb0ef52.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_d0fdacaeef5a28a7cee525fd73376adfe083c964.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_827f1bb38361eb3f7de91cff9be5b7176a05a9ac.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_bbf6c96e490326ec877ae548cb148e53516b5f83.1920x1080.jpg?t=1761553736" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/252490/ss_2a8518810024a5fbf9c714e697a43a1201b5d53e.1920x1080.jpg?t=1761553736" }
    ]
  },
  {
    "game": {
      "appid": 648800,
      "title": "Raft",
      "desc": "Raft™ throws you and your friends into an epic oceanic adventure! Alone or together, players battle to survive a perilous voyage across a vast sea! Gather debris, scavenge reefs and build your own floating home, but be wary of the man-eating sharks!",
      "date": "2022-06-19",
      "stock": 20,
      "platform": "Switch",
      "price": 59900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/648800/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_c22b2ff5ba5609f74e61b5feaa5b7a1d7fd1dbd3.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_2adb248f4d501cf58344d9af1d8a9e56c74647ee.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_56914c026da8c8411974bd0e2e8cb81a0331ba99.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_ef26440dc87e4d571139f5c64a22035d86723442.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_dddecb78ba5ae9eecbe17a22f09f5281609d63a0.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_594b5fab052123e5f96088df3ec3c9b7cec62e88.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_7e366c948ed3847f33693cebd23aaaf6458cbf46.1920x1080.jpg?t=1727184011" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/648800/ss_e5d26eea3a2e068518095a9596380ab384da6e80.1920x1080.jpg?t=1727184011" }
    ]
  },
  {
    "game": {
      "appid": 962130,
      "title": "Grounded",
      "desc": "The world is a vast, beautiful and dangerous place – especially when you have been shrunk to the size of an ant. Can you thrive alongside the hordes of giant insects, fighting to survive the perils of the backyard?",
      "date": "2022-09-26",
      "stock": 20,
      "platform": "PC",
      "price": 109900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/962130/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/962130/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_91a03b79d881f37cc7d39b5baf5bb597d344fabe.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_432b22f117321d942d5bbb4ee49d2acc37b4baf2.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_298eedf3441e631910ca29d274da0a54f56632b8.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_ae92bff37bed4b614ae250c9ea8c3e889c2e1614.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_67f3fa16e8d2f76479039a425fe49123ea2bc6dc.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_b69a1149d228e20cc17521a02d0bff26894bc23f.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_f71a9fb8203f4a18d7bbe0f127847de264b12b5c.1920x1080.jpg?t=1727719725" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/962130/ss_b732108522269430e86d55e0279c3934a6a67f94.1920x1080.jpg?t=1727719725" }
    ]
  },
  {
    "game": {
      "appid": 105600,
      "title": "Terraria",
      "desc": "Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game. Four Pack also available!",
      "date": "2011-05-15",
      "stock": 20,
      "platform": "PS5",
      "price": 49900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_8c03886f214d2108cafca13845533eaa3d87d83f.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_ae168a00ab08104ba266dc30232654d4b3c919e5.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_9edd98caaf9357c2f40758f354475a56e356e8b0.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_75ea9a7e39eb34b40efa1e6dfd2536098dc4734b.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_782374517c1792debd74d24856203b876eba3a5d.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_04dd9f0a5773b686a452ba480b951f83b3ed5061.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_26c4a091c482be28efe1ecf4dfb498273e5a9107.1920x1080.jpg?t=1731252354" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/105600/ss_830aa37570410b80947636785ff62096c0bf276f.1920x1080.jpg?t=1731252354" }
    ]
  },
  {
    "game": {
      "appid": 108600,
      "title": "Project Zomboid",
      "desc": "Project Zomboid is the ultimate in zombie survival. Alone or in MP: you loot, build, craft, fight, farm and fish in a struggle to survive. A hardcore RPG skillset, a vast map, massively customisable sandbox and a cute tutorial raccoon await the unwary. So how will you die? All it takes is a bite..",
      "date": "2013-11-07",
      "stock": 20,
      "platform": "Xbox",
      "price": 49900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/108600/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_d4a0f78dc94273c7f0eedc186569efc091387066.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_eca8be032b3f5508bf5bea74cfbc823a4df047ce.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_7300ecc70342b6fcbdf39b6f9ff4c408066f8fc2.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_eb1862af5109e4658e2538d897cbd16b87ad1818.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_3b21d79855804e2a73468328a8fd18df0d238a2a.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_0dc0cb896202ecfa344a0af981b695f2349317e1.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_bb426e3c51a76f0605cef625094a9fbc7efad73a.1920x1080.jpg?t=1739309087" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/108600/ss_507e952789822b69868d768e1e4476946f37b1fb.1920x1080.jpg?t=1739309087" }
    ]
  },
  {
    "game": {
      "appid": 513710,
      "title": "SCUM",
      "desc": "Traverse punishing environments, looting, crafting and evading the constant threats to your life. The unprecedented levels of character customization and progression are your ultimate tools for survival.",
      "date": "2025-06-16",
      "stock": 20,
      "platform": "Switch",
      "price": 79900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/513710/a33eb72f52841f591b296f78e46824d7aabb2c87/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/513710/a33eb72f52841f591b296f78e46824d7aabb2c87/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/ss_62f56143b1c35cb843a4f3e29290a09176532ee5.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/ef7f226e863f6e82d77550875f8296803d914f4b/ss_ef7f226e863f6e82d77550875f8296803d914f4b.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/ss_ecfffcc4a177083e0ed0727319f77019624f076a.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/efc65c3c78b80198d50f42f4a2471a2c78e6cff1/ss_efc65c3c78b80198d50f42f4a2471a2c78e6cff1.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/a862f6329d9f6d7de132f207967a27c8bb5a8155/ss_a862f6329d9f6d7de132f207967a27c8bb5a8155.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/bdc9a0c14ccd4bfd4bfae1f24b8f9cd571c7c14e/ss_bdc9a0c14ccd4bfd4bfae1f24b8f9cd571c7c14e.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/62aaafd7e3508345cc4d541301096879c173b912/ss_62aaafd7e3508345cc4d541301096879c173b912.1920x1080.jpg?t=1759911435" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/513710/ss_0b75f5f5aa10f00a0d3e9776b15477fe3f9b6eb5.1920x1080.jpg?t=1759911435" }
    ]
  },
  {
    "game": {
      "appid": 275850,
      "title": "No Man's Sky",
      "desc": "No Man's Sky is a game about exploration and survival in an infinite procedurally generated universe.",
      "date": "2016-08-11",
      "stock": 20,
      "platform": "PC",
      "price": 129900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/9ecc87d1062c690c96adeebd33ed761c1bda842f/header_alt_assets_25.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/275850/9ecc87d1062c690c96adeebd33ed761c1bda842f/header_alt_assets_25.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/d8de91e4a87f0e2c0fb70c84bd0f798bd4617eaf/ss_d8de91e4a87f0e2c0fb70c84bd0f798bd4617eaf.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/71f533720e58e1fb5dd61f23388abfe4f9caa6b5/ss_71f533720e58e1fb5dd61f23388abfe4f9caa6b5.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/ss_32256c21c6bfd9032debf56e1af47029e6d9f9b0.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/ss_d4884d4d208b3f6a3ecef898559da7a36102fc70.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/a26b4dc2a2956137554a7ee8ca3cf42bbcd55b48/ss_a26b4dc2a2956137554a7ee8ca3cf42bbcd55b48.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/e7d9dd1a847bc7212a52c20bd4b4f788a2e6601b/ss_e7d9dd1a847bc7212a52c20bd4b4f788a2e6601b.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/47005e90c31a62121610cbf29ce3dcc3c49dfa96/ss_47005e90c31a62121610cbf29ce3dcc3c49dfa96.1920x1080.jpg?t=1761138171" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/275850/6c95901073189a7f6fb71ab032174e83cec2d885/ss_6c95901073189a7f6fb71ab032174e83cec2d885.1920x1080.jpg?t=1761138171" }
    ]
  },
  {
    "game": {
      "appid": 1149460,
      "title": "ICARUS",
      "desc": "ICARUS is a PvE survival game for up to eight players. Explore a savage wilderness in the aftermath of terraforming gone wrong. Survive the Open World, complete timed Missions or build your Outpost. Explore, build, craft and hunt while seeking your fortune and prospecting for exotic matter.",
      "date": "2021-12-02",
      "stock": 20,
      "platform": "PS5",
      "price": 99900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1149460/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1149460/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_71323ca651735d89764fa9e62c5d1756a9b64d4f.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_aa5a09717e6432d3bd61e6d7b20ac622c6f27502.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_30776e22c695c02c12a2bb28967e3dae52615e39.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_ea75b5076ae031f2a39ee4d5d0448d70ea8e54ed.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_d9da7ae25c3675277b9982cef8180469cb5081c4.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_c7178f83bce2cff9872632ec9bc83da9daf11355.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_639d27fd3e963f7713db60b353ad1f5d1c3559b9.1920x1080.jpg?t=1753143921" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1149460/ss_575ee577c444afc65f8bbf8f7f18d705eacbca15.1920x1080.jpg?t=1753143921" }
    ]
  },
  {
    "game": {
      "appid": 815370,
      "title": "Green Hell",
      "desc": "Plunge into the open-world survival simulation set in the extreme conditions of the uncharted Amazon jungle. Use real-life survival techniques to craft, hunt, fight, and gather resources, set a makeshift shelter, or raise a fortress. Survive alone or team up with your friends and challenge the jungle together.",
      "date": "2019-09-04",
      "stock": 20,
      "platform": "Xbox",
      "price": 69900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/815370/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/815370/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_5acf01bcbf6f17e2fbeb9378f9e604f03d60e81b.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_d87e2a79e9ac8de98c69a38b8447607d7ad3a4b5.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_138caa0409f2a2afd94f2f38a7362f7c63169423.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_a350eb858d655890495ba116fe641266d23315c0.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_9c5e649f1c5774db50db4368b762015ae8207b43.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_209053061cc9ceda23a60bc537984daf2a061ce1.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_34d6e81887d5b46d8f3e099f191ff7096dce70ba.1920x1080.jpg?t=1757690850" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/815370/ss_a86af9e1ba0910d2d0827b655299ca5a7e997c22.1920x1080.jpg?t=1757690850" }
    ]
  },
  {
    "game": {
      "appid": 242760,
      "title": "The Forest",
      "desc": "As the lone survivor of a passenger jet crash, you find yourself in a mysterious forest battling to stay alive against a society of cannibalistic mutants. Build, explore, survive in this terrifying first person survival horror simulator.",
      "date": "2018-04-29",
      "stock": 20,
      "platform": "Switch",
      "price": 49900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/242760/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_8ccb821c4df3fafdf4161d77f38635441a8157f2.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_53c615d49c4777144ed7359e4bf7c9eb6838cc8e.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_772eebf0ce7bdb51546055a36185e8ee46e8acac.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_d03a261fecab226a0ecac5746225c2a50d65c670.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_d77d402c78451a04b5c370e81ff7767c4008343c.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_a37e6873baf869be91010b20c30a7e61e4b82cc1.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_7598551a5bfbf69ae1161c8ebee8e000868add24.1920x1080.jpg?t=1699381053" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/242760/ss_7a8d95143af9f801a7b5ba9a6cb23f2e5998344c.1920x1080.jpg?t=1699381053" }
    ]
  },
  {
    "game": {
      "appid": 3527290,
      "title": "PEAK",
      "desc": "PEAK is a co-op climbing game where the slightest mistake can spell your doom. Either solo or as a group of lost nature scouts, your only hope of rescue from a mysterious island is to scale the mountain at its center. Do you have what it takes to reach the PEAK?",
      "date": "2025-06-15",
      "stock": 20,
      "platform": "PC",
      "price": 29900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/bac7b90dffb456afecc4517a3e1d69362b95d15b/ss_bac7b90dffb456afecc4517a3e1d69362b95d15b.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/9c500124c060f162f111afa679bf5d3a32b3fb40/ss_9c500124c060f162f111afa679bf5d3a32b3fb40.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/55365bfa09745df86bed72720a842f64d8724b9d/ss_55365bfa09745df86bed72720a842f64d8724b9d.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/f157b9fd773acfbb122eaf09e7f008bfd77b02ab/ss_f157b9fd773acfbb122eaf09e7f008bfd77b02ab.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/63b22127ea64aba8b16c33a172b0fedbf542e834/ss_63b22127ea64aba8b16c33a172b0fedbf542e834.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/471f445657aaf8b8c1d039389e5dcc6a8bcc32c5/ss_471f445657aaf8b8c1d039389e5dcc6a8bcc32c5.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/d1de9aa2ac60642fe556cee057703bebab64cf33/ss_d1de9aa2ac60642fe556cee057703bebab64cf33.1920x1080.jpg?t=1759172507" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/52547c087901dec5b065b4559503804c02c10c22/ss_52547c087901dec5b065b4559503804c02c10c22.1920x1080.jpg?t=1759172507" }
    ]
  },
  {
    "game": {
      "appid": 381210,
      "title": "Dead by Daylight",
      "desc": "Trapped forever in a realm of eldritch evil where even death is not an escape, four determined Survivors face a bloodthirsty Killer in a vicious game of nerve and wits. Pick a side and step into a world of tension and terror with horror gaming's best asymmetrical multiplayer.",
      "date": "2016-06-13",
      "stock": 20,
      "platform": "PS5",
      "price": 49900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/381210/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_659500624438a4aa77bfdf304cba3ecebcd92ed9.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_ca6b39f2fcac8feb75d23976b1be31290d58d159.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_4075aac79adfe1a5b71665d2cc5ff7d52122650b.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_d3778cc9576bf3457f4ba896a443a114c0455753.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_b142095e4f9e5d9db978270ea09e8b9149db9f18.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_430577c364a68dbe24e8a1d895bd678ea04b87d5.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_969a7841466e12f063c2d9a72520cce1c3b2f331.1920x1080.jpg?t=1760636583" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/381210/ss_cd57ce3a42d66d90164534ad71388527f1e0cf7b.1920x1080.jpg?t=1760636583" }
    ]
  },
  {
    "game": {
      "appid": 550,
      "title": "Left 4 Dead 2",
      "desc": "Set in the zombie apocalypse, Left 4 Dead 2 (L4D2) is the highly anticipated sequel to the award-winning Left 4 Dead, the #1 co-op game of 2008. This co-operative action horror FPS takes you and your friends through the cities, swamps and cemeteries of the Deep South, from Savannah to New Orleans across five expansive campaigns.",
      "date": "2009-11-15",
      "stock": 20,
      "platform": "Xbox",
      "price": 29900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/550/ss_2eae29fbdfe8e5e8999b96d8bb28c5db70507968.116x65.jpg?t=1745368562" }
    ]
  },
  {
    "game": {
      "appid": 924970,
      "title": "Back 4 Blood",
      "desc": "Back 4 Blood is a thrilling cooperative first-person shooter from the creators of the critically acclaimed Left 4 Dead franchise. Experience the intense 4 player co-op narrative campaign, competitive multiplayer as human or Ridden, and frenetic gameplay that keeps you in the action.",
      "date": "2021-10-11",
      "stock": 20,
      "platform": "Switch",
      "price": 89900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/924970/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/924970/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_3329126d46bfd0cd32069508a1d37e40a1f4d92e.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_61ba5c1e5ff0992738255a3c6679fdbc2cd659de.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_01d625277a7dc76a67f78de3a3ed1e633d205ddd.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_cb8d4bd7139ce8f80df16e5c7c4be906222f050b.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_cff8429e91cfc960864b0652855a8458e43d476a.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_38fee58572e3ad66ef445bcc358ee8dcaadf06bc.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_4bad592a2ed6618cdd83e646560fa4f1c2ebb965.1920x1080.jpg?t=1746220006" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/924970/ss_199c74883c9b599d968c4320766a089f50e782c2.1920x1080.jpg?t=1746220006" }
    ]
  },
  {
    "game": {
      "appid": 1196590,
      "title": "Resident Evil Village",
      "desc": "Experience survival horror like never before in the 8th major installment in the Resident Evil franchise - Resident Evil Village. With detailed graphics, intense first-person action and masterful storytelling, the terror has never felt more realistic.",
      "date": "2021-05-05",
      "stock": 20,
      "platform": "PC",
      "price": 119900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1196590/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_d25704b01be292d1337df4fea0fba2aab322b58a.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_8113ec993ec474055c4cdce5ee86f91f7cf6663f.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_50283e6df9d2f3f24ff4a1a36a94ae307e21cee8.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_363d9c05ee0a974b766938610a3352e7a89b9c92.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_e2bdaa9a0eeae714b3ad3ba49c9ae83a3930f08e.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_d296efbc9a5d87bf20b2ea19134f35ba203ae813.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_d6c5bfb48d7fda343ed583750372b0d3e513ae17.1920x1080.jpg?t=1741142800" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1196590/ss_b790b617004b92423a855d5526a1eb29e05b6c78.1920x1080.jpg?t=1741142800" }
    ]
  },
  {
    "game": {
      "appid": 594650,
      "title": "Hunt: Showdown 1896",
      "desc": "Hunt: Showdown 1896 is a new era of the addictively unforgiving extraction shooter. In corrupted backwaters lost to history, fight back alone – or with friends – against timeless evil. Twisted monsters and other ruthless Hunters stand between you and your Bounty. Risk everything as Hunt consumes you",
      "date": "2019-08-26",
      "stock": 20,
      "platform": "PS5",
      "price": 89900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/594650/b816a0a1a2afaadc224e6cfe150c1b273f1d0457/header_alt_assets_21.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/594650/b816a0a1a2afaadc224e6cfe150c1b273f1d0457/header_alt_assets_21.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/22eee41058dd9b51153655b4603f84a9af94766e/ss_22eee41058dd9b51153655b4603f84a9af94766e.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/3fb490e75877763dee2866b5442ce81bc451b588/ss_3fb490e75877763dee2866b5442ce81bc451b588.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/209e01229a42c09d79e7ec30fa3da0b5727fd6c5/ss_209e01229a42c09d79e7ec30fa3da0b5727fd6c5.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/701e899d7b80d6d52b8f537419f59a0f18d13da1/ss_701e899d7b80d6d52b8f537419f59a0f18d13da1.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/77321e59cbedd4bb9c1bab532a9ca02ddd89eb7a/ss_77321e59cbedd4bb9c1bab532a9ca02ddd89eb7a.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/add488ede5981d263b3b9aabbd9bcd7fd7e11cd5/ss_add488ede5981d263b3b9aabbd9bcd7fd7e11cd5.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/ss_d6dcff699545cfdd38df20f6cd58c5c40a9660d8.1920x1080.jpg?t=1761063726" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/594650/ss_1440bf64dfd9cac71a607230cc972fc6e43419a1.1920x1080.jpg?t=1761063726" }
    ]
  },
  {
    "game": {
      "appid": 1245620,
      "title": "ELDEN RING",
      "desc": "THE CRITICALLY ACCLAIMED FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
      "date": "2022-02-23",
      "stock": 20,
      "platform": "Xbox",
      "price": 179900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_943bf6fe62352757d9070c1d33e50b92fe8539f1.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_dcdac9e4b26ac0ee5248bfd2967d764fd00cdb42.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_3c41384a24d86dddd58a8f61db77f9dc0bfda8b5.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_e0316c76f8197405c1312d072b84331dd735d60b.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_ef61b771ee6b269b1f0cb484233e07a0bfb5f81b.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_b1b91299d7e4b94201ac840aa64de54d9f5cb7f3.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_510a02cf3045e841e180f2b77fb87545e0c8b59d.1920x1080.jpg?t=1748630546" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/ss_c494372930ca791bdc6221eca134f2270fb2cb9f.1920x1080.jpg?t=1748630546" }
    ]
  },
  {
    "game": {
      "appid": 367520,
      "title": "Hollow Knight",
      "desc": "Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all in a classic, hand-drawn 2D style.",
      "date": "2017-02-23",
      "stock": 20,
      "platform": "Switch",
      "price": 39900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_5384f9f8b96a0b9934b2bc35a4058376211636d2.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_d5b6edd94e77ba6db31c44d8a3c09d807ab27751.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_a81e4231cc8d55f58b51a4a938898af46503cae5.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_62e10cf506d461e11e050457b08aa0e2a1c078d0.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_bd76bd88bc5334ee56ae3d5f0d8dec4455e8e3b8.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_33a645903d6dd9beec39f272a3daf57174a6cc26.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_47f3523dbea462aff2ca4bc9f605faaf80a792b2.1920x1080.jpg?t=1695270428" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/ss_92c7e8f34c00bdb455070ecdd5b746f0d2f6d808.1920x1080.jpg?t=1695270428" }
    ]
  },
  {
    "game": {
      "appid": 1030300,
      "title": "Hollow Knight: Silksong",
      "desc": "Discover a vast, haunted kingdom in Hollow Knight: Silksong! Explore, fight and survive as you ascend to the peak of a land ruled by silk and song.",
      "date": "2025-09-03",
      "stock": 20,
      "platform": "PC",
      "price": 69900,
      "image_url": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/7983574d464e6559ac7e24275727f73a8bcca1f3/header.jpg"
    },
    "images": [
      { "title": "Header", "scr": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/7983574d464e6559ac7e24275727f73a8bcca1f3/header.jpg" },
      { "title": "Screenshot 1", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/26950369fe4b03c2268620eb9815c8a246aa0b06/ss_26950369fe4b03c2268620eb9815c8a246aa0b06.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 2", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/09ccaa6c16f158f9df8298feb5d196098506a028/ss_09ccaa6c16f158f9df8298feb5d196098506a028.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 3", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d1a893ec6357b347a55ed929833ba793b57a79d2/ss_d1a893ec6357b347a55ed929833ba793b57a79d2.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 4", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/856e33e755a0b9a785c645d116036516ea08812b/ss_856e33e755a0b9a785c645d116036516ea08812b.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 5", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478/ss_8e09f2b2eedd3fa9b4479dd5c26d8bdf60562478.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 6", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d907d0cc2b10b5ea4788b8d502cc27787d520c1d/ss_d907d0cc2b10b5ea4788b8d502cc27787d520c1d.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 7", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/1b93e8131cb6f4bd9e3791a606d0da8f9ee78276/ss_1b93e8131cb6f4bd9e3791a606d0da8f9ee78276.1920x1080.jpg?t=1756994410" },
      { "title": "Screenshot 8", "scr": "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1030300/d20b045b8bdaea6ace2ca4170875772b439c2c2e/ss_d20b045b8bdaea6ace2ca4170875772b439c2c2e.1920x1080.jpg?t=1756994410" }
    ]
  }
]


async function insertGames() {
  await db.connect();
  console.log("📡 Connected to ThisGameShop");

  try {
    const check = await db.query('SELECT COUNT(*) FROM games');
    if (parseInt(check.rows[0].count) > 0) {
      console.log("ℹ️ Games already exist in database, skipping insert.");
      return;
    }

    for (const g of dataset) {
      const result = await db.query(
        `INSERT INTO games (title, description_md, release_date, stock_managed, platform_flags,image_poster)
         VALUES ($1, $2, $3, $4, $5,$6)
         RETURNING id;`,
        [g.game.title, g.game.desc, g.game.date, g.game.stock, g.game.platform, g.game.image_url]
      );

      const gameId = result.rows[0].id;

      await db.query(
        `INSERT INTO prices (game_id, amount_cents, is_active)
         VALUES ($1, $2, TRUE);`,
        [gameId, g.game.price]
      );


      // 2) insert images
      for (const img of g.images) {
        await db.query(
          `INSERT INTO game_img (game_id, title, scr)
         VALUES ($1,$2,$3)`,
          [gameId, img.title, img.scr]
        );
      }
      console.log(`✅ Added ${g.game.title} | ${g.game.platform} | ฿ ${(g.game.price / 100).toFixed(2)}`);
    }

  } catch (err) {
    console.error("❌ Error inserting games:", err);
  } finally {
    await db.end();
  }
}

insertGames();
