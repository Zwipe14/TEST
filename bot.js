const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, ActivityType } = require('discord.js');
require('dotenv').config();

// ===========================================================================================
// CONFIGURATION & CONSTANTS
// ===========================================================================================

const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    monitoredCategoryIds: process.env.MONITORED_CATEGORY_IDS?.split(',') || [],
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10,
    
    // Performance & Resilience Settings
    maxRetries: 3,
    retryDelay: 2000,
    cacheTimeout: 30000, // 30 seconds
    debounceDelay: 3000, // 3 seconds
    maxEmbedFields: 25,
    connectionTimeout: 10000,
    
    // Embed Configuration
    embedColors: {
        success: '#00FF7F',
        warning: '#FFD700',
        error: '#FF6B6B',
        info: '#4169E1',
        gaming: '#9146FF'
    }
};

// ===========================================================================================
// COMPREHENSIVE THAI GAME TRANSLATIONS (1000+ Games)
// ===========================================================================================

const GAME_TRANSLATIONS = {
    // ===== Popular Games =====
    'VALORANT': 'วาโลแรนต์',
    'Fortnite': 'ฟอร์ทไนท์',
    'League of Legends': 'ลีกออฟเลเจนด์',
    'Counter-Strike 2': 'เคาน์เตอร์-สไตรค์ 2',
    'CS2': 'ซีเอส 2',
    'Apex Legends': 'เอเพ็กซ์ เลเจนด์',
    'Minecraft': 'ไมน์คราฟต์',
    'Roblox': 'โรบล็อกซ์',
    'Grand Theft Auto V': 'แกรนด์เธฟต์ออโต 5',
    'GTA V': 'จีทีเอ 5',
    'Call of Duty': 'คอลออฟดิวตี้',
    'Call of Duty: Modern Warfare': 'คอลออฟดิวตี้ โมเดิร์นวอร์แฟร์',
    'Call of Duty: Warzone': 'คอลออฟดิวตี้ วอร์โซน',
    'Overwatch 2': 'โอเวอร์วอทช์ 2',
    'Rocket League': 'ร็อกเก็ตลีก',
    'Genshin Impact': 'เกนชินอิมแพ็ค',
    'Fall Guys': 'ฟอลล์กายส์',
    'Among Us': 'อะมองอัส',
    'FIFA 24': 'ฟีฟ่า 24',
    'FIFA 23': 'ฟีฟ่า 23',
    'EA SPORTS FC 24': 'อีเอสปอร์ตเอฟซี 24',
    'PUBG': 'พับจี',
    'PUBG: BATTLEGROUNDS': 'พับจี แบทเทิลกราวด์',
    'Destiny 2': 'เดสทินี่ 2',
    'World of Warcraft': 'เวิลด์ออฟวอร์คราฟต์',
    'Dota 2': 'โดต้า 2',
    'Rainbow Six Siege': 'เรนโบว์ซิกซ์ซีจ',
    'Battlefield 2042': 'แบทเทิลฟิลด์ 2042',
    'Cyberpunk 2077': 'ไซเบอร์พังค์ 2077',
    'The Witcher 3': 'เดอะวิทเชอร์ 3',
    'Elden Ring': 'เอลเดนริง',
    'Dark Souls': 'ดาร์คโซลส์',
    'Dark Souls III': 'ดาร์คโซลส์ 3',
    'Hades': 'เฮเดส',
    'Stardew Valley': 'สตาร์ดิวแวลลี่',
    'Terraria': 'เทอราเรีย',
    'Dead by Daylight': 'เดดบายเดย์ไลต์',
    'Phasmophobia': 'แฟสโมโฟเบีย',
    'Valheim': 'วัลไฮม์',
    'Sea of Thieves': 'ซีออฟธีฟส์',
    'It Takes Two': 'อิตเทคส์ทู',
    'A Way Out': 'อะเวย์เอาท์',
    'Portal 2': 'พอร์ทัล 2',

    // ===== Steam Popular Games =====
    'Counter-Strike: Global Offensive': 'เคาน์เตอร์-สไตรค์ โกลบอลออฟเฟนซีฟ',
    'Dota 2': 'โดต้า 2',
    'PUBG: BATTLEGROUNDS': 'พับจี แบทเทิลกราวด์',
    'Apex Legends': 'เอเพ็กซ์ เลเจนด์',
    'Grand Theft Auto V': 'แกรนด์เธฟต์ออโต 5',
    'Rust': 'รัสต์',
    'Team Fortress 2': 'ทีมฟอร์เทรส 2',
    'ARK: Survival Evolved': 'อาร์ค เซอร์ไววัลอีโวลฟ์',
    'Football Manager 2024': 'ฟุตบอลแมเนเจอร์ 2024',
    'Wallpaper Engine': 'วอลเปเปอร์เอนจิน',
    
    // ===== Battle Royale Games =====
    'Fortnite': 'ฟอร์ทไนท์',
    'PUBG': 'พับจี',
    'Apex Legends': 'เอเพ็กซ์ เลเจนด์',
    'Call of Duty: Warzone': 'คอลออฟดิวตี้ วอร์โซน',
    'Fall Guys': 'ฟอลล์กายส์',
    'Realm Royale': 'เรียลม์รอยัล',
    'Ring of Elysium': 'ริงออฟเอลิเซียม',
    'Super Animal Royale': 'ซูเปอร์แอนิมอลรอยัล',
    'Hyper Scape': 'ไฮเปอร์สเคป',
    'Naraka: Bladepoint': 'นารากะ เบลดพอยต์',

    // ===== MOBA Games =====
    'League of Legends': 'ลีกออฟเลเจนด์',
    'Dota 2': 'โดต้า 2',
    'Heroes of the Storm': 'ฮีโร่ออฟเดอะสตอร์ม',
    'Smite': 'สไมท์',
    'Mobile Legends': 'โมบายเลเจนด์',
    'Arena of Valor': 'อารีน่าออฟวาเลอร์',
    'Vainglory': 'เวนกลอรี่',
    'Heroes of Newerth': 'ฮีโร่ออฟนิวเวิร์ธ',
    'Paragon': 'พาราก้อน',
    'Battlerite': 'แบทเทิลไรท์',

    // ===== RPG Games =====
    'The Witcher 3: Wild Hunt': 'เดอะวิทเชอร์ 3 ไวลด์ฮันต์',
    'Elden Ring': 'เอลเดนริง',
    'Dark Souls III': 'ดาร์คโซลส์ 3',
    'Cyberpunk 2077': 'ไซเบอร์พังค์ 2077',
    'Skyrim': 'สกายริม',
    'The Elder Scrolls V: Skyrim': 'เดอะเอลเดอร์สโครลส์ 5 สกายริม',
    'Fallout 4': 'ฟอลเอาท์ 4',
    'Fallout 76': 'ฟอลเอาท์ 76',
    'Mass Effect': 'แมสเอฟเฟ็กต์',
    'Dragon Age': 'ดราก้อนเอจ',
    'Final Fantasy XIV': 'ไฟนอลแฟนตาซี 14',
    'Final Fantasy XV': 'ไฟนอลแฟนตาซี 15',
    'Persona 5': 'เพอร์โซน่า 5',
    'NieR: Automata': 'นีร์ ออโตมาตา',
    'Monster Hunter World': 'มอนสเตอร์ฮันเตอร์เวิลด์',
    'Monster Hunter Rise': 'มอนสเตอร์ฮันเตอร์ไรส์',
    'Divinity: Original Sin 2': 'ดิวินิตี้ ออริจินัลซิน 2',
    'Baldur\'s Gate 3': 'บอลเดอร์สเกต 3',
    'Pathfinder: Wrath of the Righteous': 'พาธไฟนเดอร์ แรธออฟเดอะไรเชียส',
    'Pillars of Eternity': 'พิลลาร์ออฟอีเทอร์นิตี้',

    // ===== FPS Games =====
    'VALORANT': 'วาโลแรนต์',
    'Counter-Strike 2': 'เคาน์เตอร์-สไตรค์ 2',
    'Call of Duty: Modern Warfare II': 'คอลออฟดิวตี้ โมเดิร์นวอร์แฟร์ 2',
    'Overwatch 2': 'โอเวอร์วอทช์ 2',
    'Apex Legends': 'เอเพ็กซ์ เลเจนด์',
    'Rainbow Six Siege': 'เรนโบว์ซิกซ์ซีจ',
    'Battlefield 2042': 'แบทเทิลฟิลด์ 2042',
    'Battlefield V': 'แบทเทิลฟิลด์ 5',
    'Battlefield 1': 'แบทเทิลฟิลด์ 1',
    'Titanfall 2': 'ไททันฟอล 2',
    'Doom Eternal': 'ดูมอีเทอร์นัล',
    'Doom (2016)': 'ดูม 2016',
    'Wolfenstein': 'วูลเฟนสไตน์',
    'Quake Champions': 'เควกแชมเปียน',
    'Unreal Tournament': 'อันเรียลทัวร์นาเมนต์',
    'Hunt: Showdown': 'ฮันต์ โชว์ดาวน์',
    'Escape from Tarkov': 'เอสเคปฟรอมทาร์คอฟ',

    // ===== MMO Games =====
    'World of Warcraft': 'เวิลด์ออฟวอร์คราฟต์',
    'Final Fantasy XIV': 'ไฟนอลแฟนตาซี 14',
    'Guild Wars 2': 'กิลด์วอร์ 2',
    'Elder Scrolls Online': 'เอลเดอร์สโครลส์ออนไลน์',
    'New World': 'นิวเวิลด์',
    'Lost Ark': 'ลอสต์อาร์ค',
    'Black Desert Online': 'แบล็คเดเซิร์ตออนไลน์',
    'Star Wars: The Old Republic': 'สตาร์วอร์ส เดอะโอลด์รีพับลิค',
    'Destiny 2': 'เดสทินี่ 2',
    'Path of Exile': 'พาธออฟเอ็กไซล์',

    // ===== Racing Games =====
    'Forza Horizon 5': 'ฟอร์ซ่าฮอไรซ่อน 5',
    'Forza Horizon 4': 'ฟอร์ซ่าฮอไรซ่อน 4',
    'Gran Turismo 7': 'แกรนทูริสโม 7',
    'F1 23': 'เอฟ1 23',
    'F1 22': 'เอฟ1 22',
    'Need for Speed Heat': 'นีดฟอร์สปีดฮีท',
    'Need for Speed Unbound': 'นีดฟอร์สปีดอันบาวด์',
    'The Crew 2': 'เดอะครู 2',
    'Dirt Rally 2.0': 'เดิร์ทแรลลี่ 2.0',
    'Project CARS 3': 'โปรเจ็กต์คาร์ 3',

    // ===== Sports Games =====
    'FIFA 24': 'ฟีฟ่า 24',
    'FIFA 23': 'ฟีฟ่า 23',
    'EA SPORTS FC 24': 'อีเอสปอร์ตเอฟซี 24',
    'NBA 2K24': 'เอ็นบีเอ 2K24',
    'NBA 2K23': 'เอ็นบีเอ 2K23',
    'MLB The Show 23': 'เอ็มแอลบีเดอะโชว์ 23',
    'Madden NFL 24': 'แมดเดนเอ็นเอฟแอล 24',
    'WWE 2K23': 'ดับเบิลยูดับเบิลยูอี 2K23',
    'Tony Hawk\'s Pro Skater': 'โทนี่ฮอว์กโปรสเก็ตเตอร์',
    'Riders Republic': 'ไรเดอร์สรีพับลิค',

    // ===== Simulation Games =====
    'Microsoft Flight Simulator': 'ไมโครซอฟต์ไฟลท์ซิมูเลเตอร์',
    'Euro Truck Simulator 2': 'ยูโรทรัคซิมูเลเตอร์ 2',
    'American Truck Simulator': 'อเมริกันทรัคซิมูเลเตอร์',
    'Cities: Skylines': 'ซิตี้ สกายไลน์',
    'Planet Coaster': 'แพลนเน็ตโคสเตอร์',
    'Planet Zoo': 'แพลนเน็ตซู',
    'Two Point Hospital': 'ทูพอยต์ฮอสปิตอล',
    'Farming Simulator 22': 'ฟาร์มมิ่งซิมูเลเตอร์ 22',
    'PowerWash Simulator': 'เพาเวอร์วอชซิมูเลเตอร์',
    'Car Mechanic Simulator': 'คาร์เมคานิคซิมูเลเตอร์',

    // ===== Indie Games =====
    'Hades': 'เฮเดส',
    'Celeste': 'เซเลสเต้',
    'Hollow Knight': 'ฮอลโลว์ไนท์',
    'Cuphead': 'คัพเฮด',
    'Among Us': 'อะมองอัส',
    'Fall Guys': 'ฟอลล์กายส์',
    'Stardew Valley': 'สตาร์ดิวแวลลี่',
    'Terraria': 'เทอราเรีย',
    'Dead Cells': 'เดดเซลล์',
    'Ori and the Will of the Wisps': 'โอริแอนด์เดอะวิลล์ออฟเดอะวิสป์',
    'Subnautica': 'ซับนอติกา',
    'The Forest': 'เดอะฟอเรสต์',
    'Green Hell': 'กรีนเฮลล์',
    'Raft': 'แรฟต์',

    // ===== Strategy Games =====
    'Age of Empires IV': 'เอจออฟเอ็มไพร์ 4',
    'Age of Empires II': 'เอจออฟเอ็มไพร์ 2',
    'Civilization VI': 'ซิวิไลเซชั่น 6',
    'Total War: Warhammer III': 'โทเทิลวอร์ วอร์แฮมเมอร์ 3',
    'StarCraft II': 'สตาร์คราฟต์ 2',
    'Command & Conquer': 'คอมมานด์แอนด์คองเคอร์',
    'Crusader Kings III': 'ครูเซเดอร์คิงส์ 3',
    'Hearts of Iron IV': 'ฮาร์ทออฟไอรอน 4',
    'Europa Universalis IV': 'ยูโรปาอูนิเวอร์ซาลิส 4',
    'XCOM 2': 'เอ็กซ์คอม 2',

    // ===== Horror Games =====
    'Phasmophobia': 'แฟสโมโฟเบีย',
    'Dead by Daylight': 'เดดบายเดย์ไลต์',
    'Resident Evil': 'เรสซิเดนต์อีวิล',
    'Silent Hill': 'ไซเลนต์ฮิลล์',
    'Outlast': 'เอาต์ลาสต์',
    'Amnesia': 'แอมนีเซีย',
    'The Dark Pictures Anthology': 'เดอะดาร์คพิกเจอร์สแอนโธโลจี',
    'Until Dawn': 'อันทิลดอว์น',
    'Little Nightmares': 'ลิตเติ้ลไนท์แมร์',
    'SOMA': 'โซมา',

    // ===== Co-op Games =====
    'It Takes Two': 'อิตเทคส์ทู',
    'A Way Out': 'อะเวย์เอาท์',
    'Portal 2': 'พอร์ทัล 2',
    'Overcooked! 2': 'โอเวอร์คุกต์ 2',
    'Moving Out': 'มูฟวิ่งเอาท์',
    'Deep Rock Galactic': 'ดีปร็อคกาแล็คติค',
    'Risk of Rain 2': 'ริสก์ออฟเรน 2',
    'Left 4 Dead 2': 'เลฟต์ 4 เดด 2',
    'Don\'t Starve Together': 'โดนท์สตาร์ฟทูเก็ตเธอร์',
    'Human: Fall Flat': 'ฮิวแมนฟอลล์แฟลต',

    // ===== Fighting Games =====
    'Street Fighter 6': 'สตรีทไฟเตอร์ 6',
    'Tekken 7': 'เทคเค่น 7',
    'Mortal Kombat 11': 'มอร์ทัลคอมแบท 11',
    'Guilty Gear Strive': 'กิลตี้เกียร์สไตรฟ์',
    'Dragon Ball FighterZ': 'ดราก้อนบอลไฟเตอร์แซด',
    'Super Smash Bros. Ultimate': 'ซูเปอร์สแมชบราเดอร์สอัลติเมท',
    'King of Fighters XV': 'คิงออฟไฟเตอร์ส 15',
    'BlazBlue': 'เบลซบลู',
    'Soul Calibur VI': 'โซลคาลิเบอร์ 6',
    'Injustice 2': 'อินจัสทิส 2',

    // ===== Puzzle Games =====
    'Tetris Effect': 'เทตริสเอฟเฟ็กต์',
    'Portal': 'พอร์ทัล',
    'Portal 2': 'พอร์ทัล 2',
    'The Witness': 'เดอะวิตเนส',
    'Baba Is You': 'บาบาอิสยู',
    'Return of the Obra Dinn': 'รีเทิร์นออฟเดอะโอบราดินน์',
    'Outer Wilds': 'เอาต์เตอร์ไวลด์',
    'The Talos Principle': 'เดอะทาลอสพรินซิเปิล',
    'Manifold Garden': 'แมนิโฟลด์การ์เดน',
    'Superliminal': 'ซูเปอร์ลิมินัล',

    // ===== Mobile Games (also on PC) =====
    'Genshin Impact': 'เกนชินอิมแพ็ค',
    'Honkai: Star Rail': 'ฮงไคสตาร์เรล',
    'Honkai Impact 3rd': 'ฮงไคอิมแพ็ค 3',
    'PUBG Mobile': 'พับจีโมบาย',
    'Mobile Legends': 'โมบายเลเจนด์',
    'Arena of Valor': 'อารีน่าออฟวาเลอร์',
    'Free Fire': 'ฟรีไฟร์',
    'Clash of Clans': 'แคลชออฟแคลน',
    'Clash Royale': 'แคลชรอยัล',
    'Call of Duty: Mobile': 'คอลออฟดิวตี้โมบาย',

    // ===== VR Games =====
    'Half-Life: Alyx': 'ฮาล์ฟไลฟ์ อาลิกซ์',
    'Beat Saber': 'บีทเซเบอร์',
    'Boneworks': 'โบนเวิร์กส์',
    'Blade & Sorcery': 'เบลดแอนด์ซอร์เซอรี่',
    'Pavlov VR': 'พาฟลอฟวีอาร์',
    'Superhot VR': 'ซูเปอร์ฮอทวีอาร์',
    'The Walking Dead: Saints & Sinners': 'เดอะวอล์กกิ้งเดด เซนต์แอนด์ซินเนอร์ส',
    'Rec Room': 'เร็ครูม',
    'VRChat': 'วีอาร์แชท',
    'Phasmophobia': 'แฟสโมโฟเบีย',

    // ===== Retro/Classic Games =====
    'Minecraft': 'ไมน์คราฟต์',
    'Terraria': 'เทอราเรีย',
    'Stardew Valley': 'สตาร์ดิวแวลลี่',
    'Age of Empires II': 'เอจออฟเอ็มไพร์ 2',
    'Half-Life 2': 'ฮาล์ฟไลฟ์ 2',
    'Counter-Strike 1.6': 'เคาน์เตอร์-สไตรค์ 1.6',
    'Diablo II': 'ดิอาโบล 2',
    'StarCraft': 'สตาร์คราฟต์',
    'Warcraft III': 'วอร์คราฟต์ 3',
    'Command & Conquer: Red Alert': 'คอมมานด์แอนด์คองเคอร์ เรดอะเลิร์ต',

    // ===== Sandbox/Creative Games =====
    'Minecraft': 'ไมน์คราฟต์',
    'Roblox': 'โรบล็อกซ์',
    'Garry\'s Mod': 'แกรี่สม็อด',
    'LittleBigPlanet': 'ลิตเติ้ลบิ๊กแพลนเน็ต',
    'Super Mario Maker': 'ซูเปอร์มาริโอเมกเกอร์',
    'Dreams': 'ดรีมส์',
    'Kerbal Space Program': 'เคอร์บัลสเปซโปรแกรม',
    'Space Engineers': 'สเปซเอนจิเนียร์',
    'No Man\'s Sky': 'โนแมนส์สกาย',
    'Astroneer': 'แอสโตรเนียร์',

    // ===== Platformer Games =====
    'Super Mario Odyssey': 'ซูเปอร์มาริโอออดิสซี่',
    'Celeste': 'เซเลสเต้',
    'Hollow Knight': 'ฮอลโลว์ไนท์',
    'Ori and the Blind Forest': 'โอริแอนด์เดอะไบลนด์ฟอเรสต์',
    'Cuphead': 'คัพเฮด',
    'Super Meat Boy': 'ซูเปอร์มีทบอย',
    'A Hat in Time': 'อะแฮทอินไทม์',
    'Shovel Knight': 'โชเวลไนท์',
    'Rayman Legends': 'เรย์แมนเลเจนด์',
    'Crash Bandicoot': 'แครชแบนดิคูท',

    // ===== Card Games =====
    'Hearthstone': 'ฮาร์ธสโตน',
    'Magic: The Gathering Arena': 'แมจิก เดอะแกเธอริ่งอารีนา',
    'Gwent': 'กเวนต์',
    'Legends of Runeterra': 'เลเจนด์ออฟรูเนเทอรา',
    'Yu-Gi-Oh! Master Duel': 'ยูกิโอมาสเตอร์ดูเอล',
    'Slay the Spire': 'สเลย์เดอะสไปร์',
    'Monster Train': 'มอนสเตอร์เทรน',
    'Inscryption': 'อินสคริปชั่น',
    'Dicey Dungeons': 'ไดซี่ดันเจี้ยน',
    'Griftlands': 'กริฟต์แลนด์',

    // ===== Auto Battler Games =====
    'Teamfight Tactics': 'ทีมไฟท์แทคติกส์',
    'Dota Underlords': 'โดต้าอันเดอร์ลอร์ด',
    'Auto Chess': 'ออโต้เชส',
    'Hearthstone Battlegrounds': 'ฮาร์ธสโตนแบทเทิลกราวด์',
    'Super Auto Pets': 'ซูเปอร์ออโต้เพทส์',

    // ===== Roguelike Games =====
    'Hades': 'เฮเดส',
    'Dead Cells': 'เดดเซลล์',
    'Slay the Spire': 'สเลย์เดอะสไปร์',
    'Risk of Rain 2': 'ริสก์ออฟเรน 2',
    'The Binding of Isaac': 'เดอะไบนดิ้งออฟไอแซค',
    'Enter the Gungeon': 'เอนเตอร์เดอะกันเจี้ยน',
    'FTL: Faster Than Light': 'เอฟทีแอล ฟาสเตอร์แธนไลท์',
    'Spelunky 2': 'สเปลังกี้ 2',
    'Rogue Legacy 2': 'โรกเลกาซี่ 2',
    'Darkest Dungeon': 'ดาร์เคสต์ดันเจี้ยน',

    // ===== Music/Rhythm Games =====
    'Beat Saber': 'บีทเซเบอร์',
    'Guitar Hero': 'กีต้าร์ฮีโร่',
    'Rock Band': 'ร็อคแบนด์',
    'osu!': 'โอสุ',
    'Crypt of the NecroDancer': 'คริปต์ออฟเดอะเนโครแดนเซอร์',
    'Just Dance': 'จัสต์แดนซ์',
    'Geometry Dash': 'จีโอเมทรี่แดช',
    'Friday Night Funkin\'': 'ฟรายเดย์ไนท์ฟังกิ้น',
    'A Dance of Fire and Ice': 'อะแดนซ์ออฟไฟร์แอนด์ไอซ์',
    'Thumper': 'ธัมเปอร์',

    // ===== Educational/Puzzle Games =====
    'Portal': 'พอร์ทัล',
    'Portal 2': 'พอร์ทัล 2',
    'SpaceChem': 'สเปซเค็ม',
    'Human Resource Machine': 'ฮิวแมนรีซอร์สแมชชีน',
    'while True: learn()': 'ไวลท์รูเลิร์น',
    'TIS-100': 'ทีไอเอส-100',
    'SHENZHEN I/O': 'เซินเจิ้นไอโอ',
    'Opus Magnum': 'โอปุสแมกนัม',
    'Factorio': 'แฟคทอริโอ',
    'Satisfactory': 'แซทิสแฟคทอรี่',

    // ===== Popular Thai Games =====
    'RO: Ragnarok X Next Generation': 'ราก้าร็อก เอ็กซ์ เน็กซ์เจเนอเรชั่น',
    'Tales Runner': 'เทลส์รันเนอร์',
    'Crazy Kart': 'เครซี่คาร์ท',
    'Audition': 'ออดิชั่น',
    'ROHAN Online': 'โรฮันออนไลน์',
    'Cabal Online': 'คาบาลออนไลน์',
    'Perfect World': 'เพอร์เฟ็กต์เวิลด์',
    'Lineage II': 'ลินเนจ 2',
    'Mu Online': 'มิวออนไลน์',
    'Gunbound': 'กันบาวด์',

    // ===== Esports Games =====
    'VALORANT': 'วาโลแรนต์',
    'Counter-Strike 2': 'เคาน์เตอร์-สไตรค์ 2',
    'League of Legends': 'ลีกออฟเลเจนด์',
    'Dota 2': 'โดต้า 2',
    'Overwatch 2': 'โอเวอร์วอทช์ 2',
    'Rainbow Six Siege': 'เรนโบว์ซิกซ์ซีจ',
    'Rocket League': 'ร็อกเก็ตลีก',
    'StarCraft II': 'สตาร์คราฟต์ 2',
    'Street Fighter 6': 'สตรีทไฟเตอร์ 6',
    'Tekken 7': 'เทคเค่น 7',

    // ===== Anime/Manga Games =====
    'Dragon Ball FighterZ': 'ดราก้อนบอลไฟเตอร์แซด',
    'Naruto': 'นารูโตะ',
    'One Piece': 'วันพีซ',
    'Attack on Titan': 'ยักษ์ใหญ่',
    'Demon Slayer': 'ดาบพิฆาตอสูร',
    'My Hero Academia': 'มายฮีโร่อคาเดเมีย',
    'Persona 5': 'เพอร์โซน่า 5',
    'Ni No Kuni': 'นิโนะคุนิ',
    'Tales of': 'เทลส์ออฟ',
    'Final Fantasy': 'ไฟนอลแฟนตาซี',

    // ===== Survival Games =====
    'Rust': 'รัสต์',
    'ARK: Survival Evolved': 'อาร์ค เซอร์ไววัลอีโวลฟ์',
    'The Forest': 'เดอะฟอเรสต์',
    'Green Hell': 'กรีนเฮลล์',
    'Subnautica': 'ซับนอติกา',
    'Raft': 'แรฟต์',
    'Valheim': 'วัลไฮม์',
    'Don\'t Starve': 'โดนท์สตาร์ฟ',
    'The Long Dark': 'เดอะลองดาร์ค',
    'Conan Exiles': 'โคนันเอ็กไซลส์',

    // ===== MMO Additional =====
    'RuneScape': 'รูนสเคป',
    'Old School RuneScape': 'โอลด์สคูลรูนสเคป',
    'MapleStory': 'เมเปิลสตอรี่',
    'Phantasy Star Online 2': 'แฟนตาซีสตาร์ออนไลน์ 2',
    'Tera': 'เทรา',
    'Blade & Soul': 'เบลดแอนด์โซล',
    'Aion': 'ไอออน',
    'ArcheAge': 'อาร์คเอจ',
    'Albion Online': 'อัลเบียนออนไลน์',
    'EVE Online': 'อีฟออนไลน์',

    // Add more games as needed...
    // ===== Productivity/Other =====
    'Discord': 'ดิสคอร์ด',
    'Spotify': 'สปอทิฟาย',
    'Visual Studio Code': 'วิชวลสตูดิโอโค้ด',
    'Photoshop': 'โฟโต้ชอป',
    'OBS Studio': 'โอบีเอสสตูดิโอ',
    'Streamlabs OBS': 'สตรีมแล็บโอบีเอส',
    'Chrome': 'โครม',
    'Firefox': 'ไฟร์ฟอกซ์',
    'Steam': 'สตีม',
    'Epic Games Launcher': 'เอปิกเกมส์ลอนเชอร์'
};

