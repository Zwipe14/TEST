const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMembers
    ]
});

// Bot Konfiguration
const config = {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    outputChannelId: process.env.OUTPUT_CHANNEL_ID,
    monitoredCategoryIds: process.env.MONITORED_CATEGORY_IDS?.split(',') || [],
    updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 10
};

// Globale Variablen
let guild = null;
let outputChannel = null;
let lastMessageId = null;
let updateTimer = null;

// Thailändische Übersetzungen für Spiele
const gameTranslations = {
    'VALORANT': 'วาโลแรนต์',
    'Fortnite': 'ฟอร์ทไนท์',
    'League of Legends': 'ลีกออฟเลเจนด์',
    'Counter-Strike 2': 'เคาน์เตอร์-สไตรค์ 2',
    'Apex Legends': 'เอเพ็กซ์ เลเจนด์',
    'Minecraft': 'ไมน์คราฟต์',
    'Roblox': 'โรบล็อกซ์',
    'Grand Theft Auto V': 'แกรนด์เธฟต์ออโต 5',
    'Call of Duty': 'คอลออฟดิวตี้',
    'Overwatch 2': 'โอเวอร์วอทช์ 2',
    'Rocket League': 'ร็อกเก็ตลีก',
    'Genshin Impact': 'เกนชินอิมแพ็ค',
    'Fall Guys': 'ฟอลล์กายส์',
    'Among Us': 'อะมองอัส',
    'FIFA 24': 'ฟีฟ่า 24',
    'PUBG': 'พับจี',
    'Destiny 2': 'เดสทินี่ 2',
    'World of Warcraft': 'เวิลด์ออฟวอร์คราฟต์',
    'Dota 2': 'โดต้า 2',
    'CS:GO': 'ซีเอสโก',
    'Rainbow Six Siege': 'เรนโบว์ซิกซ์ซีจ',
    'Battlefield': 'แบทเทิลฟิลด์',
    'Cyberpunk 2077': 'ไซเบอร์พังค์ 2077',
    'The Witcher 3': 'เดอะวิทเชอร์ 3',
    'Elden Ring': 'เอลเดนริง',
    'Dark Souls': 'ดาร์คโซลส์',
    'Hades': 'เฮเดส',
    'Stardew Valley': 'สตาร์ดิวแวลลี่',
    'Terraria': 'เทอราเรีย',
    'Dead by Daylight': 'เดดบายเดย์ไลต์',
    'Phasmophobia': 'แฟสโมโฟเบีย',
    'Valheim': 'วัลไฮม์',
    'Sea of Thieves': 'ซีออฟธีฟส์',
    'It Takes Two': 'อิตเทคส์ทู',
    'A Way Out': 'อะเวย์เอาท์',
    'Portal 2': 'พอร์ทัล 2'
};

// ฟังก์ชันแปลงชื่อเกมเป็นภาษาไทย
function translateGameName(gameName) {
    if (!gameName) return 'ไม่ทราบเกม';
    
    // ค้นหาการแปลที่ตรงกันโดยตรง
    if (gameTranslations[gameName]) {
        return gameTranslations[gameName];
    }
    
    // ค้นหาการแปลที่คล้ายกัน (case insensitive)
    const lowerGameName = gameName.toLowerCase();
    for (const [english, thai] of Object.entries(gameTranslations)) {
        if (english.toLowerCase().includes(lowerGameName) || lowerGameName.includes(english.toLowerCase())) {
            return thai;
        }
    }
    
    // ถ้าไม่พบการแปล ให้ใช้ชื่อเดิม
    return gameName;
}

// ฟังก์ชันสำหรับดึงข้อมูลเกมที่เล่นอยู่
function getUserActivity(member) {
    if (!member.presence) return null;
    
    const activities = member.presence.activities;
    if (!activities || activities.length === 0) return null;
    
    // หาเกมที่กำลังเล่น (ไม่ใช่ Spotify หรือ Custom Status)
    const gameActivity = activities.find(activity => 
        activity.type === ActivityType.Playing && 
        activity.name !== 'Spotify' &&
        activity.name !== 'Custom Status'
    );
    
    return gameActivity ? gameActivity.name : null;
}

