const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, ActivityType } = require('discord.js');
require('dotenv').config();

// ===========================================================================================
// การกำหนดค่าและค่าคงที่ (CONFIGURATION & CONSTANTS)
// ===========================================================================================

const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    monitoredCategoryIds: process.env.MONITORED_CATEGORY_IDS?.split(',') || [],
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10,
    showPlayerNames: process.env.SHOW_PLAYER_NAMES === 'true' || false,
    
    // การตั้งค่าประสิทธิภาพและความทนทาน (Performance & Resilience Settings)
    maxRetries: 3,
    retryDelay: 1500,
    baseRetryDelay: 500,
    maxRetryDelay: 5000,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 30000,
    
    // การตั้งค่าแคช (Cache Settings)
    cache: {
        gameData: 5000,      // 5 วินาที
        userActivity: 15000, // 15 วินาที  
        channelData: 30000,  // 30 วินาที
        longTerm: 300000     // 5 นาที
    },
    
    // การตั้งค่า Debouncing
    debounce: {
        voiceUpdate: 2000,
        presenceUpdate: 1000,
        batchUpdate: 3000
    },
    
    // การตั้งค่าการประมวลผลแบบขนาน (Parallel Processing)
    parallel: {
        maxConcurrentOperations: 10,
        batchSize: 5,
        timeoutMs: 8000
    },
    
    // สีของ Embed
    embedColors: {
        gaming: '#9146FF',
        streaming: '#FF6B6B', 
        general: '#4169E1',
        success: '#00FF7F',
        warning: '#FFD700',
        error: '#FF4444'
    }
};

// ===========================================================================================
// ฐานข้อมูลเกมและแอปพลิเคชัน (COMPREHENSIVE GAME & APP DATABASE)
// ===========================================================================================

// เกมที่แท้จริง (Real Games)
const REAL_GAMES = new Set([
    'VALORANT', 'Fortnite', 'League of Legends', 'Counter-Strike 2', 'CS2', 'CS:GO', 
    'Apex Legends', 'Minecraft', 'Roblox', 'Grand Theft Auto V', 'GTA V', 'Call of Duty',
    'Overwatch 2', 'Rocket League', 'Genshin Impact', 'Fall Guys', 'Among Us', 'FIFA 24',
    'PUBG', 'Destiny 2', 'World of Warcraft', 'Dota 2', 'Rainbow Six Siege', 'Battlefield 2042',
    'Cyberpunk 2077', 'The Witcher 3', 'Elden Ring', 'Dark Souls', 'Hades', 'Stardew Valley',
    'Terraria', 'Dead by Daylight', 'Phasmophobia', 'Valheim', 'Sea of Thieves', 'Portal 2',
    'Rust', 'ARK: Survival Evolved', 'Team Fortress 2', 'Left 4 Dead 2', 'Half-Life 2',
    'Age of Empires IV', 'Civilization VI', 'StarCraft II', 'Total War', 'XCOM 2',
    'Monster Hunter World', 'Final Fantasy XIV', 'The Elder Scrolls V: Skyrim', 'Fallout 4',
    'Mass Effect', 'Dragon Age', 'Persona 5', 'NieR: Automata', 'Baldur\'s Gate 3',
    'Divinity: Original Sin 2', 'The Outer Worlds', 'Disco Elysium', 'Hollow Knight',
    'Celeste', 'Cuphead', 'Dead Cells', 'Risk of Rain 2', 'Slay the Spire', 'Into the Breach',
    'Factorio', 'Satisfactory', 'Cities: Skylines', 'Planet Coaster', 'Two Point Hospital',
    'Euro Truck Simulator 2', 'American Truck Simulator', 'Microsoft Flight Simulator',
    'Farming Simulator 22', 'BeamNG.drive', 'Assetto Corsa', 'F1 23', 'Forza Horizon 5',
    'Need for Speed', 'The Crew 2', 'The Crew Motorfest', 'Dirt Rally 2.0', 'GRID Legends',
    'Street Fighter 6', 'Tekken 7', 'Mortal Kombat 11', 'Guilty Gear Strive', 'Dragon Ball FighterZ',
    'Beat Saber', 'Half-Life: Alyx', 'Boneworks', 'VRChat', 'Rec Room', 'Pavlov VR',
    'Hearthstone', 'Magic: The Gathering Arena', 'Legends of Runeterra', 'Yu-Gi-Oh! Master Duel',
    'Auto Chess', 'Teamfight Tactics', 'Dota Underlords', 'Super Auto Pets',
    'Escape from Tarkov', 'Hunt: Showdown', 'Squad', 'Hell Let Loose', 'Insurgency: Sandstorm',
    'War Thunder', 'World of Tanks', 'World of Warships', 'Elite Dangerous', 'Star Citizen',
    'No Man\'s Sky', 'Subnautica', 'The Forest', 'Green Hell', 'Raft', 'Grounded',
    'Conan Exiles', '7 Days to Die', 'DayZ', 'State of Decay 2', 'Project Zomboid',
    'RimWorld', 'Oxygen Not Included', 'Prison Architect', 'Tropico 6', 'Anno 1800',
    'Crusader Kings III', 'Hearts of Iron IV', 'Europa Universalis IV', 'Stellaris',
    'Kerbal Space Program', 'Space Engineers', 'Astroneer', 'Outer Wilds', 'The Witness',
    'Baba Is You', 'Return of the Obra Dinn', 'Papers, Please', 'This War of Mine',
    'Frostpunk', 'They Are Billions', 'Northgard', 'Age of Empires II', 'Command & Conquer',
    'Red Alert', 'Company of Heroes', 'Dawn of War', 'Supreme Commander', 'Planetary Annihilation',
    'Chess.com', 'Lichess', 'Tabletop Simulator', 'Jackbox Party Pack', 'Golf With Your Friends',
    'Among Us', 'Phasmophobia', 'Lethal Company', 'Content Warning', 'Backrooms',
    'SCP: Secret Laboratory', 'Garry\'s Mod', 'Wallpaper Engine', 'Rainmeter'
]);