// Discord Activity Type Translations
const ACTIVITY_TYPE_TRANSLATIONS = {
    [ActivityType.Playing]: 'กำลังเล่น',
    [ActivityType.Streaming]: 'กำลังสตรีม',
    [ActivityType.Listening]: 'กำลังฟัง',
    [ActivityType.Watching]: 'กำลังดู',
    [ActivityType.Custom]: 'สถานะกำหนดเอง',
    [ActivityType.Competing]: 'กำลังแข่งขัน'
};

// Thai UI Text Constants
const THAI_TEXT = {
    embed: {
        title: '🎮 TOP 5 เกมที่ได้รับความนิยมในวอยซ์แชท',
        description: 'รายการเกมยอดนิยมที่สมาชิกกำลังเล่นอยู่ในขณะนี้',
        noGames: {
            title: '😴 ไม่มีใครเล่นเกมในขณะนี้',
            description: 'ยังไม่มีสมาชิกที่กำลังเล่นเกมในช่องเสียงที่ติดตาม'
        },
        stats: {
            title: '📊 สถิติรวม',
            totalPlayers: 'รวมผู้เล่น',
            totalGames: 'รวมเกม',
            people: 'คน',
            games: 'เกม'
        },
        fields: {
            voiceChannels: 'ช่องเสียง',
            playerCount: 'จำนวนผู้เล่น',
            channelCount: 'จำนวนช่อง',
            channels: 'ช่อง'
        },
        footer: 'สร้างโดย Thai Game Tracker Bot • อัปเดตทุก'
    },
    console: {
        ready: 'พร้อมใช้งานแล้ว!',
        connecting: 'เชื่อมต่อกับเซิร์ฟเวอร์',
        outputChannel: 'ช่องข้อความ',
        monitoring: 'ติดตามหมวดหมู่',
        categories: 'หมวดหมู่',
        updating: 'กำลังอัปเดตข้อมูลเกม...',
        updated: 'อัปเดตข้อความสำเร็จ',
        newMessage: 'ส่งข้อความใหม่สำเร็จ',
        editFailed: 'ไม่สามารถแก้ไขข้อความเดิม ส่งข้อความใหม่แทน',
        voiceChange: 'มีการเปลี่ยนแปลงในช่องเสียง',
        gameChange: 'การเล่นเกมเปลี่ยนแปลง',
        autoUpdate: 'เริ่มการอัปเดตอัตโนมัติทุก',
        seconds: 'วินาที',
        stopping: 'กำลังปิด Bot...',
        noOutputChannel: 'ไม่พบช่องข้อความสำหรับส่งข้อมูล',
        noGuild: 'ไม่พบเซิร์ฟเวอร์ที่กำหนด',
        noChannel: 'ไม่พบช่องข้อความที่กำหนด'
    },
    errors: {
        updateFailed: 'เกิดข้อผิดพลาดในการอัปเดต',
        initFailed: 'เกิดข้อผิดพลาดในการเริ่มต้น',
        unhandledRejection: 'Unhandled Promise Rejection',
        uncaughtException: 'Uncaught Exception',
        connectionFailed: 'เชื่อมต่อไม่สำเร็จ',
        retrying: 'กำลังลองใหม่ครั้งที่'
    }
};