// ฟังก์ชันสำหรับเก็บข้อมูลเกมและช่องเสียง
async function collectGameData() {
    if (!guild) return {};
    
    const gameData = {};
    const monitoredChannels = [];
    
    // ดึงช่องเสียงจากหมวดหมู่ที่กำหนด
    for (const categoryId of config.monitoredCategoryIds) {
        const category = guild.channels.cache.get(categoryId);
        if (!category || category.type !== ChannelType.GuildCategory) continue;
        
        const voiceChannels = category.children.cache.filter(
            channel => channel.type === ChannelType.GuildVoice
        );
        
        monitoredChannels.push(...voiceChannels.values());
    }
    
    // วิเคราะห์สมาชิกในแต่ละช่องเสียง
    for (const voiceChannel of monitoredChannels) {
        const members = voiceChannel.members;
        
        if (members.size === 0) continue;
        
        members.forEach(member => {
            const gameName = getUserActivity(member);
            if (!gameName) return;
            
            if (!gameData[gameName]) {
                gameData[gameName] = {
                    playerCount: 0,
                    channels: new Set()
                };
            }
            
            gameData[gameName].playerCount++;
            gameData[gameName].channels.add(voiceChannel);
        });
    }
    
    return gameData;
}

// ฟังก์ชันสำหรับสร้าง Embed Message
async function createGameEmbed(gameData) {
    // เรียงลำดับเกมตามจำนวนผู้เล่น
    const sortedGames = Object.entries(gameData)
        .sort(([,a], [,b]) => b.playerCount - a.playerCount)
        .slice(0, 5);
    
    const embed = new EmbedBuilder()
        .setTitle('🎮 TOP 5 เกมที่ได้รับความนิยมในวอยซ์แชท')
        .setDescription('รายการเกมยอดนิยมที่สมาชิกกำลังเล่นอยู่ในขณะนี้')
        .setColor('#FF6B6B')
        .setTimestamp()
        .setFooter({ 
            text: `อัปเดตทุก ${config.updateInterval} วินาที • สร้างโดย Thai Game Tracker Bot`,
            iconURL: client.user?.displayAvatarURL()
        });
    
    if (sortedGames.length === 0) {
        embed.addFields({
            name: '😴 ไม่มีใครเล่นเกมในขณะนี้',
            value: 'ยังไม่มีสมาชิกที่กำลังเล่นเกมในช่องเสียงที่ติดตาม',
            inline: false
        });
    } else {
        const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        
        sortedGames.forEach(([gameName, data], index) => {
            const thaiGameName = translateGameName(gameName);
            const channels = Array.from(data.channels);
            
            // สร้างลิสต์ช่องเสียงที่สามารถคลิกได้
            const channelLinks = channels.map(channel => 
                `<#${channel.id}>`
            ).join(' • ');
            
            embed.addFields({
                name: `${rankEmojis[index]} ${thaiGameName} (${data.playerCount} คน)`,
                value: `**ช่องเสียง:** ${channelLinks}\n` +
                       `**จำนวนผู้เล่น:** ${data.playerCount} คน\n` +
                       `**จำนวนช่อง:** ${channels.length} ช่อง`,
                inline: false
            });
        });
        
        // เพิ่มสถิติรวม
        const totalPlayers = Object.values(gameData).reduce((sum, data) => sum + data.playerCount, 0);
        const totalGames = Object.keys(gameData).length;
        
        embed.addFields({
            name: '📊 สถิติรวม',
            value: `**รวมผู้เล่น:** ${totalPlayers} คน\n**รวมเกม:** ${totalGames} เกม`,
            inline: false
        });
    }
    
    return embed;
}

// ฟังก์ชันอัปเดต Embed Message
async function updateGameTracker() {
    try {
        if (!outputChannel) {
            console.log('❌ ไม่พบช่องข้อความสำหรับส่งข้อมูล');
            return;
        }
        
        console.log('🔄 กำลังอัปเดตข้อมูลเกม...');
        
        const gameData = await collectGameData();
        const embed = await createGameEmbed(gameData);
        
        if (lastMessageId) {
            try {
                const lastMessage = await outputChannel.messages.fetch(lastMessageId);
                await lastMessage.edit({ embeds: [embed] });
                console.log('✅ อัปเดตข้อความสำเร็จ');
            } catch (error) {
                console.log('⚠️ ไม่สามารถแก้ไขข้อความเดิม ส่งข้อความใหม่แทน');
                const newMessage = await outputChannel.send({ embeds: [embed] });
                lastMessageId = newMessage.id;
            }
        } else {
            const newMessage = await outputChannel.send({ embeds: [embed] });
            lastMessageId = newMessage.id;
            console.log('✅ ส่งข้อความใหม่สำเร็จ');
        }
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการอัปเดต:', error);
    }
}