// แอปพลิเคชันสตรีมมิ่งและการรับชม (Streaming & Viewing Apps)
const STREAMING_APPS = new Set([
    'YouTube', 'YouTube Music', 'Twitch', 'Netflix', 'Disney+', 'Prime Video', 'HBO Max',
    'Crunchyroll', 'Funimation', 'VLC Media Player', 'PotPlayer', 'MPC-HC', 'OBS Studio',
    'Streamlabs OBS', 'XSplit', 'NVIDIA Broadcast', 'Elgato Stream Deck', 'Streamlabs',
    'Restream', 'TikTok', 'Instagram', 'Facebook', 'Twitter', 'Discord Stage',
    'Zoom', 'Microsoft Teams', 'Google Meet', 'Skype', 'TeamSpeak', 'Mumble'
]);

// แอปพลิเคชันทั่วไป (General Apps)
const GENERAL_APPS = new Set([
    'Discord', 'Spotify', 'Apple Music', 'SoundCloud', 'Deezer', 'Tidal',
    'Visual Studio Code', 'JetBrains', 'Sublime Text', 'Atom', 'Notepad++',
    'Photoshop', 'GIMP', 'Illustrator', 'Blender', 'Maya', 'Cinema 4D',
    'After Effects', 'Premiere Pro', 'DaVinci Resolve', 'Audacity', 'FL Studio',
    'Chrome', 'Firefox', 'Edge', 'Safari', 'Opera', 'Brave',
    'Steam', 'Epic Games Launcher', 'Battle.net', 'Origin', 'Uplay', 'GOG Galaxy',
    'Xbox App', 'PlayStation App', 'GeForce Experience', 'AMD Software',
    'MSI Afterburner', 'CPU-Z', 'GPU-Z', 'HWiNFO64', 'Core Temp',
    'BlueStacks', 'NoxPlayer', 'MEmu', 'LDPlayer', 'GameLoop',
    'VirtualBox', 'VMware', 'Hyper-V', 'Docker', 'WSL',
    'Microsoft Office', 'LibreOffice', 'Google Docs', 'Notion', 'Obsidian',
    'Slack', 'Telegram', 'WhatsApp', 'Signal', 'Element'
]);

// ===========================================================================================
// ข้อความภาษาไทย (THAI UI TEXT CONSTANTS)
// ===========================================================================================

const THAI_TEXT = {
    embed: {
        title: '🎮 TOP 5 กิจกรรมยอดนิยมในห้องเสียง',
        description: 'กิจกรรมปัจจุบันที่สมาชิกกำลังทำอยู่ในช่องเสียง',
        noActivity: {
            title: '😴 ไม่มีใครทำกิจกรรมในขณะนี้',
            description: 'ยังไม่มีสมาชิกที่กำลังทำกิจกรรมใดๆ ในช่องเสียงที่ติดตาม'
        },
        stats: {
            title: '📊 สถิติโดยละเอียด',
            totalUsers: 'รวมผู้ใช้งาน',
            totalActivities: 'รวมกิจกรรม',
            people: 'คน',
            activities: 'กิจกรรม',
            channels: 'ช่อง',
            mostPopularToday: 'ยอดนิยมวันนี้',
            avgDuration: 'ระยะเวลาเฉลี่ย',
            activeChannels: 'ช่องที่ใช้งาน',
            minutes: 'นาที',
            performance: 'ประสิทธิภาพ',
            cacheHitRate: 'อัตราการใช้แคช',
            successRate: 'อัตราความสำเร็จ',
            uptime: 'เวลาออนไลน์',
            hours: 'ชั่วโมง'
        },
        fields: {
            voiceChannels: 'ช่องเสียง',
            userCount: 'จำนวนคน',
            channelCount: 'จำนวนช่อง',
            players: 'ผู้เล่น',        // สำหรับเกม
            viewers: 'ผู้รับชม',       // สำหรับ streaming
            users: 'ผู้ใช้งาน',       // สำหรับแอปทั่วไป
            sessionTime: 'เวลาเซสชัน'
        },
        emojis: {
            game: '🎮',
            streaming: '📺',
            general: '💻'
        },
        footer: 'สร้างโดย Thai Activity Tracker • อัปเดตทุก'
    },
    console: {
        ready: 'พร้อมใช้งานแล้ว!',
        connecting: 'เชื่อมต่อกับเซิร์ฟเวอร์',
        outputChannel: 'ช่องข้อความ',
        monitoring: 'ติดตามหมวดหมู่',
        categories: 'หมวดหมู่',
        updating: 'กำลังอัปเดตข้อมูลกิจกรรม...',
        updated: 'อัปเดตข้อความสำเร็จ',
        newMessage: 'ส่งข้อความใหม่สำเร็จ',
        editFailed: 'ไม่สามารถแก้ไขข้อความเดิม ส่งข้อความใหม่แทน',
        voiceChange: 'มีการเปลี่ยนแปลงในช่องเสียง',
        activityChange: 'กิจกรรมเปลี่ยนแปลง',
        autoUpdate: 'เริ่มการอัปเดตอัตโนมัติทุก',
        seconds: 'วินาที',
        stopping: 'กำลังปิด Bot...',
        noOutputChannel: 'ไม่พบช่องข้อความสำหรับส่งข้อมูล',
        noGuild: 'ไม่พบเซิร์ฟเวอร์ที่กำหนด',
        noChannel: 'ไม่พบช่องข้อความที่กำหนด',
        playerNamesEnabled: 'การแสดงชื่อผู้เล่น: เปิดใช้งาน',
        playerNamesDisabled: 'การแสดงชื่อผู้เล่น: ปิดใช้งาน'
    },
    errors: {
        updateFailed: 'การอัปเดตล้มเหลว',
        initFailed: 'การเริ่มต้นล้มเหลว',
        unhandledRejection: 'Unhandled Promise Rejection',
        uncaughtException: 'Uncaught Exception',
        connectionFailed: 'การเชื่อมต่อล้มเหลว',
        retrying: 'กำลังลองใหม่ครั้งที่',
        circuitBreakerOpen: 'Circuit Breaker เปิดอยู่',
        operationTimeout: 'การดำเนินการหมดเวลา'
    },
    monitoring: {
        performance: 'ประสิทธิภาพ',
        cacheStats: 'สถิติแคช',
        errorRate: 'อัตราข้อผิดพลาด',
        responseTime: 'เวลาตอบสนอง',
        memoryUsage: 'การใช้หน่วยความจำ',
        activeConnections: 'การเชื่อมต่อที่ใช้งาน'
    }
};

