const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, ActivityType } = require('discord.js');
require('dotenv').config();

// ===========================================================================================
// การกำหนดค่าหลัก (CORE CONFIGURATION)
// ===========================================================================================

const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    monitoredCategoryIds: process.env.MONITORED_CATEGORY_IDS?.split(',') || [],
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10,
    showPlayerNames: process.env.SHOW_PLAYER_NAMES === 'true' || false,
    
    // การตั้งค่าประสิทธิภาพ (Performance Settings)
    maxRetries: 3,
    retryDelay: 1000,
    cacheTimeout: 8000,
    debounceDelay: 2000,
    operationTimeout: 6000,
    maxConcurrentScans: 15,
    
    // สีของ Embed (Embed Colors)
    embedColors: {
        primary: '#FF6B35',      // สีหลักสำหรับเกม
        secondary: '#004E89',    // สีรอง
        accent: '#1A936F',       // สีเน้น
        warning: '#FFD23F',      // สีเตือน
        error: '#D62828'         // สีข้อผิดพลาด
    }
};

// ===========================================================================================
// ฐานข้อมูลเกมที่แท้จริง (AUTHENTIC GAMES DATABASE)
// ===========================================================================================

const REAL_GAMES = new Set([
    // === เกมยอดนิยม (Popular Games) ===
    'VALORANT', 'Fortnite', 'League of Legends', 'Counter-Strike 2', 'CS2', 'CS:GO',
    'Apex Legends', 'Minecraft', 'Roblox', 'Grand Theft Auto V', 'GTA V', 'GTA 5',
    'Call of Duty', 'Call of Duty: Modern Warfare', 'Call of Duty: Warzone', 'Call of Duty: Black Ops',
    'Overwatch 2', 'Rocket League', 'Genshin Impact', 'Fall Guys', 'Among Us',
    'FIFA 24', 'FIFA 23', 'EA SPORTS FC 24', 'EA SPORTS FC 25', 'PUBG', 'PUBG: BATTLEGROUNDS',
    'Destiny 2', 'World of Warcraft', 'Dota 2', 'Rainbow Six Siege', 'Battlefield 2042',
    
    // === เกม Steam ยอดนิยม (Steam Popular) ===
    'Counter-Strike: Global Offensive', 'Team Fortress 2', 'Left 4 Dead 2', 'Portal 2', 'Portal',
    'Half-Life 2', 'Half-Life: Alyx', 'Garry\'s Mod', 'Rust', 'ARK: Survival Evolved',
    'Dead by Daylight', 'Phasmophobia', 'Valheim', 'Sea of Thieves', 'It Takes Two',
    'The Forest', 'Green Hell', 'Subnautica', 'Raft', 'Grounded', 'Don\'t Starve Together',
    
    // === เกม RPG (RPG Games) ===
    'The Witcher 3', 'The Witcher 3: Wild Hunt', 'Cyberpunk 2077', 'Elden Ring',
    'Dark Souls', 'Dark Souls III', 'Sekiro: Shadows Die Twice', 'Bloodborne',
    'The Elder Scrolls V: Skyrim', 'Skyrim', 'Fallout 4', 'Fallout 76', 'Fallout: New Vegas',
    'Mass Effect', 'Mass Effect Legendary Edition', 'Dragon Age', 'Final Fantasy XIV',
    'Final Fantasy XV', 'Final Fantasy VII Remake', 'Persona 5', 'Persona 5 Royal',
    'NieR: Automata', 'NieR Replicant', 'Monster Hunter World', 'Monster Hunter Rise',
    'Baldur\'s Gate 3', 'Divinity: Original Sin 2', 'The Outer Worlds', 'Disco Elysium',
    
    // === เกม FPS (FPS Games) ===
    'Titanfall 2', 'Doom Eternal', 'Doom', 'Doom (2016)', 'Wolfenstein', 'Quake Champions',
    'Unreal Tournament', 'Hunt: Showdown', 'Escape from Tarkov', 'Insurgency: Sandstorm',
    'Squad', 'Hell Let Loose', 'Battlefield V', 'Battlefield 1', 'Battlefield 4',
    'Metro Exodus', 'Far Cry 6', 'Far Cry 5', 'Crysis', 'Bioshock', 'Dishonored',
    
    // === เกม Racing (Racing Games) ===
    'Forza Horizon 5', 'Forza Horizon 4', 'Forza Motorsport', 'Gran Turismo 7',
    'F1 23', 'F1 24', 'Need for Speed Heat', 'Need for Speed Unbound', 'The Crew 2',
    'The Crew Motorfest', 'Dirt Rally 2.0', 'Project CARS 3', 'Assetto Corsa',
    'Assetto Corsa Competizione', 'BeamNG.drive', 'Wreckfest', 'GRID Legends',
    
    // === เกม Sports (Sports Games) ===
    'NBA 2K24', 'NBA 2K23', 'MLB The Show 23', 'Madden NFL 24', 'WWE 2K23',
    'Tony Hawk\'s Pro Skater', 'Riders Republic', 'STEEP', 'Session', 'Skater XL',
    'UFC 4', 'Fight Night', 'PGA Tour 2K23', 'Rocket League', 'FIFA Manager',
    
    // === เกม Simulation (Simulation Games) ===
    'Microsoft Flight Simulator', 'Euro Truck Simulator 2', 'American Truck Simulator',
    'Cities: Skylines', 'Cities Skylines', 'Planet Coaster', 'Planet Zoo', 'Two Point Hospital',
    'Farming Simulator 22', 'Farming Simulator 2022', 'PowerWash Simulator',
    'Car Mechanic Simulator', 'House Flipper', 'PC Building Simulator', 'Train Simulator',
    'Snowrunner', 'Mudrunner', 'SpinTires', 'Construction Simulator',
    
    // === เกม Strategy (Strategy Games) ===
    'Age of Empires IV', 'Age of Empires II', 'Age of Empires III', 'Civilization VI',
    'Civilization V', 'Total War: Warhammer III', 'Total War: Rome II', 'StarCraft II',
    'Command & Conquer', 'Crusader Kings III', 'Hearts of Iron IV', 'Europa Universalis IV',
    'XCOM 2', 'XCOM: Enemy Unknown', 'Company of Heroes 3', 'Northgard', 'Frostpunk',
    
    // === เกม Horror (Horror Games) ===
    'Resident Evil', 'Resident Evil 4', 'Resident Evil Village', 'Silent Hill',
    'Outlast', 'Outlast 2', 'Amnesia', 'Amnesia: The Dark Descent', 'Until Dawn',
    'Little Nightmares', 'Little Nightmares II', 'SOMA', 'Alien: Isolation',
    'Dead Space', 'Dead Space Remake', 'The Evil Within', 'Layers of Fear',
    
    // === เกม Fighting (Fighting Games) ===
    'Street Fighter 6', 'Street Fighter V', 'Tekken 7', 'Tekken 8', 'Mortal Kombat 11',
    'Mortal Kombat 1', 'Guilty Gear Strive', 'Dragon Ball FighterZ', 'Super Smash Bros. Ultimate',
    'King of Fighters XV', 'BlazBlue', 'Soul Calibur VI', 'Injustice 2',
    
    // === เกม VR (VR Games) ===
    'Beat Saber', 'Boneworks', 'Blade & Sorcery', 'Pavlov VR', 'Superhot VR',
    'The Walking Dead: Saints & Sinners', 'Rec Room', 'VRChat', 'Job Simulator',
    'Arizona Sunshine', 'Pistol Whip', 'Synth Riders', 'Population: One',
    
    // === เกม Indie ยอดนิยม (Popular Indie Games) ===
    'Hades', 'Celeste', 'Hollow Knight', 'Cuphead', 'Dead Cells', 'Ori and the Will of the Wisps',
    'Ori and the Blind Forest', 'Outer Wilds', 'Return of the Obra Dinn', 'Papers, Please',
    'This War of Mine', 'Katana ZERO', 'Hotline Miami', 'Baba Is You', 'The Witness',
    'The Stanley Parable', 'Limbo', 'Inside', 'Journey', 'Abzu',
    
    // === เกม MMO (MMO Games) ===
    'Guild Wars 2', 'New World', 'Lost Ark', 'Black Desert Online', 'Star Wars: The Old Republic',
    'Path of Exile', 'RuneScape', 'Old School RuneScape', 'MapleStory', 'Phantasy Star Online 2',
    'Elder Scrolls Online', 'Star Trek Online', 'Neverwinter', 'TERA', 'Blade & Soul',
    
    // === เกม Sandbox/Creative (Sandbox/Creative Games) ===
    'Kerbal Space Program', 'Space Engineers', 'No Man\'s Sky', 'Astroneer', 'Scrap Mechanic',
    'Besiege', 'LittleBigPlanet', 'Super Mario Maker', 'Dreams', 'Teardown',
    
    // === เกม Puzzle (Puzzle Games) ===
    'Tetris Effect', 'The Talos Principle', 'Manifold Garden', 'Superliminal',
    'Stephen\'s Sausage Roll', 'Antichamber', 'Fez', 'Monument Valley', 'Braid',
    
    // === เกม Card/Board (Card/Board Games) ===
    'Hearthstone', 'Magic: The Gathering Arena', 'Gwent', 'Legends of Runeterra',
    'Yu-Gi-Oh! Master Duel', 'Slay the Spire', 'Monster Train', 'Inscryption',
    'Dicey Dungeons', 'Griftlands', 'Teamfight Tactics', 'Auto Chess', 'Chess.com',
    
    // === เกม Survival (Survival Games) ===
    'The Long Dark', 'Conan Exiles', '7 Days to Die', 'DayZ', 'State of Decay 2',
    'Project Zomboid', 'Icarus', 'V Rising', 'The Infected', 'Green Hell',
    
    // === เกมใหม่/Trending (New/Trending Games) ===
    'Palworld', 'Lethal Company', 'Pizza Tower', 'Hi-Fi Rush', 'Atomic Heart',
    'Hogwarts Legacy', 'Starfield', 'Spider-Man Remastered', 'God of War',
    'Horizon Zero Dawn', 'Death Stranding', 'Control', 'Alan Wake 2',
    'Lies of P', 'Lords of the Fallen', 'The Last of Us Part I', 'Ghost of Tsushima',
    
    // === เกม Mobile ที่มีบน PC (Mobile Games on PC) ===
    'Honkai: Star Rail', 'Honkai Impact 3rd', 'Clash of Clans', 'Clash Royale',
    'Brawl Stars', 'Pokemon Unite', 'Wild Rift', 'PUBG Mobile', 'Call of Duty: Mobile',
    
    // === เกม Emulator (Emulator Games) ===
    'BlueStacks', 'NoxPlayer', 'MEmu', 'LDPlayer', 'GameLoop', 'MuMu Player',
    
    // === เกมอื่นๆ ยอดนิยม (Other Popular Games) ===
    'Warframe', 'Payday 2', 'Payday 3', 'Red Dead Redemption 2', 'Red Dead Online',
    'Mafia', 'Saints Row', 'Sleeping Dogs', 'Yakuza', 'Yakuza: Like a Dragon',
    'Persona 4 Golden', 'Tales of Arise', 'Scarlet Nexus', 'Code Vein', 'Nioh 2',
    'Remnant: From the Ashes', 'Remnant II', 'Outriders', 'Mass Effect Andromeda',
    'Dragon Age: The Veilguard', 'Diablo IV', 'Diablo III', 'Diablo II: Resurrected',
    'Overwatch', 'Heroes & Generals', 'War Thunder', 'World of Tanks', 'World of Warships',
    'Crossout', 'Enlisted', 'Planetside 2', 'Titanfall', 'Medal of Honor',
    'Watch Dogs: Legion', 'Assassin\'s Creed Valhalla', 'Ghost Recon Breakpoint',
    'The Division 2', 'For Honor', 'Anno 1800', 'SimCity', 'Tropico 6',
    'Surviving Mars', 'Oxygen Not Included', 'RimWorld', 'Prison Architect',
    'Game Dev Tycoon', 'Software Inc.', 'Mad Games Tycoon 2'
]);