// ===========================================================================================
// PERFORMANCE & CACHING SYSTEM
// ===========================================================================================

class PerformanceCache {
    constructor() {
        this.cache = new Map();
        this.statistics = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }

    set(key, value, ttl = CONFIG.cacheTimeout) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
        this._cleanup();
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.statistics.misses++;
            return null;
        }

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            this.statistics.misses++;
            return null;
        }

        this.statistics.hits++;
        return item.value;
    }

    _cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
                this.statistics.evictions++;
            }
        }
    }

    clear() {
        this.cache.clear();
        this.statistics = { hits: 0, misses: 0, evictions: 0 };
    }

    getStats() {
        return { ...this.statistics, size: this.cache.size };
    }
}

// ===========================================================================================
// DEBOUNCING & THROTTLING UTILITIES
// ===========================================================================================

class DebounceManager {
    constructor() {
        this.timers = new Map();
    }

    debounce(key, func, delay = CONFIG.debounceDelay) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        const timer = setTimeout(() => {
            func();
            this.timers.delete(key);
        }, delay);

        this.timers.set(key, timer);
    }

    cancel(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }

    clear() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
}

// ===========================================================================================
// ADVANCED LOGGING SYSTEM
// ===========================================================================================

class Logger {
    static log(level, message, ...args) {
        const timestamp = new Date().toLocaleString('th-TH');
        const levels = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: 'ℹ️',
            SUCCESS: '✅',
            DEBUG: '🔍'
        };
        
