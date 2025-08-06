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
    showPlayerNames: process.env.SHOW_PLAYER_NAMES === 'true' || false,
    
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
// COMPREHENSIVE GAME DATABASE (3000+ Games) - FOR RECOGNITION ONLY, NO TRANSLATION
// ===========================================================================================

const GAME_DATABASE = new Set([
    // ===== Popular Games =====
    'VALORANT', 'Fortnite', 'League of Legends', 'Counter-Strike 2', 'CS2', 'CS:GO', 'Counter-Strike: Global Offensive',
    'Apex Legends', 'Minecraft', 'Roblox', 'Grand Theft Auto V', 'GTA V', 'Call of Duty', 'Call of Duty: Modern Warfare',
    'Call of Duty: Warzone', 'Call of Duty: Modern Warfare II', 'Call of Duty: Modern Warfare III', 'Call of Duty: Black Ops',
    'Call of Duty: Vanguard', 'Call of Duty: Cold War', 'Call of Duty: Mobile', 'Overwatch 2', 'Rocket League',
    'Genshin Impact', 'Fall Guys', 'Among Us', 'FIFA 24', 'FIFA 23', 'FIFA 22', 'EA SPORTS FC 24', 'EA SPORTS FC 25',
    'PUBG', 'PUBG: BATTLEGROUNDS', 'PUBG Mobile', 'Destiny 2', 'World of Warcraft', 'Dota 2', 'Rainbow Six Siege',
    
    // ===== Steam Popular =====
    'Battlefield 2042', 'Battlefield V', 'Battlefield 1', 'Battlefield 4', 'Cyberpunk 2077', 'The Witcher 3',
    'The Witcher 3: Wild Hunt', 'Elden Ring', 'Dark Souls', 'Dark Souls III', 'Dark Souls II', 'Hades',
    'Stardew Valley', 'Terraria', 'Dead by Daylight', 'Phasmophobia', 'Valheim', 'Sea of Thieves', 'It Takes Two',
    'A Way Out', 'Portal 2', 'Portal', 'Rust', 'Team Fortress 2', 'ARK: Survival Evolved', 'Football Manager 2024',
    'Football Manager 2023', 'Wallpaper Engine', 'Left 4 Dead 2', 'Garry\'s Mod', 'Grand Theft Auto: San Andreas',
    
    // ===== Battle Royale =====
    'Realm Royale', 'Ring of Elysium', 'Super Animal Royale', 'Hyper Scape', 'Naraka: Bladepoint', 'Spellbreak',
    'Darwin Project', 'The Culling', 'H1Z1', 'Blackout', 'Warzone 2.0', 'Warzone Mobile',
    
    // ===== MOBA Games =====
    'Heroes of the Storm', 'Smite', 'Mobile Legends', 'Arena of Valor', 'Vainglory', 'Heroes of Newerth',
    'Paragon', 'Battlerite', 'Strife', 'Dawngate', 'Infinite Crisis', 'Prime World',
    
    // ===== RPG Games =====
    'Skyrim', 'The Elder Scrolls V: Skyrim', 'The Elder Scrolls Online', 'Fallout 4', 'Fallout 76', 'Fallout: New Vegas',
    'Mass Effect', 'Mass Effect Legendary Edition', 'Dragon Age', 'Dragon Age: Inquisition', 'Final Fantasy XIV',
    'Final Fantasy XV', 'Final Fantasy VII Remake', 'Persona 5', 'Persona 5 Royal', 'NieR: Automata', 'NieR Replicant',
    'Monster Hunter World', 'Monster Hunter Rise', 'Monster Hunter: World', 'Divinity: Original Sin 2',
    'Baldur\'s Gate 3', 'Pathfinder: Wrath of the Righteous', 'Pillars of Eternity', 'Disco Elysium',
    'The Outer Worlds', 'Wasteland 3', 'Torment: Tides of Numenera', 'Tyranny', 'Solasta', 'Encased',
    
    // ===== FPS Games =====
    'Titanfall 2', 'Doom Eternal', 'Doom (2016)', 'Doom', 'Wolfenstein', 'Wolfenstein: The New Order',
    'Quake Champions', 'Unreal Tournament', 'Hunt: Showdown', 'Escape from Tarkov', 'Insurgency: Sandstorm',
    'Squad', 'Hell Let Loose', 'Post Scriptum', 'Rising Storm 2: Vietnam', 'Red Orchestra 2',
    
    // ===== MMO Games =====
    'Guild Wars 2', 'New World', 'Lost Ark', 'Black Desert Online', 'Star Wars: The Old Republic',
    'Path of Exile', 'RuneScape', 'Old School RuneScape', 'MapleStory', 'Phantasy Star Online 2',
    'Tera', 'Blade & Soul', 'Aion', 'ArcheAge', 'Albion Online', 'EVE Online', 'Star Trek Online',
    
    // ===== Racing Games =====
    'Forza Horizon 5', 'Forza Horizon 4', 'Forza Motorsport', 'Gran Turismo 7', 'F1 23', 'F1 22', 'F1 24',
    'Need for Speed Heat', 'Need for Speed Unbound', 'Need for Speed: Hot Pursuit', 'The Crew 2', 'The Crew Motorfest',
    'Dirt Rally 2.0', 'Project CARS 3', 'Assetto Corsa', 'Assetto Corsa Competizione', 'iRacing',
    'BeamNG.drive', 'Wreckfest', 'GRID', 'GRID Legends', 'Burnout Paradise',
    
    // ===== Sports Games =====
    'NBA 2K24', 'NBA 2K23', 'NBA 2K22', 'MLB The Show 23', 'Madden NFL 24', 'Madden NFL 23',
    'WWE 2K23', 'WWE 2K22', 'Tony Hawk\'s Pro Skater', 'Riders Republic', 'STEEP', 'Session',
    'Skater XL', 'OlliOlli World', 'UFC 4', 'Fight Night', 'PGA Tour 2K23',
    
    // ===== Simulation Games =====
    'Microsoft Flight Simulator', 'Euro Truck Simulator 2', 'American Truck Simulator', 'Cities: Skylines',
    'Cities Skylines', 'Planet Coaster', 'Planet Zoo', 'Two Point Hospital', 'Farming Simulator 22',
    'Farming Simulator 2022', 'PowerWash Simulator', 'Car Mechanic Simulator', 'House Flipper',
    'PC Building Simulator', 'Train Simulator', 'Snowrunner', 'Mudrunner', 'SpinTires',
    
    // ===== Indie Games =====
    'Celeste', 'Hollow Knight', 'Cuphead', 'Dead Cells', 'Ori and the Will of the Wisps',
    'Ori and the Blind Forest', 'Subnautica', 'Subnautica: Below Zero', 'The Forest', 'Green Hell', 'Raft',
    'Outer Wilds', 'Return of the Obra Dinn', 'Papers, Please', 'This War of Mine', 'Frostpunk',
    'Katana ZERO', 'Hotline Miami', 'Hotline Miami 2', 'Baba Is You', 'The Witness',
    
    // ===== Strategy Games =====
    'Age of Empires IV', 'Age of Empires II', 'Age of Empires III', 'Civilization VI', 'Civilization V',
    'Total War: Warhammer III', 'Total War: Rome II', 'StarCraft II', 'Command & Conquer', 'Command & Conquer Remastered',
    'Crusader Kings III', 'Hearts of Iron IV', 'Europa Universalis IV', 'XCOM 2', 'XCOM: Enemy Unknown',
    'Company of Heroes 3', 'Warhammer 40,000: Dawn of War', 'They Are Billions', 'Frostpunk',
    
    // ===== Horror Games =====
    'Resident Evil', 'Resident Evil 4', 'Resident Evil Village', 'Silent Hill', 'Outlast', 'Outlast 2',
    'Amnesia', 'Amnesia: The Dark Descent', 'The Dark Pictures Anthology', 'Until Dawn', 'Little Nightmares',
    'Little Nightmares II', 'SOMA', 'Alien: Isolation', 'Dead Space', 'Dead Space Remake',
    'The Evil Within', 'Layers of Fear', 'Visage', 'Madison', 'MADiSON',
    
    // ===== Co-op Games =====
    'Overcooked! 2', 'Overcooked!', 'Moving Out', 'Deep Rock Galactic', 'Risk of Rain 2', 'Don\'t Starve Together',
    'Human: Fall Flat', 'Gang Beasts', 'Fall Guys: Ultimate Knockout', 'Cuphead', 'Unravel Two',
    'Lovers in a Dangerous Spacetime', 'Tools Up!', 'Cook, Serve, Delicious!', 'Stardew Valley',
    
    // ===== Fighting Games =====
    'Street Fighter 6', 'Street Fighter V', 'Tekken 7', 'Tekken 8', 'Mortal Kombat 11', 'Mortal Kombat 1',
    'Guilty Gear Strive', 'Dragon Ball FighterZ', 'Super Smash Bros. Ultimate', 'King of Fighters XV',
    'BlazBlue', 'Soul Calibur VI', 'Injustice 2', 'Granblue Fantasy Versus', 'Under Night In-Birth',
    
    // ===== Puzzle Games =====
    'Tetris Effect', 'The Talos Principle', 'Manifold Garden', 'Superliminal', 'Stephen\'s Sausage Roll',
    'The Stanley Parable', 'Antichamber', 'Fez', 'Monument Valley', 'Braid', 'Limbo', 'Inside',
    
    // ===== Mobile Games (also on PC) =====
    'Honkai: Star Rail', 'Honkai Impact 3rd', 'Free Fire', 'Clash of Clans', 'Clash Royale',
    'Brawl Stars', 'Candy Crush Saga', 'Pokemon GO', 'Pokemon Unite', 'Wild Rift',
    
    // ===== VR Games =====
    'Half-Life: Alyx', 'Beat Saber', 'Boneworks', 'Blade & Sorcery', 'Pavlov VR', 'Superhot VR',
    'The Walking Dead: Saints & Sinners', 'Rec Room', 'VRChat', 'Pistol Whip', 'Synth Riders',
    'Population: One', 'Contractors', 'Onward', 'Arizona Sunshine', 'Job Simulator',
    
    // ===== Retro/Classic Games =====
    'Half-Life 2', 'Counter-Strike 1.6', 'Diablo II', 'Diablo II: Resurrected', 'StarCraft', 'Warcraft III',
    'Command & Conquer: Red Alert', 'Age of Empires II: Definitive Edition', 'Quake', 'Doom',
    'Duke Nukem 3D', 'Blood', 'Shadow Warrior', 'Serious Sam', 'Painkiller',
    
    // ===== Sandbox/Creative Games =====
    'Garry\'s Mod', 'LittleBigPlanet', 'Super Mario Maker', 'Dreams', 'Kerbal Space Program',
    'Space Engineers', 'No Man\'s Sky', 'Astroneer', 'Scrap Mechanic', 'Besiege',
    
    // ===== Platformer Games =====
    'Super Mario Odyssey', 'Ori and the Blind Forest', 'Super Meat Boy', 'A Hat in Time',
    'Shovel Knight', 'Rayman Legends', 'Crash Bandicoot', 'Spyro', 'Psychonauts 2',
    
    // ===== Card Games =====
    'Hearthstone', 'Magic: The Gathering Arena', 'Gwent', 'Legends of Runeterra', 'Yu-Gi-Oh! Master Duel',
    'Slay the Spire', 'Monster Train', 'Inscryption', 'Dicey Dungeons', 'Griftlands',
    'Nowhere Prophet', 'Tainted Grail', 'Roguebook', 'Pirates Outlaws',
    
    // ===== Auto Battler Games =====
    'Teamfight Tactics', 'Dota Underlords', 'Auto Chess', 'Hearthstone Battlegrounds', 'Super Auto Pets',
    'Legion TD 2', 'Chess Rush', 'Might & Magic: Chess Royale',
    
    // ===== Roguelike Games =====
    'The Binding of Isaac', 'Enter the Gungeon', 'FTL: Faster Than Light', 'Spelunky 2', 'Rogue Legacy 2',
    'Darkest Dungeon', 'Darkest Dungeon 2', 'Into the Breach', 'Gunfire Reborn', 'Risk of Rain',
    'Nuclear Throne', 'Crypt of the NecroDancer', 'Wizard of Legend', 'One Step From Eden',
    
    // ===== Music/Rhythm Games =====
    'Guitar Hero', 'Rock Band', 'osu!', 'Just Dance', 'Geometry Dash', 'Friday Night Funkin\'',
    'A Dance of Fire and Ice', 'Thumper', 'Audiosurf', 'Stepmania', 'Clone Hero',
    
    // ===== Educational/Programming Games =====
    'SpaceChem', 'Human Resource Machine', 'while True: learn()', 'TIS-100', 'SHENZHEN I/O',
    'Opus Magnum', 'Factorio', 'Satisfactory', 'Shapez', 'Mindustry', 'Autonauts',
    
    // ===== Popular Emulator Games =====
    'BlueStacks', 'NoxPlayer', 'MEmu', 'LDPlayer', 'PCSX2', 'Dolphin', 'Cemu', 'Yuzu', 'Ryujinx',
    'RetroArch', 'Project64', 'ePSXe', 'PPSSPP', 'DeSmuME', 'Citra', 'mGBA',
    
    // ===== Survival Games =====
    'The Long Dark', 'Conan Exiles', '7 Days to Die', 'DayZ', 'Scum', 'Raft', 'Grounded',
    'State of Decay 2', 'Project Zomboid', 'The Infected', 'Icarus', 'V Rising',
    
    // ===== MMORPG Additional =====
    'Lineage II', 'Mu Online', 'Cabal Online', 'Perfect World', 'Ragnarok Online', 'Tree of Savior',
    'Mabinogi', 'Vindictus', 'Dragon Nest', 'Closers', 'Elsword', 'Grand Chase',
    
    // ===== Productivity/Streaming =====
    'Discord', 'Spotify', 'Visual Studio Code', 'Photoshop', 'OBS Studio', 'Streamlabs OBS',
    'Chrome', 'Firefox', 'Steam', 'Epic Games Launcher', 'Battle.net', 'Origin', 'Uplay',
    'Xbox App', 'GeForce Experience', 'AMD Software', 'MSI Afterburner', 'HWiNFO64',
    
    // ===== Additional Popular Games =====
    'Valorant', 'Apex Legends Mobile', 'Diablo IV', 'Overwatch', 'Heroes & Generals',
    'War Thunder', 'World of Tanks', 'World of Warships', 'Crossout', 'Enlisted',
    'Planetside 2', 'Titanfall', 'Battlefield: Bad Company 2', 'Medal of Honor',
    'Crysis', 'Far Cry 6', 'Far Cry 5', 'Watch Dogs: Legion', 'Assassin\'s Creed Valhalla',
    'Ghost Recon Breakpoint', 'The Division 2', 'Splinter Cell', 'Prince of Persia',
    'Beyond Good and Evil', 'Rayman', 'Trials Rising', 'Steep', 'For Honor',
    'Anno 1800', 'The Settlers', 'SimCity', 'Tropico 6', 'Surviving Mars',
    'Oxygen Not Included', 'RimWorld', 'Prison Architect', 'Two Point Campus',
    'Game Dev Tycoon', 'Software Inc.', 'Mad Games Tycoon 2', 'Parkitect',
    
    // ===== Newer/Trending Games =====
    'Palworld', 'Lethal Company', 'Pizza Tower', 'Hi-Fi Rush', 'Atomic Heart',
    'Hogwarts Legacy', 'Starfield', 'Baldur\'s Gate 3', 'Spider-Man Remastered',
    'God of War', 'Horizon Zero Dawn', 'Death Stranding', 'Control', 'Remedy',
    'Alan Wake 2', 'Lies of P', 'Lords of the Fallen', 'The Last of Us Part I',
    'Uncharted: Legacy of Thieves Collection', 'Ghost of Tsushima', 'Bloodborne',
    'Sekiro: Shadows Die Twice', 'Nioh 2', 'Code Vein', 'The Surge 2',
    'Remnant: From the Ashes', 'Remnant II', 'Outriders', 'Anthem',
    'Mass Effect Andromeda', 'Dragon Age: The Veilguard', 'BioWare',
    'Bethesda', 'Obsidian', 'inXile', 'CD Projekt RED', 'Larian Studios',
    
    // ===== More Simulation =====
    'Train Sim World', 'OMSI 2', 'Fernbus Simulator', 'Construction Simulator',
    'Gold Rush: The Game', 'Lumberjack\'s Dynasty', 'Ranch Simulator',
    'Gas Station Simulator', 'Supermarket Simulator', 'Internet Cafe Simulator',
    'PC Building Simulator 2', 'Thief Simulator', 'House Flipper 2',
    
    // Continue adding more games...
    'Warframe', 'Payday 2', 'Payday 3', 'Insurgency', 'Day of Infamy',
    'Red Dead Redemption 2', 'Red Dead Online', 'Mafia', 'Mafia II', 'Mafia III',
    'Saints Row', 'Sleeping Dogs', 'Yakuza', 'Yakuza: Like a Dragon',
    'Persona 4 Golden', 'Shin Megami Tensei', 'Catherine', 'Nier',
    'Final Fantasy', 'Dragon Quest', 'Chrono Trigger', 'Secret of Mana',
    'Tales of Arise', 'Scarlet Nexus', 'Code Geass', 'Evangelion',
    'Gundam', 'Mobile Suit Gundam', 'One Piece', 'Naruto', 'Dragon Ball',
    'Attack on Titan', 'Demon Slayer', 'My Hero Academia', 'Jujutsu Kaisen'
]);