// แอปที่ไม่ใช่เกม (Non-Game Applications) - จะถูกกรองออก
const NON_GAME_APPS = new Set([
    'YouTube', 'YouTube Music', 'Twitch', 'Netflix', 'Disney+', 'Prime Video', 'HBO Max',
    'Crunchyroll', 'Spotify', 'Apple Music', 'SoundCloud', 'Deezer', 'Tidal',
    'Discord', 'Slack', 'Telegram', 'WhatsApp', 'Signal', 'Teams', 'Zoom', 'Skype',
    'Chrome', 'Firefox', 'Edge', 'Safari', 'Opera', 'Brave',
    'Visual Studio Code', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro',
    'OBS Studio', 'Streamlabs OBS', 'XSplit', 'NVIDIA Broadcast'
]);

// ===========================================================================================
// ข้อความภาษาไทย (THAI TEXT CONSTANTS)
// ===========================================================================================

const THAI_TEXT = {
    embed: {
        title: '🎮 TOP 5 เกมยอดนิยมในห้องเสียง',
        description: 'เกมที่สมาชิกกำลังเล่นอยู่ในขณะนี้',
        noGames: {
            title: '😴 ไม่มีใครเล่นเกมในขณะนี้',
            description: 'ยังไม่มีสมาชิกที่กำลังเล่นเกมในช่องเสียงที่ติดตาม'
        },
        stats: {
            title: '📊 สถิติเกม',
            totalPlayers: 'รวมผู้เล่น',
            totalGames: 'รวมเกม',
            people: 'คน',
            games: 'เกม',
            channels: 'ช่อง',
            mostPopularToday: '🎯 ยอดนิยมวันนี้',
            avgDuration: '🕒 ระยะเวลาเฉลี่ย',
            activeChannels: 'ช่องที่ใช้งาน',
            minutes: 'นาที'
        },
        fields: {
            voiceChannels: 'ช่องเสียง',
            playerCount: 'จำนวนผู้เล่น',
            channelCount: 'จำนวนช่อง',
            players: 'ผู้เล่น',
            sessionTime: 'เวลาเซสชัน'
        },
        footer: 'สร้างโดย ZWIPE X MARJEZSOM'
    },
    console: {
        ready: 'พร้อมใช้งานแล้ว!',
        connecting: 'เชื่อมต่อกับเซิร์ฟเวอร์',
        outputChannel: 'ช่องข้อความ',
        monitoring: 'ติดตามหมวดหมู่',
        categories: 'หมวดหมู่',
        updating: 'กำลังสแกนเกมทั้งหมด...',
        updated: 'อัปเดตข้อมูลเกมสำเร็จ',
        newMessage: 'ส่งข้อความใหม่สำเร็จ',
        editFailed: 'แก้ไขข้อความเดิมไม่ได้ ส่งใหม่แทน',
        gameChange: 'ตรวจพบการเปลี่ยนแปลงเกม',
        voiceChange: 'ตรวจพบการเปลี่ยนแปลงในห้องเสียง',
        autoUpdate: 'เริ่มการสแกนอัตโนมัติทุก',
        seconds: 'วินาที',
        stopping: 'กำลังปิด Bot...',
        playerNamesEnabled: 'การแสดงชื่อผู้เล่น: เปิดใช้งาน',
        playerNamesDisabled: 'การแสดงชื่อผู้เล่น: ปิดใช้งาน'
    },
    errors: {
        updateFailed: 'การอัปเดตล้มเหลว',
        initFailed: 'การเริ่มต้นล้มเหลว',
        connectionFailed: 'การเชื่อมต่อล้มเหลว',
        retrying: 'กำลังลองใหม่ครั้งที่',
        timeout: 'การดำเนินการหมดเวลา'
    }
};