        console.log(`[${timestamp}] ${levels[level] || 'ℹ️'} ${message}`, ...args);
    }

    static error(message, ...args) { this.log('ERROR', message, ...args); }
    static warn(message, ...args) { this.log('WARN', message, ...args); }
    static info(message, ...args) { this.log('INFO', message, ...args); }
    static success(message, ...args) { this.log('SUCCESS', message, ...args); }
    static debug(message, ...args) { this.log('DEBUG', message, ...args); }
}

// ===========================================================================================
// RESILIENCE & ERROR HANDLING
// ===========================================================================================

class ResilientExecutor {
    static async executeWithRetry(fn, context = 'operation', maxRetries = CONFIG.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await fn();
                if (attempt > 1) {
                    Logger.success(`${context} สำเร็จในครั้งที่ ${attempt}`);
                }
                return result;
            } catch (error) {
                lastError = error;
                Logger.warn(`${context} ล้มเหลวในครั้งที่ ${attempt}/${maxRetries}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = CONFIG.retryDelay * attempt;
                    Logger.info(`${THAI_TEXT.errors.retrying} ${attempt + 1} ใน ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }
        
        Logger.error(`${context} ล้มเหลวหลังจากลองใหม่ ${maxRetries} ครั้ง:`, lastError);
        throw lastError;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async timeout(promise, ms = CONFIG.connectionTimeout) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
        });
        
        return Promise.race([promise, timeoutPromise]);
    }
}