// ===========================================================================================
// ระบบแคชหลายระดับ (MULTI-LEVEL CACHING SYSTEM)
// ===========================================================================================

class MultiLevelCache {
    constructor() {
        this.levels = {
            l1: new Map(), // Fast cache - 5s
            l2: new Map(), // Medium cache - 15s  
            l3: new Map()  // Long cache - 5min
        };
        this.statistics = {
            hits: { l1: 0, l2: 0, l3: 0 },
            misses: 0,
            evictions: 0,
            operations: 0
        };
        this.cleanupInterval = setInterval(() => this._cleanup(), 10000);
    }

    set(key, value, level = 'l1') {
        const ttl = level === 'l1' ? CONFIG.cache.gameData : 
                   level === 'l2' ? CONFIG.cache.userActivity : 
                   CONFIG.cache.longTerm;
        
        const expiry = Date.now() + ttl;
        this.levels[level].set(key, { value, expiry, level });
        this.statistics.operations++;
    }

    get(key) {
        this.statistics.operations++;
        
        // ค้นหาจาก L1 -> L2 -> L3
        for (const [levelName, cache] of Object.entries(this.levels)) {
            const item = cache.get(key);
            if (item && Date.now() <= item.expiry) {
                this.statistics.hits[levelName]++;
                
                // Promote to L1 if found in L2/L3
                if (levelName !== 'l1') {
                    this.set(key, item.value, 'l1');
                }
                
                return item.value;
            } else if (item) {
                cache.delete(key);
                this.statistics.evictions++;
            }
        }
        
        this.statistics.misses++;
        return null;
    }

    _cleanup() {
        const now = Date.now();
        for (const cache of Object.values(this.levels)) {
            for (const [key, item] of cache.entries()) {
                if (now > item.expiry) {
                    cache.delete(key);
                    this.statistics.evictions++;
                }
            }
        }
    }

    clear() {
        for (const cache of Object.values(this.levels)) {
            cache.clear();
        }
        this.statistics = {
            hits: { l1: 0, l2: 0, l3: 0 },
            misses: 0,
            evictions: 0,
            operations: 0
        };
    }

    getStats() {
        const totalHits = Object.values(this.statistics.hits).reduce((a, b) => a + b, 0);
        const hitRate = this.statistics.operations > 0 ? 
            (totalHits / this.statistics.operations * 100).toFixed(2) : 0;
            
        return {
            hitRate: parseFloat(hitRate),
            ...this.statistics,
            totalHits,
            sizes: {
                l1: this.levels.l1.size,
                l2: this.levels.l2.size,
                l3: this.levels.l3.size
            }
        };
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.clear();
    }
}

// ===========================================================================================
// ระบบ Circuit Breaker
// ===========================================================================================

class CircuitBreaker {
    constructor(name, threshold = CONFIG.circuitBreakerThreshold) {
        this.name = name;
        this.threshold = threshold;
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    }

    async execute(operation) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > CONFIG.circuitBreakerTimeout) {
                this.state = 'HALF_OPEN';
            } else {
                throw new Error(`${THAI_TEXT.errors.circuitBreakerOpen}: ${this.name}`);
            }
        }

        try {
            const result = await operation();
            this._onSuccess();
            return result;
        } catch (error) {
            this._onFailure();
            throw error;
        }
    }

    _onSuccess() {
        this.failureCount = 0;
        this.state = 'CLOSED';
    }

    _onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.threshold) {
            this.state = 'OPEN';
        }
    }

    getState() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            threshold: this.threshold
        };
    }
}

// ===========================================================================================
// ระบบ Batch Processing
// ===========================================================================================

class BatchProcessor {
    constructor(batchSize = CONFIG.parallel.batchSize) {
        this.batchSize = batchSize;
        this.queue = [];
        this.processing = false;
    }

    async add(operation) {
        return new Promise((resolve, reject) => {
            this.queue.push({ operation, resolve, reject });
            if (!this.processing) {
                this._processBatch();
            }
        });
    }

    async _processBatch() {
        if (this.processing || this.queue.length === 0) return;
        
        this.processing = true;
        
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, this.batchSize);
            const promises = batch.map(async ({ operation, resolve, reject }) => {
                try {
                    const result = await operation();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
            
            await Promise.allSettled(promises);
        }
        
        this.processing = false;
    }
}

// ===========================================================================================
// ระบบติดตามการใช้งาน (Advanced Session Tracking)
// ===========================================================================================

class ActivitySessionTracker {
    constructor() {
        this.sessions = new Map(); // userId -> { activityName, type, startTime, channelId }
        this.dailyStats = new Map(); // activityName -> { totalTime, userCount, sessions, type }
        this.hourlyTrends = new Map(); // hour -> Map(activityName -> count)
        this.lastReset = new Date().toDateString();
        this.performanceMetrics = {
            totalSessions: 0,
            averageSessionLength: 0,
            peakConcurrentUsers: 0,
            dailyActiveUsers: new Set()
        };
    }

    startSession(userId, activityName, activityType, channelId) {
        // End existing session first
        this.endSession(userId);
        
        this.sessions.set(userId, {
            activityName,
            activityType,
            startTime: Date.now(),
            channelId
        });
        
        this.performanceMetrics.totalSessions++;
        this.performanceMetrics.dailyActiveUsers.add(userId);
        this._updatePeakConcurrent();
    }

    endSession(userId) {
        const session = this.sessions.get(userId);
        if (session) {
            const duration = Date.now() - session.startTime;
            this._addToDailyStats(session.activityName, session.activityType, duration);
            this._updateHourlyTrends(session.activityName);
            this.sessions.delete(userId);
            this._updateAverageSessionLength(duration);
        }
    }