// ฟังก์ชันเริ่มต้นการอัปเดตอัตโนมัติ
function startAutoUpdate() {
    if (updateTimer) {
        clearInterval(updateTimer);
    }
    
    // อัปเดตทันทีครั้งแรก
    updateGameTracker();
    
    // ตั้งการอัปเดตอัตโนมัติ
    updateTimer = setInterval(updateGameTracker, config.updateInterval * 1000);
    console.log(`🕐 เริ่มการอัปเดตอัตโนมัติทุก ${config.updateInterval} วินาที`);
}

// Event เมื่อ Bot พร้อมใช้งาน
client.once('ready', async () => {
    console.log(`🚀 ${client.user.tag} พร้อมใช้งานแล้ว!`);
    
    try {
        // ดึงข้อมูล Guild และ Channel
        guild = await client.guilds.fetch(config.guildId);
        outputChannel = await guild.channels.fetch(config.outputChannelId);
        
        if (!guild) {
            console.error('❌ ไม่พบเซิร์ฟเวอร์ที่กำหนด');
            return;
        }
        
        if (!outputChannel) {
            console.error('❌ ไม่พบช่องข้อความที่กำหนด');
            return;
        }
        
        console.log(`📋 เชื่อมต่อกับเซิร์ฟเวอร์: ${guild.name}`);
        console.log(`📝 ช่องข้อความ: ${outputChannel.name}`);
        console.log(`👁️ ติดตามหมวดหมู่: ${config.monitoredCategoryIds.length} หมวดหมู่`);
        
        // เริ่มการอัปเดตอัตโนมัติ
        startAutoUpdate();
        
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการเริ่มต้น:', error);
    }
});

// Event เมื่อสมาชิกเข้า/ออกจากช่องเสียง
client.on('voiceStateUpdate', (oldState, newState) => {
    // ตรวจสอบว่าเป็นช่องที่ติดตามหรือไม่
    const isOldChannelMonitored = oldState.channel && isChannelMonitored(oldState.channel);
    const isNewChannelMonitored = newState.channel && isChannelMonitored(newState.channel);
    
    if (isOldChannelMonitored || isNewChannelMonitored) {
        console.log(`🔄 มีการเปลี่ยนแปลงในช่องเสียง: ${newState.member?.displayName}`);
        // อัปเดตทันทีเมื่อมีการเปลี่ยนแปลง
        setTimeout(updateGameTracker, 2000); // รอ 2 วินาทีให้ข้อมูลอัปเดต
    }
});

// Event เมื่อสถานะการเล่นเกมเปลี่ยน
client.on('presenceUpdate', (oldPresence, newPresence) => {
    if (!newPresence.member) return;
    
    // ตรวจสอบว่าสมาชิกอยู่ในช่องเสียงที่ติดตามหรือไม่
    const voiceState = newPresence.member.voice;
    if (voiceState.channel && isChannelMonitored(voiceState.channel)) {
        console.log(`🎮 การเล่นเกมเปลี่ยนแปลง: ${newPresence.member.displayName}`);
        // อัปเดตทันทีเมื่อมีการเปลี่ยนแปลงเกม
        setTimeout(updateGameTracker, 1000); // รอ 1 วินาทีให้ข้อมูลอัปเดต
    }
});

// ฟังก์ชันตรวจสอบว่าช่องเสียงอยู่ในหมวดหมู่ที่ติดตามหรือไม่
function isChannelMonitored(channel) {
    if (!channel || channel.type !== ChannelType.GuildVoice) return false;
    return config.monitoredCategoryIds.includes(channel.parentId);
}

// จัดการ Process Events
process.on('SIGINT', () => {
    console.log('\n🛑 กำลังปิด Bot...');
    if (updateTimer) {
        clearInterval(updateTimer);
    }
    client.destroy();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// เข้าสู่ระบบ Discord
client.login(config.token);