// ===========================================================================================
// ระบบแคชประสิทธิภาพสูง (HIGH-PERFORMANCE CACHE SYSTEM)
// ===========================================================================================

class GameCache {
    constructor() {
        this.cache = new Map();
        this.gameRecognitionCache = new Map();
        this.lastCleanup = Date.now();
    }

    set(key, value, ttl = CONFIG.cacheTimeout) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
        this._autoCleanup();
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item || Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.value;
    }

    isGameRecognized(gameName) {
        if (this.gameRecognitionCache.has(gameName)) {
            return this.gameRecognitionCache.get(gameName);
        }
        
        const isGame = REAL_GAMES.has(gameName);
        this.gameRecognitionCache.set(gameName, isGame);
        return isGame;
    }

    _autoCleanup() {
        const now = Date.now();
        if (now - this.lastCleanup > 30000) { // ทำความสะอาดทุก 30 วินาที
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expiry) {
                    this.cache.delete(key);
                }
            }
            this.lastCleanup = now;
        }
    }

    clear() {
        this.cache.clear();
        this.gameRecognitionCache.clear();
    }
}

// ===========================================================================================
// ระบบติดตามเซสชันเกม (GAME SESSION TRACKING)
// ===========================================================================================

class GameSessionTracker {
    constructor() {
        this.sessions = new Map(); // userId -> { gameName, startTime, channelId }
        this.dailyStats = new Map(); // gameName -> { totalTime, sessions, lastPlayed }
        this.lastReset = new Date().toDateString();
    }