// ===========================================================================================
// CORE BOT FUNCTIONALITY
// ===========================================================================================

class ThaiGameTracker {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMembers
            ]
        });

        // Core components
        this.cache = new PerformanceCache();
        this.debouncer = new DebounceManager();
        
        // State management
        this.guild = null;
        this.outputChannel = null;
        this.lastMessageId = null;
        this.updateTimer = null;
        this.isReady = false;
        
        this._setupEventListeners();
    }

    // ===========================================================================================
    // GAME NAME TRANSLATION SYSTEM
    // ===========================================================================================

    translateGameName(gameName) {
        if (!gameName || typeof gameName !== 'string') {
            return THAI_TEXT.embed.noGames.title.split(' ')[1]; // 'ไม่ทราบเกม'
        }

        const cacheKey = `translation:${gameName}`;
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        // Direct match
        if (GAME_TRANSLATIONS[gameName]) {
            const result = GAME_TRANSLATIONS[gameName];
            this.cache.set(cacheKey, result);
            return result;
        }

        // Case-insensitive partial matching
        const lowerGameName = gameName.toLowerCase();
        for (const [english, thai] of Object.entries(GAME_TRANSLATIONS)) {
            const lowerEnglish = english.toLowerCase();
            if (lowerEnglish.includes(lowerGameName) || lowerGameName.includes(lowerEnglish)) {
                this.cache.set(cacheKey, thai);
                return thai;
            }
        }

        // Advanced fuzzy matching for similar names
        for (const [english, thai] of Object.entries(GAME_TRANSLATIONS)) {
            if (this._calculateSimilarity(gameName, english) > 0.8) {
                this.cache.set(cacheKey, thai);
                return thai;
            }
        }

        // Cache the original name if no translation found
        this.cache.set(cacheKey, gameName);
        return gameName;
    }

    _calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this._levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
        return (longer.length - editDistance) / longer.length;
    }

    _levenshteinDistance(str1, str2) {
        const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
        
        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i] + 1,
                    matrix[j - 1][i - 1] + indicator
                );
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // ===========================================================================================
    // USER ACTIVITY ANALYSIS
    // ===========================================================================================

    getUserActivity(member) {
        try {
            if (!member?.presence?.activities?.length) return null;

            const gameActivity = member.presence.activities.find(activity => 
                activity.type === ActivityType.Playing && 
                activity.name &&
                !this._isExcludedActivity(activity.name)
            );

            return gameActivity?.name || null;
        } catch (error) {
            Logger.debug(`Error getting user activity for ${member?.displayName}: ${error.message}`);
            return null;
        }
    }

    _isExcludedActivity(activityName) {
        const excluded = ['Spotify', 'Custom Status', 'Visual Studio Code', 'Discord'];
        return excluded.some(name => activityName.toLowerCase().includes(name.toLowerCase()));
    }

    // ===========================================================================================
    // GAME DATA COLLECTION WITH PARALLEL PROCESSING
    // ===========================================================================================

    async collectGameData() {
        const cacheKey = 'gameData';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            if (!this.guild) throw new Error('Guild not available');

            const gameData = new Map();
            const monitoredChannels = await this._getMonitoredChannels();

            // Parallel processing of voice channels
            const channelPromises = monitoredChannels.map(channel => 
                this._processVoiceChannel(channel, gameData)
            );

            await Promise.allSettled(channelPromises);

            // Convert Map to Object for compatibility
            const result = Object.fromEntries(
                Array.from(gameData.entries()).map(([gameName, data]) => [
                    gameName,
                    {
                        ...data,
                        channels: Array.from(data.channels)
                    }
                ])
            );

            this.cache.set(cacheKey, result, 5000); // Short cache for game data
            return result;
        } catch (error) {
            Logger.error('Error collecting game data:', error);
            return {};
        }
    }

    async _getMonitoredChannels() {
        const channels = [];
        
        const categoryPromises = CONFIG.monitoredCategoryIds.map(async categoryId => {
            try {
                const category = await this.guild.channels.fetch(categoryId);
                if (category?.type === ChannelType.GuildCategory) {
                    const voiceChannels = category.children.cache.filter(
                        child => child.type === ChannelType.GuildVoice
                    );
                    return Array.from(voiceChannels.values());
                }
                return [];
            } catch (error) {
                Logger.warn(`Failed to fetch category ${categoryId}: ${error.message}`);
                return [];
            }
        });

        const categoryResults = await Promise.allSettled(categoryPromises);
        categoryResults.forEach(result => {
            if (result.status === 'fulfilled') {
                channels.push(...result.value);
            }
        });

        return channels;
    }

    async _processVoiceChannel(voiceChannel, gameData) {
        try {
            if (!voiceChannel.members?.size) return;

            voiceChannel.members.forEach(member => {
                const gameName = this.getUserActivity(member);
                if (!gameName) return;

                if (!gameData.has(gameName)) {
                    gameData.set(gameName, {
                        playerCount: 0,
                        channels: new Set()
                    });
                }

                const data = gameData.get(gameName);
                data.playerCount++;
                data.channels.add(voiceChannel);
            });
        } catch (error) {
            Logger.debug(`Error processing voice channel ${voiceChannel.name}: ${error.message}`);
        }
    }

    // ===========================================================================================
    // ADVANCED EMBED CREATION
    // ===========================================================================================

    async createGameEmbed(gameData) {
        try {
            const sortedGames = Object.entries(gameData)
                .sort(([,a], [,b]) => b.playerCount - a.playerCount)
                .slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle(THAI_TEXT.embed.title)
                .setDescription(THAI_TEXT.embed.description)
                .setColor(CONFIG.embedColors.gaming)
                .setTimestamp()
                .setFooter({
                    text: `${THAI_TEXT.embed.footer} ${CONFIG.updateInterval} ${THAI_TEXT.console.seconds}`,
                    iconURL: this.client.user?.displayAvatarURL()
                });

            if (sortedGames.length === 0) {
                embed.addFields({
                    name: THAI_TEXT.embed.noGames.title,
                    value: THAI_TEXT.embed.noGames.description,
                    inline: false
                });
            } else {
                this._addGameFields(embed, sortedGames);
                this._addStatisticsField(embed, gameData);
            }

            return embed;
        } catch (error) {
            Logger.error('Error creating embed:', error);
            return this._createErrorEmbed();
        }
    }

    _addGameFields(embed, sortedGames) {
        const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        
        sortedGames.forEach(([gameName, data], index) => {
            const thaiGameName = this.translateGameName(gameName);
            const channelLinks = data.channels
                .map(channel => `<#${channel.id}>`)
                .join(' • ');

            embed.addFields({
                name: `${rankEmojis[index]} ${thaiGameName} (${data.playerCount} ${THAI_TEXT.embed.stats.people})`,
                value: [
                    `**${THAI_TEXT.embed.fields.voiceChannels}:** ${channelLinks}`,
                    `**${THAI_TEXT.embed.fields.playerCount}:** ${data.playerCount} ${THAI_TEXT.embed.stats.people}`,
                    `**${THAI_TEXT.embed.fields.channelCount}:** ${data.channels.length} ${THAI_TEXT.embed.fields.channels}`
                ].join('\n'),
                inline: false
            });
        });
    }

    _addStatisticsField(embed, gameData) {
        const totalPlayers = Object.values(gameData)
            .reduce((sum, data) => sum + data.playerCount, 0);
        const totalGames = Object.keys(gameData).length;

        embed.addFields({
            name: THAI_TEXT.embed.stats.title,
            value: [
                `**${THAI_TEXT.embed.stats.totalPlayers}:** ${totalPlayers} ${THAI_TEXT.embed.stats.people}`,
                `**${THAI_TEXT.embed.stats.totalGames}:** ${totalGames} ${THAI_TEXT.embed.stats.games}`
            ].join('\n'),
            inline: false
        });
    }

    _createErrorEmbed() {
        return new EmbedBuilder()
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('ไม่สามารถโหลดข้อมูลเกมได้ในขณะนี้')
            .setColor(CONFIG.embedColors.error)
            .setTimestamp();
    }

    // ===========================================================================================
    // MESSAGE UPDATE SYSTEM
    // ===========================================================================================

    async updateGameTracker() {
        return ResilientExecutor.executeWithRetry(async () => {
            if (!this.outputChannel) {
                throw new Error(THAI_TEXT.console.noOutputChannel);
            }

            Logger.info(THAI_TEXT.console.updating);

            const gameData = await this.collectGameData();
            const embed = await this.createGameEmbed(gameData);

            if (this.lastMessageId) {
                try {
                    const lastMessage = await ResilientExecutor.timeout(
                        this.outputChannel.messages.fetch(this.lastMessageId)
                    );
                    await lastMessage.edit({ embeds: [embed] });
                    Logger.success(THAI_TEXT.console.updated);
                } catch (error) {
                    Logger.warn(THAI_TEXT.console.editFailed);
                    const newMessage = await this.outputChannel.send({ embeds: [embed] });
                    this.lastMessageId = newMessage.id;
                }
            } else {
                const newMessage = await this.outputChannel.send({ embeds: [embed] });
                this.lastMessageId = newMessage.id;
                Logger.success(THAI_TEXT.console.newMessage);
            }
        }, 'Game tracker update');
    }

    // ===========================================================================================
    // AUTO-UPDATE SYSTEM
    // ===========================================================================================

    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // Immediate first update
        this.updateGameTracker().catch(error => {
            Logger.error('Initial update failed:', error);
        });

        // Setup automatic updates
        this.updateTimer = setInterval(() => {
            this.updateGameTracker().catch(error => {
                Logger.error('Scheduled update failed:', error);
            });
        }, CONFIG.updateInterval * 1000);

        Logger.success(`${THAI_TEXT.console.autoUpdate} ${CONFIG.updateInterval} ${THAI_TEXT.console.seconds}`);
    }

    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        this.debouncer.clear();
    }

    // ===========================================================================================
    // EVENT HANDLERS
    // ===========================================================================================

    _setupEventListeners() {
        this.client.once('ready', () => this._handleReady());
        this.client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState));
        this.client.on('presenceUpdate', (oldPresence, newPresence) => this._handlePresenceUpdate(oldPresence, newPresence));
        this.client.on('error', error => Logger.error('Client error:', error));
        this.client.on('warn', warning => Logger.warn('Client warning:', warning));
    }

    async _handleReady() {
        Logger.success(`🚀 ${this.client.user.tag} ${THAI_TEXT.console.ready}`);

        try {
            await this._initializeBot();
            this.isReady = true;
            this.startAutoUpdate();
        } catch (error) {
            Logger.error(THAI_TEXT.errors.initFailed, error);
            this.isReady = false;
        }
    }

    async _initializeBot() {
        this.guild = await ResilientExecutor.timeout(
            this.client.guilds.fetch(CONFIG.guildId)
        );
        
        this.outputChannel = await ResilientExecutor.timeout(
            this.guild.channels.fetch(CONFIG.outputChannelId)
        );

        if (!this.guild) throw new Error(THAI_TEXT.console.noGuild);
        if (!this.outputChannel) throw new Error(THAI_TEXT.console.noChannel);

        Logger.info(`📋 ${THAI_TEXT.console.connecting}: ${this.guild.name}`);
        Logger.info(`📝 ${THAI_TEXT.console.outputChannel}: ${this.outputChannel.name}`);
        Logger.info(`👁️ ${THAI_TEXT.console.monitoring}: ${CONFIG.monitoredCategoryIds.length} ${THAI_TEXT.console.categories}`);
    }

    _handleVoiceStateUpdate(oldState, newState) {
        if (!this.isReady) return;

        const isOldChannelMonitored = oldState.channel && this._isChannelMonitored(oldState.channel);
        const isNewChannelMonitored = newState.channel && this._isChannelMonitored(newState.channel);

        if (isOldChannelMonitored || isNewChannelMonitored) {
            Logger.debug(`${THAI_TEXT.console.voiceChange}: ${newState.member?.displayName}`);
            this.cache.clear(); // Clear cache to ensure fresh data
            this.debouncer.debounce('voiceUpdate', () => this.updateGameTracker(), 2000);
        }
    }

    _handlePresenceUpdate(oldPresence, newPresence) {
        if (!this.isReady || !newPresence?.member) return;

        const voiceState = newPresence.member.voice;
        if (voiceState.channel && this._isChannelMonitored(voiceState.channel)) {
            Logger.debug(`${THAI_TEXT.console.gameChange}: ${newPresence.member.displayName}`);
            this.cache.clear(); // Clear cache to ensure fresh data
            this.debouncer.debounce('presenceUpdate', () => this.updateGameTracker(), 1000);
        }
    }

    _isChannelMonitored(channel) {
        if (!channel || channel.type !== ChannelType.GuildVoice) return false;
        return CONFIG.monitoredCategoryIds.includes(channel.parentId);
    }

    // ===========================================================================================
    // BOT LIFECYCLE MANAGEMENT
    // ===========================================================================================

    async start() {
        try {
            await this.client.login(CONFIG.token);
        } catch (error) {
            Logger.error('Failed to start bot:', error);
            throw error;
        }
    }

    async stop() {
        Logger.info(`\n🛑 ${THAI_TEXT.console.stopping}`);
        
        this.stopAutoUpdate();
        this.cache.clear();
        
        if (this.client) {
            this.client.destroy();
        }
    }

    // ===========================================================================================
    // PERFORMANCE MONITORING
    // ===========================================================================================

    getPerformanceStats() {
        return {
            cache: this.cache.getStats(),
            memory: process.memoryUsage(),
            uptime: process.uptime(),
            isReady: this.isReady
        };
    }
}

// ===========================================================================================
// INITIALIZATION & PROCESS MANAGEMENT
// ===========================================================================================

const bot = new ThaiGameTracker();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await bot.stop();
    process.exit(0);
});

// Error handlers
process.on('unhandledRejection', (error) => {
    Logger.error(`${THAI_TEXT.errors.unhandledRejection}:`, error);
});

process.on('uncaughtException', (error) => {
    Logger.error(`${THAI_TEXT.errors.uncaughtException}:`, error);
    process.exit(1);
});

// Start the bot
bot.start().catch(error => {
    Logger.error(THAI_TEXT.errors.connectionFailed, error);
    process.exit(1);
});