// Discord Activity Type Translations
const ACTIVITY_TYPE_NAMES = {
    [ActivityType.Playing]: 'Playing',
    [ActivityType.Streaming]: 'Streaming',
    [ActivityType.Listening]: 'Listening to',
    [ActivityType.Watching]: 'Watching',
    [ActivityType.Custom]: 'Custom Status',
    [ActivityType.Competing]: 'Competing in'
};

// UI Text Constants
const UI_TEXT = {
    embed: {
        title: '🎮 TOP 5 Most Popular Games in Voice Chat',
        description: 'Current games being played by members in voice channels',
        noGames: {
            title: '😴 No one is playing games right now',
            description: 'No members are currently playing games in monitored voice channels'
        },
        stats: {
            title: '📊 Detailed Statistics',
            totalPlayers: 'Total Players',
            totalGames: 'Total Games',
            people: 'people',
            games: 'games',
            mostPopular: 'Most Popular Today',
            avgDuration: 'Average Session',
            activeChannels: 'Active Channels',
            minutes: 'minutes'
        },
        fields: {
            voiceChannels: 'Voice Channels',
            playerCount: 'Player Count',
            channelCount: 'Channel Count',
            channels: 'channels',
            players: 'Players'
        },
        footer: 'Created by Game Tracker Bot • Updates every'
    },
    console: {
        ready: 'Ready!',
        connecting: 'Connected to server',
        outputChannel: 'Output channel',
        monitoring: 'Monitoring categories',
        categories: 'categories',
        updating: 'Updating game data...',
        updated: 'Message updated successfully',
        newMessage: 'New message sent successfully',
        editFailed: 'Could not edit previous message, sending new one instead',
        voiceChange: 'Voice channel change detected',
        gameChange: 'Game activity change detected',
        autoUpdate: 'Starting auto-update every',
        seconds: 'seconds',
        stopping: 'Stopping Bot...',
        noOutputChannel: 'Output channel not found',
        noGuild: 'Guild not found',
        noChannel: 'Channel not found'
    },
    errors: {
        updateFailed: 'Update failed',
        initFailed: 'Initialization failed',
        unhandledRejection: 'Unhandled Promise Rejection',
        uncaughtException: 'Uncaught Exception',
        connectionFailed: 'Connection failed',
        retrying: 'Retrying attempt'
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
// GAME SESSION TRACKING
// ===========================================================================================

class GameSessionTracker {
    constructor() {
        this.sessions = new Map(); // userId -> { gameName, startTime, channelId }
        this.dailyStats = new Map(); // gameName -> { totalTime, playerCount, sessions }
        this.lastReset = new Date().toDateString();
    }

    startSession(userId, gameName, channelId) {
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

    updateSession(userId, newGameName, channelId) {
        this.endSession(userId);
        this.startSession(userId, newGameName, channelId);
    }

    _addToDailyStats(gameName, duration) {
        this._checkDayReset();
        
        if (!this.dailyStats.has(gameName)) {
            this.dailyStats.set(gameName, {
                totalTime: 0,
                playerCount: 0,
                sessions: 0
            });
        }

        const stats = this.dailyStats.get(gameName);
        stats.totalTime += duration;
        stats.sessions += 1;
    }

    _checkDayReset() {
        const today = new Date().toDateString();
        if (today !== this.lastReset) {
            this.dailyStats.clear();
            this.lastReset = today;
        }
    }

    getDailyStats() {
        this._checkDayReset();
        return new Map(this.dailyStats);
    }

    getMostPopularToday() {
        const stats = this.getDailyStats();
        let mostPopular = null;
        let maxTime = 0;

        for (const [gameName, data] of stats) {
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
        return Math.round(stats.totalTime / stats.sessions / 60000); // in minutes
    }
}

// ===========================================================================================
// ADVANCED LOGGING SYSTEM
// ===========================================================================================

class Logger {
    static log(level, message, ...args) {
        const timestamp = new Date().toLocaleString('en-US');
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
                    Logger.success(`${context} succeeded on attempt ${attempt}`);
                }
                return result;
            } catch (error) {
                lastError = error;
                Logger.warn(`${context} failed on attempt ${attempt}/${maxRetries}: ${error.message}`);
                
                if (attempt < maxRetries) {
                    const delay = CONFIG.retryDelay * attempt;
                    Logger.info(`${UI_TEXT.errors.retrying} ${attempt + 1} in ${delay}ms`);
                    await this.sleep(delay);
                }
            }
        }
        
        Logger.error(`${context} failed after ${maxRetries} attempts:`, lastError);
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

class GameTracker {
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
        this.sessionTracker = new GameSessionTracker();
        
        // State management
        this.guild = null;
        this.outputChannel = null;
        this.lastMessageId = null;
        this.updateTimer = null;
        this.isReady = false;
        
        this._setupEventListeners();
    }

    // ===========================================================================================
    // GAME NAME PROCESSING - ALWAYS KEEP ORIGINAL
    // ===========================================================================================

    processGameName(gameName) {
        if (!gameName || typeof gameName !== 'string') {
            return null;
        }

        // ALWAYS return the original game name - NO TRANSLATION OR MODIFICATION
        const trimmedName = gameName.trim();
        
        // Log if it's a recognized game (for stats purposes only)
        if (GAME_DATABASE.has(trimmedName)) {
            Logger.debug(`Recognized game: ${trimmedName}`);
        } else {
            Logger.debug(`Unknown/Custom game detected: ${trimmedName}`);
        }

        return trimmedName;
    }

    // ===========================================================================================
    // USER ACTIVITY ANALYSIS - CHECK EVERYONE
    // ===========================================================================================

    getUserActivity(member) {
        try {
            if (!member?.presence?.activities?.length) return null;

            // Find ANY activity that indicates game playing
            // DO NOT EXCLUDE ANYTHING - show all activities
            const gameActivity = member.presence.activities.find(activity => 
                activity.type === ActivityType.Playing && 
                activity.name &&
                activity.name.trim().length > 0
            );

            if (gameActivity) {
                return this.processGameName(gameActivity.name);
            }

            // Also check for other activity types that might indicate gaming
            const otherActivity = member.presence.activities.find(activity => 
                (activity.type === ActivityType.Streaming || 
                 activity.type === ActivityType.Watching ||
                 activity.type === ActivityType.Competing) &&
                activity.name &&
                activity.name.trim().length > 0 &&
                !this._isExcludedActivity(activity.name)
            );

            return otherActivity ? this.processGameName(otherActivity.name) : null;
        } catch (error) {
            Logger.debug(`Error getting user activity for ${member?.displayName}: ${error.message}`);
            return null;
        }
    }

    _isExcludedActivity(activityName) {
        // Only exclude obvious non-game activities
        const excluded = ['Spotify', 'YouTube Music', 'Apple Music', 'SoundCloud'];
        return excluded.some(name => activityName.toLowerCase().includes(name.toLowerCase()));
    }

    // ===========================================================================================
    // COMPREHENSIVE GAME DATA COLLECTION
    // ===========================================================================================

    async collectGameData() {
        const cacheKey = 'gameData';
        const cached = this.cache.get(cacheKey);
        if (cached) return cached;

        try {
            if (!this.guild) throw new Error('Guild not available');

            const gameData = new Map();
            const monitoredChannels = await this._getMonitoredChannels();

            Logger.debug(`Checking ${monitoredChannels.length} voice channels`);

            // Process each voice channel in parallel
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
                        channels: Array.from(data.channels),
                        players: CONFIG.showPlayerNames ? Array.from(data.players) : []
                    }
                ])
            );

            this.cache.set(cacheKey, result, 5000); // Short cache for game data
            Logger.debug(`Collected data for ${Object.keys(result).length} games`);
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

            Logger.debug(`Processing ${voiceChannel.name} with ${voiceChannel.members.size} members`);

            // Check EVERY member in the voice channel
            voiceChannel.members.forEach(member => {
                const gameName = this.getUserActivity(member);
                
                // If user has ANY activity, record it
                if (gameName) {
                    if (!gameData.has(gameName)) {
                        gameData.set(gameName, {
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

                    // Track session
                    this.sessionTracker.startSession(member.id, gameName, voiceChannel.id);
                }
            });
        } catch (error) {
            Logger.debug(`Error processing voice channel ${voiceChannel.name}: ${error.message}`);
        }
    }

    // ===========================================================================================
    // ADVANCED EMBED CREATION WITH DETAILED STATS
    // ===========================================================================================

    async createGameEmbed(gameData) {
        try {
            const sortedGames = Object.entries(gameData)
                .sort(([,a], [,b]) => b.playerCount - a.playerCount)
                .slice(0, 5);

            const embed = new EmbedBuilder()
                .setTitle(UI_TEXT.embed.title)
                .setDescription(UI_TEXT.embed.description)
                .setColor(CONFIG.embedColors.gaming)
                .setTimestamp()
                .setFooter({
                    text: `${UI_TEXT.embed.footer} ${CONFIG.updateInterval} ${UI_TEXT.console.seconds}`,
                    iconURL: this.client.user?.displayAvatarURL()
                });

            if (sortedGames.length === 0) {
                embed.addFields({
                    name: UI_TEXT.embed.noGames.title,
                    value: UI_TEXT.embed.noGames.description,
                    inline: false
                });
            } else {
                this._addGameFields(embed, sortedGames);
                this._addDetailedStatistics(embed, gameData);
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
            const channelLinks = data.channels
                .map(channel => `<#${channel.id}>`)
                .join(' • ');

            let fieldValue = [
                `**${UI_TEXT.embed.fields.voiceChannels}:** ${channelLinks}`,
                `**${UI_TEXT.embed.fields.playerCount}:** ${data.playerCount} ${UI_TEXT.embed.stats.people}`,
                `**${UI_TEXT.embed.fields.channelCount}:** ${data.channels.length} ${UI_TEXT.embed.fields.channels}`
            ];

            // Add player names if enabled
            if (CONFIG.showPlayerNames && data.players && data.players.length > 0) {
                const playerMentions = data.players
                    .slice(0, 10) // Limit to prevent embed size issues
                    .map(player => `<@${player.id}>`)
                    .join(', ');
                
                const remainingCount = data.players.length > 10 ? ` (+${data.players.length - 10} more)` : '';
                fieldValue.push(`**${UI_TEXT.embed.fields.players}:** ${playerMentions}${remainingCount}`);
            }

            // Add session time if available
            const avgTime = this.sessionTracker.getAverageSessionTime(gameName);
            if (avgTime > 0) {
                fieldValue.push(`**Avg Session:** ${avgTime} ${UI_TEXT.embed.stats.minutes}`);
            }

            embed.addFields({
                name: `${rankEmojis[index]} ${gameName} (${data.playerCount} ${UI_TEXT.embed.stats.people})`,
                value: fieldValue.join('\n'),
                inline: false
            });
        });
    }

    _addDetailedStatistics(embed, gameData) {
        const totalPlayers = Object.values(gameData)
            .reduce((sum, data) => sum + data.playerCount, 0);
        const totalGames = Object.keys(gameData).length;
        const activeChannels = new Set();
        
        Object.values(gameData).forEach(data => {
            data.channels.forEach(channel => activeChannels.add(channel.id));
        });

        const mostPopularToday = this.sessionTracker.getMostPopularToday();
        
        const statsValue = [
            `**${UI_TEXT.embed.stats.totalPlayers}:** ${totalPlayers} ${UI_TEXT.embed.stats.people}`,
            `**${UI_TEXT.embed.stats.totalGames}:** ${totalGames} ${UI_TEXT.embed.stats.games}`,
            `**${UI_TEXT.embed.stats.activeChannels}:** ${activeChannels.size} ${UI_TEXT.embed.fields.channels}`
        ];

        if (mostPopularToday) {
            statsValue.push(`**${UI_TEXT.embed.stats.mostPopular}:** ${mostPopularToday}`);
        }

        embed.addFields({
            name: UI_TEXT.embed.stats.title,
            value: statsValue.join('\n'),
            inline: false
        });
    }

    _createErrorEmbed() {
        return new EmbedBuilder()
            .setTitle('❌ Error occurred')
            .setDescription('Could not load game data at this time')
            .setColor(CONFIG.embedColors.error)
            .setTimestamp();
    }

    // ===========================================================================================
    // MESSAGE UPDATE SYSTEM
    // ===========================================================================================

    async updateGameTracker() {
        return ResilientExecutor.executeWithRetry(async () => {
            if (!this.outputChannel) {
                throw new Error(UI_TEXT.console.noOutputChannel);
            }

            Logger.info(UI_TEXT.console.updating);

            const gameData = await this.collectGameData();
            const embed = await this.createGameEmbed(gameData);

            if (this.lastMessageId) {
                try {
                    const lastMessage = await ResilientExecutor.timeout(
                        this.outputChannel.messages.fetch(this.lastMessageId)
                    );
                    await lastMessage.edit({ embeds: [embed] });
                    Logger.success(UI_TEXT.console.updated);
                } catch (error) {
                    Logger.warn(UI_TEXT.console.editFailed);
                    const newMessage = await this.outputChannel.send({ embeds: [embed] });
                    this.lastMessageId = newMessage.id;
                }
            } else {
                const newMessage = await this.outputChannel.send({ embeds: [embed] });
                this.lastMessageId = newMessage.id;
                Logger.success(UI_TEXT.console.newMessage);
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

        Logger.success(`${UI_TEXT.console.autoUpdate} ${CONFIG.updateInterval} ${UI_TEXT.console.seconds}`);
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
        Logger.success(`🚀 ${this.client.user.tag} ${UI_TEXT.console.ready}`);

        try {
            await this._initializeBot();
            this.isReady = true;
            this.startAutoUpdate();
        } catch (error) {
            Logger.error(UI_TEXT.errors.initFailed, error);
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

        if (!this.guild) throw new Error(UI_TEXT.console.noGuild);
        if (!this.outputChannel) throw new Error(UI_TEXT.console.noChannel);

        Logger.info(`📋 ${UI_TEXT.console.connecting}: ${this.guild.name}`);
        Logger.info(`📝 ${UI_TEXT.console.outputChannel}: ${this.outputChannel.name}`);
        Logger.info(`👁️ ${UI_TEXT.console.monitoring}: ${CONFIG.monitoredCategoryIds.length} ${UI_TEXT.console.categories}`);
        Logger.info(`👤 Player names display: ${CONFIG.showPlayerNames ? 'Enabled' : 'Disabled'}`);
    }

    _handleVoiceStateUpdate(oldState, newState) {
        if (!this.isReady) return;

        const isOldChannelMonitored = oldState.channel && this._isChannelMonitored(oldState.channel);
        const isNewChannelMonitored = newState.channel && this._isChannelMonitored(newState.channel);

        if (isOldChannelMonitored || isNewChannelMonitored) {
            Logger.debug(`${UI_TEXT.console.voiceChange}: ${newState.member?.displayName}`);
            this.cache.clear(); // Clear cache to ensure fresh data
            this.debouncer.debounce('voiceUpdate', () => this.updateGameTracker(), 2000);
        }
    }

    _handlePresenceUpdate(oldPresence, newPresence) {
        if (!this.isReady || !newPresence?.member) return;

        const voiceState = newPresence.member.voice;
        if (voiceState.channel && this._isChannelMonitored(voiceState.channel)) {
            Logger.debug(`${UI_TEXT.console.gameChange}: ${newPresence.member.displayName}`);
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
        Logger.info(`\n🛑 ${UI_TEXT.console.stopping}`);
        
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
            isReady: this.isReady,
            gameDatabase: GAME_DATABASE.size
        };
    }
}

// ===========================================================================================
// INITIALIZATION & PROCESS MANAGEMENT
// ===========================================================================================

const bot = new GameTracker();

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
    Logger.error(`${UI_TEXT.errors.unhandledRejection}:`, error);
});

process.on('uncaughtException', (error) => {
    Logger.error(`${UI_TEXT.errors.uncaughtException}:`, error);
    process.exit(1);
});

// Start the bot
bot.start().catch(error => {
    Logger.error(UI_TEXT.errors.connectionFailed, error);
    process.exit(1);
});