    startSession(userId, gameName, channelId) {
        // จบเซสชันเดิมก่อน (ถ้ามี)
        this.endSession(userId);
        
        this.sessions.set(userId, {
            gameName,
            startTime: Date.now(),
            channelId
        });
    }

    endSession(userId) {
        const session = this.sessions.get(userId);
        if (session) {
            const duration = Date.now() - session.startTime;
            this._addToDailyStats(session.gameName, duration);
            this.sessions.delete(userId);
        }
    }

    _addToDailyStats(gameName, duration) {
        this._checkDayReset();
        
        if (!this.dailyStats.has(gameName)) {
            this.dailyStats.set(gameName, {
                totalTime: 0,
                sessions: 0,
                lastPlayed: Date.now()
            });
        }

        const stats = this.dailyStats.get(gameName);
        stats.totalTime += duration;
        stats.sessions += 1;
        stats.lastPlayed = Date.now();
    }

    _checkDayReset() {
        const today = new Date().toDateString();
        if (today !== this.lastReset) {
            this.dailyStats.clear();
            this.lastReset = today;
        }
    }

    getMostPopularToday() {
        this._checkDayReset();
        let mostPopular = null;
        let maxTime = 0;

        for (const [gameName, data] of this.dailyStats) {
            if (data.totalTime > maxTime) {
                maxTime = data.totalTime;
                mostPopular = gameName;
            }
        }

        return mostPopular;
    }

    getAverageSessionTime(gameName) {
        const stats = this.dailyStats.get(gameName);
        if (!stats || stats.sessions === 0) return 0;
        return Math.round(stats.totalTime / stats.sessions / 60000); // ในนาที
    }

    getDailyStats() {
        this._checkDayReset();
        return new Map(this.dailyStats);
    }
}

// ===========================================================================================
// ระบบ Debouncing อัจฉริยะ (INTELLIGENT DEBOUNCING)
// ===========================================================================================

class SmartDebouncer {
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

    immediate(key, func) {
        this.cancel(key);
        func();
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
// ระบบ Logging ที่ปรับปรุง (ENHANCED LOGGING)
// ===========================================================================================

class GameLogger {
    static log(level, message, ...args) {
        const timestamp = new Date().toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const levels = {
            ERROR: '❌',
            WARN: '⚠️',
            INFO: '💡',
            SUCCESS: '✅',
            DEBUG: '🔍',
            GAME: '🎮'
        };

        console.log(`[${timestamp}] ${levels[level]} ${message}`, ...args);
    }

    static error(message, ...args) { this.log('ERROR', message, ...args); }
    static warn(message, ...args) { this.log('WARN', message, ...args); }
    static info(message, ...args) { this.log('INFO', message, ...args); }
    static success(message, ...args) { this.log('SUCCESS', message, ...args); }
    static debug(message, ...args) { this.log('DEBUG', message, ...args); }
    static game(message, ...args) { this.log('GAME', message, ...args); }
}

// ===========================================================================================
// ระบบ Resilient Executor (RESILIENT EXECUTOR)
// ===========================================================================================

class ResilientExecutor {
    static async executeWithRetry(operation, context = 'operation', maxRetries = CONFIG.maxRetries) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.timeout(operation(), CONFIG.operationTimeout);
                if (attempt > 1) {
                    GameLogger.success(`${context} สำเร็จในครั้งที่ ${attempt}`);
                }
                return result;
            } catch (error) {
                lastError = error;
                GameLogger.warn(`${context} ล้มเหลวครั้งที่ ${attempt}/${maxRetries}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = CONFIG.retryDelay * attempt;
                    GameLogger.info(`${THAI_TEXT.errors.retrying} ${attempt + 1} ใน ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }
        
        GameLogger.error(`${context} ล้มเหลวหลังจาก ${maxRetries} ครั้ง:`, lastError);
        throw lastError;
    }

    static async timeout(promise, ms = CONFIG.operationTimeout) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`${THAI_TEXT.errors.timeout} ${ms}ms`)), ms);
        });
        
        return Promise.race([promise, timeoutPromise]);
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===========================================================================================
// คลาสหลักของ Bot (MAIN BOT CLASS)
// ===========================================================================================