    _addToDailyStats(activityName, activityType, duration) {
        this._checkDayReset();
        
        if (!this.dailyStats.has(activityName)) {
            this.dailyStats.set(activityName, {
                totalTime: 0,
                userCount: 0,
                sessions: 0,
                type: activityType
            });
        }

        const stats = this.dailyStats.get(activityName);
        stats.totalTime += duration;
        stats.sessions += 1;
    }

    _updateHourlyTrends(activityName) {
        const hour = new Date().getHours();
        if (!this.hourlyTrends.has(hour)) {
            this.hourlyTrends.set(hour, new Map());
        }
        
        const hourlyData = this.hourlyTrends.get(hour);
        hourlyData.set(activityName, (hourlyData.get(activityName) || 0) + 1);
    }

    _updatePeakConcurrent() {
        const current = this.sessions.size;
        if (current > this.performanceMetrics.peakConcurrentUsers) {
            this.performanceMetrics.peakConcurrentUsers = current;
        }
    }

    _updateAverageSessionLength(newDuration) {
        const total = this.performanceMetrics.averageSessionLength * (this.performanceMetrics.totalSessions - 1);
        this.performanceMetrics.averageSessionLength = (total + newDuration) / this.performanceMetrics.totalSessions;
    }

    _checkDayReset() {
        const today = new Date().toDateString();
        if (today !== this.lastReset) {
            this.dailyStats.clear();
            this.hourlyTrends.clear();
            this.performanceMetrics.dailyActiveUsers.clear();
            this.performanceMetrics.peakConcurrentUsers = 0;
            this.lastReset = today;
        }
    }

    getMostPopularToday() {
        const stats = this.getDailyStats();
        let mostPopular = null;
        let maxTime = 0;

        for (const [activityName, data] of stats) {
            if (data.totalTime > maxTime) {
                maxTime = data.totalTime;
                mostPopular = { name: activityName, type: data.type };
            }
        }

        return mostPopular;
    }

    getAverageSessionTime(activityName) {
        const stats = this.dailyStats.get(activityName);
        if (!stats || stats.sessions === 0) return 0;
        return Math.round(stats.totalTime / stats.sessions / 60000); // in minutes
    }

    getDailyStats() {
        this._checkDayReset();
        return new Map(this.dailyStats);
    }

    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            currentActiveSessions: this.sessions.size,
            dailyActiveUsers: this.performanceMetrics.dailyActiveUsers.size,
            averageSessionLengthMinutes: Math.round(this.performanceMetrics.averageSessionLength / 60000)
        };
    }
}

// ===========================================================================================
// ระบบ Debouncing ขั้นสูง
// ===========================================================================================

class AdvancedDebounceManager {
    constructor() {
        this.timers = new Map();
        this.executionQueue = new Map();
        this.batchProcessor = new BatchProcessor();
    }

    debounce(key, func, delay = CONFIG.debounce.batchUpdate, immediate = false) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }

        if (immediate && !this.timers.has(key)) {
            func();
        }

        const timer = setTimeout(async () => {
            if (!immediate) {
                await this.batchProcessor.add(func);
            }
            this.timers.delete(key);
        }, delay);

        this.timers.set(key, timer);
    }

    throttle(key, func, limit = 1000) {
        const lastExecution = this.executionQueue.get(key) || 0;
        const now = Date.now();
        
        if (now - lastExecution >= limit) {
            this.executionQueue.set(key, now);
            return func();
        }
        
        return Promise.resolve();
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
        this.executionQueue.clear();
    }
}

// ===========================================================================================
// ระบบ Logging ขั้นสูง
// ===========================================================================================

class AdvancedLogger {
    constructor() {
        this.logLevels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            SUCCESS: 3,
            DEBUG: 4,
            TRACE: 5
        };
        this.currentLevel = this.logLevels.INFO;
        this.metrics = {
            errorCount: 0,
            warnCount: 0,
            totalLogs: 0
        };
    }

    setLevel(level) {
        this.currentLevel = this.logLevels[level] || this.logLevels.INFO;
    }

    log(level, message, ...args) {
        const levelNum = this.logLevels[level];
        if (levelNum > this.currentLevel) return;

        const timestamp = new Date().toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
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
            INFO: 'ℹ️',
            SUCCESS: '✅',
            DEBUG: '🔍',
            TRACE: '🔎'
        };

        const prefix = `[${timestamp}] ${levels[level]} [${level}]`;
        console.log(`${prefix} ${message}`, ...args);

        this.metrics.totalLogs++;
        if (level === 'ERROR') this.metrics.errorCount++;
        if (level === 'WARN') this.metrics.warnCount++;
    }

    error(message, ...args) { this.log('ERROR', message, ...args); }
    warn(message, ...args) { this.log('WARN', message, ...args); }
    info(message, ...args) { this.log('INFO', message, ...args); }
    success(message, ...args) { this.log('SUCCESS', message, ...args); }
    debug(message, ...args) { this.log('DEBUG', message, ...args); }
    trace(message, ...args) { this.log('TRACE', message, ...args); }

    getMetrics() {
        const errorRate = this.metrics.totalLogs > 0 ? 
            (this.metrics.errorCount / this.metrics.totalLogs * 100).toFixed(2) : 0;
        
        return {
            ...this.metrics,
            errorRate: parseFloat(errorRate),
            successRate: (100 - parseFloat(errorRate)).toFixed(2)
        };
    }
}

// ===========================================================================================
// ระบบ Resilient Executor ขั้นสูง
// ===========================================================================================

class AdvancedResilientExecutor {
    constructor() {
        this.circuitBreakers = new Map();
        this.retryStats = new Map();
    }