class RealGameTracker {
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
        this.cache = new GameCache();
        this.debouncer = new SmartDebouncer();
        this.sessionTracker = new GameSessionTracker();
        
        // State management
        this.guild = null;
        this.outputChannel = null;
        this.lastMessageId = null;
        this.updateTimer = null;
        this.isReady = false;
        this.scanningUsers = new Set();
        
        this._setupEventListeners();
        GameLogger.info('🚀 Real Game Tracker เริ่มต้นแล้ว');
    }

    // ===========================================================================================
    // การตรวจจับเกมที่แท้จริง (REAL GAME DETECTION)
    // ===========================================================================================

    getUserGameActivity(member) {
        try {
            if (!member?.presence?.activities?.length) return null;

            // หาเฉพาะกิจกรรมที่เป็นเกมจริง
            for (const activity of member.presence.activities) {
                if (activity.type !== ActivityType.Playing) continue;
                if (!activity.name || activity.name.trim().length === 0) continue;
                
                const gameName = activity.name.trim();
                
                // ตรวจสอบว่าเป็นแอปที่ไม่ใช่เกมหรือไม่
                if (this._isNonGameApp(gameName)) continue;
                
                // ตรวจสอบว่าเป็นเกมที่รู้จักหรือไม่
                if (this.cache.isGameRecognized(gameName) || this._looksLikeGame(gameName)) {
                    return {
                        name: gameName, // ใช้ชื่อเดิมเสมอ
                        type: 'game',
                        isVerified: REAL_GAMES.has(gameName)
                    };
                }
            }

            return null;
        } catch (error) {
            GameLogger.debug(`ข้อผิดพลาดในการดึงกิจกรรมของ ${member?.displayName}: ${error.message}`);
            return null;
        }
    }

    _isNonGameApp(activityName) {
        const lowerName = activityName.toLowerCase();
        
        // ตรวจสอบจากรายการแอปที่ไม่ใช่เกม
        for (const nonGameApp of NON_GAME_APPS) {
            if (lowerName.includes(nonGameApp.toLowerCase())) {
                return true;
            }
        }
        
        // ตรวจสอบคำสำคัญที่บ่งบอกว่าไม่ใช่เกม
        const nonGameKeywords = [
            'browser', 'chrome', 'firefox', 'edge', 'safari',
            'music', 'spotify', 'youtube', 'netflix', 'twitch',
            'discord', 'slack', 'teams', 'zoom', 'skype',
            'code', 'studio', 'photoshop', 'premiere'
        ];
        
        return nonGameKeywords.some(keyword => lowerName.includes(keyword));
    }

    _looksLikeGame(activityName) {
        const lowerName = activityName.toLowerCase();
        
        // คำสำคัญที่บ่งบอกว่าน่าจะเป็นเกม
        const gameKeywords = [
            'game', 'simulator', 'craft', 'world', 'legends', 'online',
            'fantasy', 'adventure', 'quest', 'battle', 'war', 'fight',
            'racing', 'driving', 'flying', 'shooting', 'rpg', 'mmo',
            'survival', 'horror', 'puzzle', 'strategy'
        ];
        
        return gameKeywords.some(keyword => lowerName.includes(keyword));
    }

    // ===========================================================================================
    // การสแกนข้อมูลเกมแบบขนาน (PARALLEL GAME SCANNING)
    // ===========================================================================================

    async scanAllGames() {
        const cacheKey = 'gameData';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            if (!this.guild) throw new Error('Guild ไม่พร้อมใช้งาน');

            const gameData = new Map();
            const monitoredChannels = await this._getMonitoredChannels();

            GameLogger.game(`🔍 กำลังสแกน ${monitoredChannels.length} ช่องเสียง`);

            // สแกนแบบขนาน
            const scanPromises = monitoredChannels.map(channel => 
                this._scanVoiceChannel(channel, gameData)
            );

            await Promise.allSettled(scanPromises);

            // แปลงผลลัพธ์
            const result = this._processGameData(gameData);
            
            // เก็บในแคช
            this.cache.set(cacheKey, result);
            
            GameLogger.success(`🎮 พบเกม ${Object.keys(result).length} เกม จาก ${this._getTotalPlayers(result)} ผู้เล่น`);
            return result;
        } catch (error) {
            GameLogger.error('ข้อผิดพลาดในการสแกนเกม:', error);
            return {};
        }
    }

    async _getMonitoredChannels() {
        const channels = [];
        
        for (const categoryId of CONFIG.monitoredCategoryIds) {
            try {
                const category = await this.guild.channels.fetch(categoryId);
                if (category?.type === ChannelType.GuildCategory) {
                    const voiceChannels = category.children.cache.filter(
                        child => child.type === ChannelType.GuildVoice
                    );
                    channels.push(...voiceChannels.values());
                }
            } catch (error) {
                GameLogger.warn(`ไม่สามารถดึงหมวดหมู่ ${categoryId}: ${error.message}`);
            }
        }

        return channels;
    }

    async _scanVoiceChannel(voiceChannel, gameData) {
        try {
            if (!voiceChannel.members?.size) return;

            GameLogger.debug(`📡 สแกน ${voiceChannel.name} (${voiceChannel.members.size} คน)`);

            // สแกนสมาชิกทุกคน
            for (const member of voiceChannel.members.values()) {
                if (this.scanningUsers.has(member.id)) continue;
                
                this.scanningUsers.add(member.id);
                
                try {
                    const gameActivity = this.getUserGameActivity(member);
                    
                    if (gameActivity) {
                        this._addToGameData(gameData, gameActivity.name, member, voiceChannel);
                        
                        // ติดตามเซสชัน
                        this.sessionTracker.startSession(
                            member.id, 
                            gameActivity.name, 
                            voiceChannel.id
                        );
                        
                        GameLogger.debug(`🎯 พบ: ${member.displayName} เล่น ${gameActivity.name}`);
                    }
                } finally {
                    this.scanningUsers.delete(member.id);
                }
            }
        } catch (error) {
            GameLogger.debug(`ข้อผิดพลาดในการสแกน ${voiceChannel.name}: ${error.message}`);
        }
    }

    _addToGameData(gameData, gameName, member, voiceChannel) {
        if (!gameData.has(gameName)) {
            gameData.set(gameName, {
                name: gameName,
                playerCount: 0,
                channels: new Set(),
                players: new Set()
            });
        }

        const data = gameData.get(gameName);
        data.playerCount++;
        data.channels.add(voiceChannel);
        
        if (CONFIG.showPlayerNames) {
            data.players.add({
                id: member.id,
                displayName: member.displayName,
                username: member.user.username
            });
        }
    }

    _processGameData(gameData) {
        return Object.fromEntries(
            Array.from(gameData.entries()).map(([gameName, data]) => [
                gameName,
                {
                    ...data,
                    channels: Array.from(data.channels),
                    players: Array.from(data.players)
                }
            ])
        );
    }

    _getTotalPlayers(gameData) {
        return Object.values(gameData).reduce((total, data) => total + data.playerCount, 0);
    }

    // ===========================================================================================
    // การสร้าง Embed สวยงาม (BEAUTIFUL EMBED CREATION)
    // ===========================================================================================

    async createGameEmbed(gameData) {
        try {
            const sortedGames = Object.entries(gameData)
                .sort(([,a], [,b]) => b.playerCount - a.playerCount)
                .slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle(THAI_TEXT.embed.title)
                .setDescription(THAI_TEXT.embed.description)
                .setColor(CONFIG.embedColors.primary)
                .setTimestamp()
                .setFooter({
                    text: THAI_TEXT.embed.footer,
                    iconURL: this.client.user?.displayAvatarURL()
                });

            if (sortedGames.length === 0) {
                embed.addFields({
                    name: THAI_TEXT.embed.noGames.title,
                    value: THAI_TEXT.embed.noGames.description,
                    inline: false
                });
            } else {
                await this._addGameFields(embed, sortedGames);
                await this._addGameStatistics(embed, gameData);
            }

            return embed;
        } catch (error) {
            GameLogger.error('ข้อผิดพลาดในการสร้าง embed:', error);
            return this._createErrorEmbed();
        }
    }

    async _addGameFields(embed, sortedGames) {
        const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        
        for (let i = 0; i < sortedGames.length; i++) {
            const [gameName, data] = sortedGames[i];
            
            const channelLinks = data.channels
                .map(channel => `<#${channel.id}>`)
                .join(' • ');

            let fieldValue = [
                `**${THAI_TEXT.embed.fields.voiceChannels}:** ${channelLinks}`,
                `**${THAI_TEXT.embed.fields.playerCount}:** ${data.playerCount} ${THAI_TEXT.embed.stats.people}`,
                `**${THAI_TEXT.embed.fields.channelCount}:** ${data.channels.length} ${THAI_TEXT.embed.stats.channels}`
            ];

            // เพิ่มชื่อผู้เล่น (ถ้าเปิดใช้งาน)
            if (CONFIG.showPlayerNames && data.players && data.players.length > 0) {
                const playerMentions = data.players
                    .slice(0, 6) // จำกัด 6 คนเพื่อความสวยงาม
                    .map(player => `<@${player.id}>`)
                    .join(', ');
                
                const remainingCount = data.players.length > 6 ? ` (+${data.players.length - 6} คนอื่นๆ)` : '';
                fieldValue.push(`**${THAI_TEXT.embed.fields.players}:** ${playerMentions}${remainingCount}`);
            }

            // เพิ่มเวลาเซสชันเฉลี่ย
            const avgTime = this.sessionTracker.getAverageSessionTime(gameName);
            if (avgTime > 0) {
                fieldValue.push(`**${THAI_TEXT.embed.fields.sessionTime}:** ${avgTime} ${THAI_TEXT.embed.stats.minutes}`);
            }

            embed.addFields({
                name: `${rankEmojis[i]} ${gameName} (${data.playerCount} ${THAI_TEXT.embed.stats.people})`,
                value: fieldValue.join('\n'),
                inline: false
            });
        }
    }

    async _addGameStatistics(embed, gameData) {
        const totalPlayers = this._getTotalPlayers(gameData);
        const totalGames = Object.keys(gameData).length;
        const activeChannels = new Set();
        
        Object.values(gameData).forEach(data => {
            data.channels.forEach(channel => activeChannels.add(channel.id));
        });

        const mostPopularToday = this.sessionTracker.getMostPopularToday();
        
        const statsValue = [
            `**${THAI_TEXT.embed.stats.totalPlayers}:** ${totalPlayers} ${THAI_TEXT.embed.stats.people}`,
            `**${THAI_TEXT.embed.stats.totalGames}:** ${totalGames} ${THAI_TEXT.embed.stats.games}`,
            `**${THAI_TEXT.embed.stats.activeChannels}:** ${activeChannels.size} ${THAI_TEXT.embed.stats.channels}`
        ];

        if (mostPopularToday) {
            statsValue.push(`**${THAI_TEXT.embed.stats.mostPopularToday}:** ${mostPopularToday}`);
        }

        // เพิ่มเวลาเฉลี่ยของเกมที่ได้รับความนิยม
        if (mostPopularToday) {
            const avgTime = this.sessionTracker.getAverageSessionTime(mostPopularToday);
            if (avgTime > 0) {
                statsValue.push(`**${THAI_TEXT.embed.stats.avgDuration}:** ${avgTime} ${THAI_TEXT.embed.stats.minutes}`);
            }
        }

        embed.addFields({
            name: THAI_TEXT.embed.stats.title,
            value: statsValue.join('\n'),
            inline: false
        });
    }

    _createErrorEmbed() {
        return new EmbedBuilder()
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('ไม่สามารถโหลดข้อมูลเกมได้ในขณะนี้')
            .setColor(CONFIG.embedColors.error)
            .setTimestamp()
            .setFooter({
                text: THAI_TEXT.embed.footer,
                iconURL: this.client.user?.displayAvatarURL()
            });
    }

    // ===========================================================================================
    // ระบบอัปเดตข้อความ (MESSAGE UPDATE SYSTEM)
    // ===========================================================================================

    async updateGameTracker() {
        return ResilientExecutor.executeWithRetry(async () => {
            if (!this.outputChannel) {
                throw new Error('ไม่พบช่องข้อความสำหรับส่งข้อมูล');
            }

            GameLogger.info(THAI_TEXT.console.updating);

            const gameData = await this.scanAllGames();
            const embed = await this.createGameEmbed(gameData);

            if (this.lastMessageId) {
                try {
                    const lastMessage = await this.outputChannel.messages.fetch(this.lastMessageId);
                    await lastMessage.edit({ embeds: [embed] });
                    GameLogger.success(THAI_TEXT.console.updated);
                } catch (error) {
                    GameLogger.warn(THAI_TEXT.console.editFailed);
                    const newMessage = await this.outputChannel.send({ embeds: [embed] });
                    this.lastMessageId = newMessage.id;
                }
            } else {
                const newMessage = await this.outputChannel.send({ embeds: [embed] });
                this.lastMessageId = newMessage.id;
                GameLogger.success(THAI_TEXT.console.newMessage);
            }
        }, 'Game tracker update');
    }

    // ===========================================================================================
    // ระบบอัปเดตอัตโนมัติ (AUTO-UPDATE SYSTEM)
    // ===========================================================================================

    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // อัปเดตครั้งแรกทันที
        this.debouncer.immediate('initial-update', () => {
            this.updateGameTracker().catch(error => {
                GameLogger.error('การอัปเดตครั้งแรกล้มเหลว:', error);
            });
        });

        // ตั้งการอัปเดตอัตโนมัติ
        this.updateTimer = setInterval(() => {
            this.updateGameTracker().catch(error => {
                GameLogger.error('การอัปเดตตามกำหนดล้มเหลว:', error);
            });
        }, CONFIG.updateInterval * 1000);

        GameLogger.success(`🔄 ${THAI_TEXT.console.autoUpdate} ${CONFIG.updateInterval} ${THAI_TEXT.console.seconds}`);
    }

    stopAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
        this.debouncer.clear();
    }

    // ===========================================================================================
    // Event Handlers
    // ===========================================================================================

    _setupEventListeners() {
        this.client.once('ready', () => this._handleReady());
        this.client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState));
        this.client.on('presenceUpdate', (oldPresence, newPresence) => this._handlePresenceUpdate(oldPresence, newPresence));
        this.client.on('error', error => GameLogger.error('Client error:', error));
        this.client.on('warn', warning => GameLogger.warn('Client warning:', warning));
        this.client.on('disconnect', () => GameLogger.warn('Client disconnected'));
        this.client.on('reconnecting', () => GameLogger.info('Client reconnecting...'));
    }

    async _handleReady() {
        GameLogger.success(`🚀 ${this.client.user.tag} ${THAI_TEXT.console.ready}`);

        try {
            await this._initializeBot();
            this.isReady = true;
            this.startAutoUpdate();
        } catch (error) {
            GameLogger.error(THAI_TEXT.errors.initFailed, error);
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

        if (!this.guild) throw new Error('ไม่พบเซิร์ฟเวอร์ที่กำหนด');
        if (!this.outputChannel) throw new Error('ไม่พบช่องข้อความที่กำหนด');

        GameLogger.info(`🏠 ${THAI_TEXT.console.connecting}: ${this.guild.name}`);
        GameLogger.info(`📝 ${THAI_TEXT.console.outputChannel}: ${this.outputChannel.name}`);
        GameLogger.info(`👁️ ${THAI_TEXT.console.monitoring}: ${CONFIG.monitoredCategoryIds.length} ${THAI_TEXT.console.categories}`);
        GameLogger.info(`👤 ${CONFIG.showPlayerNames ? THAI_TEXT.console.playerNamesEnabled : THAI_TEXT.console.playerNamesDisabled}`);
        GameLogger.info(`🎮 รองรับเกม: ${REAL_GAMES.size} เกม`);
    }

    _handleVoiceStateUpdate(oldState, newState) {
        if (!this.isReady) return;

        const isOldChannelMonitored = oldState.channel && this._isChannelMonitored(oldState.channel);
        const isNewChannelMonitored = newState.channel && this._isChannelMonitored(newState.channel);

        if (isOldChannelMonitored || isNewChannelMonitored) {
            GameLogger.debug(`🔄 ${THAI_TEXT.console.voiceChange}: ${newState.member?.displayName}`);
            
            // ล้างแคชเพื่อให้ข้อมูลใหม่
            this.cache.clear();
            
            // อัปเดตแบบ debounce
            this.debouncer.debounce('voice-update', () => {
                this.updateGameTracker();
            }, 1500);
        }
    }

    _handlePresenceUpdate(oldPresence, newPresence) {
        if (!this.isReady || !newPresence?.member) return;

        const voiceState = newPresence.member.voice;
        if (voiceState.channel && this._isChannelMonitored(voiceState.channel)) {
            GameLogger.debug(`🎮 ${THAI_TEXT.console.gameChange}: ${newPresence.member.displayName}`);
            
            // ล้างแคชเพื่อให้ข้อมูลใหม่
            this.cache.clear();
            
            // อัปเดตแบบ debounce
            this.debouncer.debounce('presence-update', () => {
                this.updateGameTracker();
            }, 1000);
        }
    }

    _isChannelMonitored(channel) {
        if (!channel || channel.type !== ChannelType.GuildVoice) return false;
        return CONFIG.monitoredCategoryIds.includes(channel.parentId);
    }

    // ===========================================================================================
    // การจัดการวงชีวิตของ Bot (BOT LIFECYCLE MANAGEMENT)
    // ===========================================================================================

    async start() {
        try {
            GameLogger.info('🚀 เริ่มต้น Real Game Tracker...');
            await this.client.login(CONFIG.token);
        } catch (error) {
            GameLogger.error('ไม่สามารถเริ่มต้น bot:', error);
            throw error;
        }
    }

    async stop() {
        GameLogger.info(`\n🛑 ${THAI_TEXT.console.stopping}`);
        
        this.stopAutoUpdate();
        this.cache.clear();
        this.debouncer.clear();
        
        if (this.client) {
            this.client.destroy();
        }
        
        GameLogger.info('✅ Real Game Tracker หยุดทำงานแล้ว');
    }

    // ===========================================================================================
    // สถิติและการติดตาม (STATS & MONITORING)
    // ===========================================================================================

    getStats() {
        return {
            isReady: this.isReady,
            supportedGames: REAL_GAMES.size,
            excludedApps: NON_GAME_APPS.size,
            activeSessions: this.sessionTracker.sessions.size,
            dailyStats: this.sessionTracker.getDailyStats().size,
            cacheSize: this.cache.cache.size,
            lastUpdate: new Date().toLocaleString('th-TH')
        };
    }
}

// ===========================================================================================
// การเริ่มต้นและการจัดการ Process (INITIALIZATION & PROCESS MANAGEMENT)
// ===========================================================================================

const bot = new RealGameTracker();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    GameLogger.info('🛑 ได้รับสัญญาณ SIGINT...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    GameLogger.info('🛑 ได้รับสัญญาณ SIGTERM...');
    await bot.stop();
    process.exit(0);
});

// Error handlers
process.on('unhandledRejection', (error) => {
    GameLogger.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    GameLogger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Memory monitoring
process.on('warning', (warning) => {
    GameLogger.warn('⚠️ Process warning:', warning);
});

// เริ่มต้น bot
GameLogger.info('🎮 เริ่มต้น Real Game Tracker Bot...');
GameLogger.info(`📊 รองรับเกม: ${REAL_GAMES.size} เกม`);
GameLogger.info(`🚫 แอปที่กรองออก: ${NON_GAME_APPS.size} แอป`);

bot.start().catch(error => {
    GameLogger.error(THAI_TEXT.errors.connectionFailed, error);
    process.exit(1);
});