    async executeWithRetry(operation, context = 'operation', options = {}) {
        const {
            maxRetries = CONFIG.maxRetries,
            baseDelay = CONFIG.baseRetryDelay,
            maxDelay = CONFIG.maxRetryDelay,
            exponentialBackoff = true,
            circuitBreaker = true
        } = options;

        let circuitBreakerInstance = null;
        if (circuitBreaker) {
            if (!this.circuitBreakers.has(context)) {
                this.circuitBreakers.set(context, new CircuitBreaker(context));
            }
            circuitBreakerInstance = this.circuitBreakers.get(context);
        }

        const executeOperation = async () => {
            let lastError;
            
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const result = circuitBreakerInstance 
                        ? await circuitBreakerInstance.execute(operation)
                        : await operation();
                    
                    if (attempt > 1) {
                        Logger.success(`${context} สำเร็จในครั้งที่ ${attempt}`);
                    }
                    
                    this._updateRetryStats(context, attempt, true);
                    return result;
                } catch (error) {
                    lastError = error;
                    Logger.warn(`${context} ล้มเหลวในครั้งที่ ${attempt}/${maxRetries}: ${error.message}`);
                    
                    if (attempt < maxRetries) {
                        const delay = exponentialBackoff 
                            ? Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay)
                            : baseDelay;
                        
                        Logger.info(`${THAI_TEXT.errors.retrying} ${attempt + 1} ใน ${delay}ms`);
                        await this.sleep(delay);
                    }
                }
            }
            
            this._updateRetryStats(context, maxRetries, false);
            Logger.error(`${context} ล้มเหลวหลังจากลองใหม่ ${maxRetries} ครั้ง:`, lastError);
            throw lastError;
        };

        return await this.timeout(executeOperation(), CONFIG.parallel.timeoutMs);
    }

    async timeout(promise, ms = CONFIG.parallel.timeoutMs) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`${THAI_TEXT.errors.operationTimeout} ${ms}ms`)), ms);
        });
        
        return Promise.race([promise, timeoutPromise]);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    _updateRetryStats(context, attempts, success) {
        if (!this.retryStats.has(context)) {
            this.retryStats.set(context, { 
                totalAttempts: 0, 
                successCount: 0, 
                failureCount: 0,
                averageAttempts: 0
            });
        }
        
        const stats = this.retryStats.get(context);
        stats.totalAttempts += attempts;
        
        if (success) {
            stats.successCount++;
        } else {
            stats.failureCount++;
        }
        
        const totalOperations = stats.successCount + stats.failureCount;
        stats.averageAttempts = stats.totalAttempts / totalOperations;
    }

    getStats() {
        const circuitBreakerStats = Array.from(this.circuitBreakers.values()).map(cb => cb.getState());
        return {
            circuitBreakers: circuitBreakerStats,
            retryStats: Object.fromEntries(this.retryStats)
        };
    }
}

// ===========================================================================================
// ระบบ Monitoring และ Metrics
// ===========================================================================================

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            operations: {
                total: 0,
                successful: 0,
                failed: 0,
                responseTime: []
            },
            memory: {
                peak: 0,
                current: 0,
                samples: []
            },
            connections: {
                active: 0,
                total: 0
            }
        };
        
        this.startMonitoring();
    }

    startMonitoring() {
        // Monitor memory every 30 seconds
        setInterval(() => {
            const usage = process.memoryUsage();
            this.metrics.memory.current = usage.heapUsed;
            this.metrics.memory.peak = Math.max(this.metrics.memory.peak, usage.heapUsed);
            this.metrics.memory.samples.push({
                timestamp: Date.now(),
                heapUsed: usage.heapUsed,
                heapTotal: usage.heapTotal,
                external: usage.external,
                rss: usage.rss
            });
            
            // Keep only last 100 samples
            if (this.metrics.memory.samples.length > 100) {
                this.metrics.memory.samples.shift();
            }
        }, 30000);
    }

    recordOperation(duration, success = true) {
        this.metrics.operations.total++;
        if (success) {
            this.metrics.operations.successful++;
        } else {
            this.metrics.operations.failed++;
        }
        
        this.metrics.operations.responseTime.push(duration);
        if (this.metrics.operations.responseTime.length > 1000) {
            this.metrics.operations.responseTime.shift();
        }
    }

    getMetrics() {
        const uptime = Date.now() - this.metrics.startTime;
        const successRate = this.metrics.operations.total > 0 
            ? (this.metrics.operations.successful / this.metrics.operations.total * 100)
            : 100;
        
        const avgResponseTime = this.metrics.operations.responseTime.length > 0
            ? this.metrics.operations.responseTime.reduce((a, b) => a + b, 0) / this.metrics.operations.responseTime.length
            : 0;

        return {
            uptime: Math.floor(uptime / 1000), // seconds
            uptimeHours: (uptime / (1000 * 60 * 60)).toFixed(2),
            successRate: successRate.toFixed(2),
            avgResponseTime: avgResponseTime.toFixed(2),
            operations: this.metrics.operations.total,
            memoryUsageMB: (this.metrics.memory.current / 1024 / 1024).toFixed(2),
            peakMemoryMB: (this.metrics.memory.peak / 1024 / 1024).toFixed(2),
            activeConnections: this.metrics.connections.active
        };
    }
}

// สร้าง instances ของระบบต่างๆ
const Logger = new AdvancedLogger();
const ResilientExecutor = new AdvancedResilientExecutor();
const Monitor = new PerformanceMonitor();

// ===========================================================================================
// คลาสหลักของ Bot (MAIN BOT CLASS)
// ===========================================================================================

class ThaiActivityTracker {
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
        this.cache = new MultiLevelCache();
        this.debouncer = new AdvancedDebounceManager();
        this.sessionTracker = new ActivitySessionTracker();
        this.batchProcessor = new BatchProcessor();
        
        // State management
        this.guild = null;
        this.outputChannel = null;
        this.lastMessageId = null;
        this.updateTimer = null;
        this.isReady = false;
        this.lastUpdateTime = 0;
        
        this._setupEventListeners();
        Logger.info('Thai Activity Tracker เริ่มต้นแล้ว');
    }

    // ===========================================================================================
    // การวิเคราะห์กิจกรรมของผู้ใช้ (USER ACTIVITY ANALYSIS)
    // ===========================================================================================

    getUserActivity(member) {
        const startTime = Date.now();
        try {
            if (!member?.presence?.activities?.length) {
                Monitor.recordOperation(Date.now() - startTime, true);
                return null;
            }

            // หากิจกรรมทั้งหมด
            const activities = member.presence.activities.filter(activity => 
                activity.name && 
                activity.name.trim().length > 0 &&
                !this._isExcludedActivity(activity.name)
            );

            if (activities.length === 0) {
                Monitor.recordOperation(Date.now() - startTime, true);
                return null;
            }

            // เลือกกิจกรรมที่สำคัญที่สุด (เกม > สตรีม > ทั่วไป)
            const gameActivity = activities.find(a => a.type === ActivityType.Playing);
            const streamActivity = activities.find(a => a.type === ActivityType.Streaming);
            const otherActivity = activities.find(a => 
                a.type === ActivityType.Watching || a.type === ActivityType.Competing
            );

            let selectedActivity = gameActivity || streamActivity || otherActivity;
            if (selectedActivity) {
                const result = {
                    name: selectedActivity.name.trim(),
                    type: this._determineActivityType(selectedActivity.name, selectedActivity.type),
                    discordType: selectedActivity.type
                };
                
                Monitor.recordOperation(Date.now() - startTime, true);
                return result;
            }

            Monitor.recordOperation(Date.now() - startTime, true);
            return null;
        } catch (error) {
            Monitor.recordOperation(Date.now() - startTime, false);
            Logger.debug(`ข้อผิดพลาดในการดึงกิจกรรมของ ${member?.displayName}: ${error.message}`);
            return null;
        }
    }

    _determineActivityType(activityName, discordType) {
        // เกมที่แท้จริง
        if (REAL_GAMES.has(activityName) || discordType === ActivityType.Playing) {
            return 'game';
        }
        
        // แอปสตรีมมิ่ง
        if (STREAMING_APPS.has(activityName) || discordType === ActivityType.Streaming) {
            return 'streaming';
        }
        
        // แอปทั่วไป
        return 'general';
    }

    _isExcludedActivity(activityName) {
        const excluded = ['Custom Status', 'Spotify'];
        return excluded.some(name => 
            activityName.toLowerCase().includes(name.toLowerCase())
        );
    }

    // ===========================================================================================
    // การเก็บข้อมูลกิจกรรมแบบขนาน (PARALLEL ACTIVITY DATA COLLECTION)
    // ===========================================================================================

    async collectActivityData() {
        const startTime = Date.now();
        const cacheKey = 'activityData';
        
        // ตรวจสอบแคช
        const cached = this.cache.get(cacheKey);
        if (cached) {
            Monitor.recordOperation(Date.now() - startTime, true);
            return cached;
        }

        try {
            if (!this.guild) {
                throw new Error('Guild ไม่พร้อมใช้งาน');
            }

            const activityData = new Map();
            const monitoredChannels = await this._getMonitoredChannels();

            Logger.debug(`กำลังตรวจสอบ ${monitoredChannels.length} ช่องเสียง`);

            // ประมวลผลช่องเสียงแบบขนาน
            const channelPromises = monitoredChannels.map(channel => 
                this._processVoiceChannelBatch(channel, activityData)
            );

            await Promise.allSettled(channelPromises);

            // แปลง Map เป็น Object
            const result = Object.fromEntries(
                Array.from(activityData.entries()).map(([activityName, data]) => [
                    activityName,
                    {
                        ...data,
                        channels: Array.from(data.channels),
                        users: CONFIG.showPlayerNames ? Array.from(data.users) : []
                    }
                ])
            );

            // เก็บไว้ในแคช
            this.cache.set(cacheKey, result, 'l1');
            
            Logger.debug(`เก็บข้อมูลได้ ${Object.keys(result).length} กิจกรรม`);
            Monitor.recordOperation(Date.now() - startTime, true);
            return result;
        } catch (error) {
            Monitor.recordOperation(Date.now() - startTime, false);
            Logger.error('ข้อผิดพลาดในการเก็บข้อมูลกิจกรรม:', error);
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
                Logger.warn(`ไม่สามารถดึงหมวดหมู่ ${categoryId}: ${error.message}`);
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

    async _processVoiceChannelBatch(voiceChannel, activityData) {
        try {
            if (!voiceChannel.members?.size) return;

            Logger.trace(`ประมวลผล ${voiceChannel.name} มี ${voiceChannel.members.size} สมาชิก`);

            // ประมวลผลสมาชิกทุกคนในช่องเสียง
            const memberPromises = Array.from(voiceChannel.members.values()).map(member => 
                this.batchProcessor.add(() => this._processMemberActivity(member, voiceChannel, activityData))
            );

            await Promise.allSettled(memberPromises);
        } catch (error) {
            Logger.debug(`ข้อผิดพลาดในการประมวลผลช่องเสียง ${voiceChannel.name}: ${error.message}`);
        }
    }

    async _processMemberActivity(member, voiceChannel, activityData) {
        const activity = this.getUserActivity(member);
        
        if (activity) {
            const key = `${activity.name}_${activity.type}`;
            
            if (!activityData.has(key)) {
                activityData.set(key, {
                    name: activity.name,
                    type: activity.type,
                    userCount: 0,
                    channels: new Set(),
                    users: new Set()
                });
            }

            const data = activityData.get(key);
            data.userCount++;
            data.channels.add(voiceChannel);
            
            if (CONFIG.showPlayerNames) {
                data.users.add({
                    id: member.id,
                    displayName: member.displayName,
                    username: member.user.username
                });
            }

            // ติดตามเซสชัน
            this.sessionTracker.startSession(
                member.id, 
                activity.name, 
                activity.type, 
                voiceChannel.id
            );
        }
    }

    // ===========================================================================================
    // การสร้าง Embed ขั้นสูงพร้อมสถิติโดยละเอียด
    // ===========================================================================================

    async createActivityEmbed(activityData) {
        const startTime = Date.now();
        try {
            const sortedActivities = Object.entries(activityData)
                .sort(([,a], [,b]) => b.userCount - a.userCount)
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

            if (sortedActivities.length === 0) {
                embed.addFields({
                    name: THAI_TEXT.embed.noActivity.title,
                    value: THAI_TEXT.embed.noActivity.description,
                    inline: false
                });
            } else {
                await this._addActivityFields(embed, sortedActivities);
                await this._addDetailedStatistics(embed, activityData);
                await this._addPerformanceMetrics(embed);
            }

            Monitor.recordOperation(Date.now() - startTime, true);
            return embed;
        } catch (error) {
            Monitor.recordOperation(Date.now() - startTime, false);
            Logger.error('ข้อผิดพลาดในการสร้าง embed:', error);
            return this._createErrorEmbed();
        }
    }

    async _addActivityFields(embed, sortedActivities) {
        const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        
        for (let i = 0; i < sortedActivities.length; i++) {
            const [key, data] = sortedActivities[i];
            const emoji = this._getActivityEmoji(data.type);
            const userLabel = this._getUserLabel(data.type);
            
            const channelLinks = data.channels
                .map(channel => `<#${channel.id}>`)
                .join(' • ');

            let fieldValue = [
                `**${THAI_TEXT.embed.fields.voiceChannels}:** ${channelLinks}`,
                `**${THAI_TEXT.embed.fields.userCount}:** ${data.userCount} ${THAI_TEXT.embed.stats.people}`,
                `**${THAI_TEXT.embed.fields.channelCount}:** ${data.channels.length} ${THAI_TEXT.embed.stats.channels}`
            ];

            // เพิ่มชื่อผู้ใช้หากเปิดใช้งาน
            if (CONFIG.showPlayerNames && data.users && data.users.length > 0) {
                const userMentions = data.users
                    .slice(0, 8) // จำกัดเพื่อป้องกันปัญหาขนาด embed
                    .map(user => `<@${user.id}>`)
                    .join(', ');
                
                const remainingCount = data.users.length > 8 ? ` (+${data.users.length - 8} คนอื่นๆ)` : '';
                fieldValue.push(`**${userLabel}:** ${userMentions}${remainingCount}`);
            }

            // เพิ่มเวลาเซสชันเฉลี่ย
            const avgTime = this.sessionTracker.getAverageSessionTime(data.name);
            if (avgTime > 0) {
                fieldValue.push(`**${THAI_TEXT.embed.fields.sessionTime}:** ${avgTime} ${THAI_TEXT.embed.stats.minutes}`);
            }

            embed.addFields({
                name: `${rankEmojis[i]} ${emoji} ${data.name} (${data.userCount} ${THAI_TEXT.embed.stats.people})`,
                value: fieldValue.join('\n'),
                inline: false
            });
        }
    }

    async _addDetailedStatistics(embed, activityData) {
        const totalUsers = Object.values(activityData)
            .reduce((sum, data) => sum + data.userCount, 0);
        const totalActivities = Object.keys(activityData).length;
        const activeChannels = new Set();
        
        Object.values(activityData).forEach(data => {
            data.channels.forEach(channel => activeChannels.add(channel.id));
        });

        const mostPopularToday = this.sessionTracker.getMostPopularToday();
        const performanceMetrics = this.sessionTracker.getPerformanceMetrics();
        
        const statsValue = [
            `**${THAI_TEXT.embed.stats.totalUsers}:** ${totalUsers} ${THAI_TEXT.embed.stats.people}`,
            `**${THAI_TEXT.embed.stats.totalActivities}:** ${totalActivities} ${THAI_TEXT.embed.stats.activities}`,
            `**${THAI_TEXT.embed.stats.activeChannels}:** ${activeChannels.size} ${THAI_TEXT.embed.stats.channels}`
        ];

        if (mostPopularToday) {
            const emoji = this._getActivityEmoji(mostPopularToday.type);
            statsValue.push(`**${THAI_TEXT.embed.stats.mostPopularToday}:** ${emoji} ${mostPopularToday.name}`);
        }

        if (performanceMetrics.averageSessionLengthMinutes > 0) {
            statsValue.push(`**${THAI_TEXT.embed.stats.avgDuration}:** ${performanceMetrics.averageSessionLengthMinutes} ${THAI_TEXT.embed.stats.minutes}`);
        }

        embed.addFields({
            name: THAI_TEXT.embed.stats.title,
            value: statsValue.join('\n'),
            inline: false
        });
    }

    async _addPerformanceMetrics(embed) {
        const cacheStats = this.cache.getStats();
        const monitorStats = Monitor.getMetrics();
        const logStats = Logger.getMetrics();
        
        const perfValue = [
            `**${THAI_TEXT.embed.stats.cacheHitRate}:** ${cacheStats.hitRate}%`,
            `**${THAI_TEXT.embed.stats.successRate}:** ${monitorStats.successRate}%`,
            `**${THAI_TEXT.embed.stats.uptime}:** ${monitorStats.uptimeHours} ${THAI_TEXT.embed.stats.hours}`
        ];

        embed.addFields({
            name: `⚡ ${THAI_TEXT.embed.stats.performance}`,
            value: perfValue.join('\n'),
            inline: true
        });
    }

    _getActivityEmoji(type) {
        switch (type) {
            case 'game': return THAI_TEXT.embed.emojis.game;
            case 'streaming': return THAI_TEXT.embed.emojis.streaming;
            default: return THAI_TEXT.embed.emojis.general;
        }
    }

    _getUserLabel(type) {
        switch (type) {
            case 'game': return THAI_TEXT.embed.fields.players;
            case 'streaming': return THAI_TEXT.embed.fields.viewers;
            default: return THAI_TEXT.embed.fields.users;
        }
    }

    _createErrorEmbed() {
        return new EmbedBuilder()
            .setTitle('❌ เกิดข้อผิดพลาด')
            .setDescription('ไม่สามารถโหลดข้อมูลกิจกรรมได้ในขณะนี้')
            .setColor(CONFIG.embedColors.error)
            .setTimestamp();
    }

    // ===========================================================================================
    // ระบบอัปเดตข้อความ
    // ===========================================================================================

    async updateActivityTracker() {
        return ResilientExecutor.executeWithRetry(async () => {
            if (!this.outputChannel) {
                throw new Error(THAI_TEXT.console.noOutputChannel);
            }

            Logger.info(THAI_TEXT.console.updating);
            const updateStart = Date.now();

            const activityData = await this.collectActivityData();
            const embed = await this.createActivityEmbed(activityData);

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

            this.lastUpdateTime = Date.now();
            const updateDuration = this.lastUpdateTime - updateStart;
            Logger.trace(`การอัปเดตใช้เวลา ${updateDuration}ms`);
            
        }, 'Activity tracker update', {
            maxRetries: 3,
            exponentialBackoff: true,
            circuitBreaker: true
        });
    }

    // ===========================================================================================
    // ระบบอัปเดตอัตโนมัติ
    // ===========================================================================================

    startAutoUpdate() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // อัปเดตครั้งแรกทันที
        this.debouncer.debounce('initial-update', () => {
            this.updateActivityTracker().catch(error => {
                Logger.error('การอัปเดตครั้งแรกล้มเหลว:', error);
            });
        }, 1000, true);

        // ตั้งการอัปเดตอัตโนมัติ
        this.updateTimer = setInterval(() => {
            this.debouncer.throttle('scheduled-update', () => {
                this.updateActivityTracker().catch(error => {
                    Logger.error('การอัปเดตตามกำหนดล้มเหลว:', error);
                });
            }, CONFIG.updateInterval * 1000);
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
    // Event Handlers
    // ===========================================================================================

    _setupEventListeners() {
        this.client.once('ready', () => this._handleReady());
        this.client.on('voiceStateUpdate', (oldState, newState) => this._handleVoiceStateUpdate(oldState, newState));
        this.client.on('presenceUpdate', (oldPresence, newPresence) => this._handlePresenceUpdate(oldPresence, newPresence));
        this.client.on('error', error => Logger.error('Client error:', error));
        this.client.on('warn', warning => Logger.warn('Client warning:', warning));
        this.client.on('disconnect', () => Logger.warn('Client disconnected'));
        this.client.on('reconnecting', () => Logger.info('Client reconnecting...'));
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
        Logger.info(`👤 ${CONFIG.showPlayerNames ? THAI_TEXT.console.playerNamesEnabled : THAI_TEXT.console.playerNamesDisabled}`);
    }

    _handleVoiceStateUpdate(oldState, newState) {
        if (!this.isReady) return;

        const isOldChannelMonitored = oldState.channel && this._isChannelMonitored(oldState.channel);
        const isNewChannelMonitored = newState.channel && this._isChannelMonitored(newState.channel);

        if (isOldChannelMonitored || isNewChannelMonitored) {
            Logger.debug(`${THAI_TEXT.console.voiceChange}: ${newState.member?.displayName}`);
            
            // ล้างแคชเพื่อให้ข้อมูลใหม่
            this.cache.clear();
            
            // อัปเดตแบบ debounce
            this.debouncer.debounce('voice-update', () => {
                this.updateActivityTracker();
            }, CONFIG.debounce.voiceUpdate);
        }
    }

    _handlePresenceUpdate(oldPresence, newPresence) {
        if (!this.isReady || !newPresence?.member) return;

        const voiceState = newPresence.member.voice;
        if (voiceState.channel && this._isChannelMonitored(voiceState.channel)) {
            Logger.debug(`${THAI_TEXT.console.activityChange}: ${newPresence.member.displayName}`);
            
            // ล้างแคชเพื่อให้ข้อมูลใหม่
            this.cache.clear();
            
            // อัปเดตแบบ debounce
            this.debouncer.debounce('presence-update', () => {
                this.updateActivityTracker();
            }, CONFIG.debounce.presenceUpdate);
        }
    }

    _isChannelMonitored(channel) {
        if (!channel || channel.type !== ChannelType.GuildVoice) return false;
        return CONFIG.monitoredCategoryIds.includes(channel.parentId);
    }

    // ===========================================================================================
    // การจัดการวงชีวิตของ Bot
    // ===========================================================================================

    async start() {
        try {
            Logger.info('กำลังเริ่มต้น Thai Activity Tracker...');
            await this.client.login(CONFIG.token);
        } catch (error) {
            Logger.error('ไม่สามารถเริ่มต้น bot:', error);
            throw error;
        }
    }

    async stop() {
        Logger.info(`\n🛑 ${THAI_TEXT.console.stopping}`);
        
        this.stopAutoUpdate();
        this.cache.destroy();
        this.debouncer.clear();
        
        if (this.client) {
            this.client.destroy();
        }
        
        Logger.info('Thai Activity Tracker หยุดทำงานแล้ว');
    }

    // ===========================================================================================
    // การติดตามประสิทธิภาพ
    // ===========================================================================================

    getPerformanceStats() {
        return {
            bot: {
                isReady: this.isReady,
                lastUpdateTime: this.lastUpdateTime,
                uptime: Date.now() - this.sessionTracker.performanceMetrics.startTime || 0
            },
            cache: this.cache.getStats(),
            monitor: Monitor.getMetrics(),
            logger: Logger.getMetrics(),
            resilience: ResilientExecutor.getStats(),
            session: this.sessionTracker.getPerformanceMetrics(),
            database: {
                realGames: REAL_GAMES.size,
                streamingApps: STREAMING_APPS.size,
                generalApps: GENERAL_APPS.size
            }
        };
    }
}

// ===========================================================================================
// การเริ่มต้นและการจัดการ Process
// ===========================================================================================

const bot = new ThaiActivityTracker();

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    Logger.info('ได้รับสัญญาณ SIGINT...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    Logger.info('ได้รับสัญญาณ SIGTERM...');
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

// Memory monitoring
process.on('warning', (warning) => {
    Logger.warn('Process warning:', warning);
});

// เริ่มต้น bot
Logger.info('กำลังเริ่มต้น Thai Activity Tracker Bot...');
bot.start().catch(error => {
    Logger.error(THAI_TEXT.errors.connectionFailed, error);
    process.exit(1);
});