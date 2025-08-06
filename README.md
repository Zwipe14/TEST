# 🎮 Thai Voice Game Tracker Bot

Ein Discord Bot, der Voice Channels überwacht und die Top 5 Spiele auf Thailändisch anzeigt, basierend auf der Anzahl der Spieler in den überwachten Sprachkanälen.

**บอทดิสคอร์ดที่ติดตามช่องเสียงและแสดงเกมยอดนิยม 5 อันดับแรกเป็นภาษาไทย โดยอิงจากจำนวนผู้เล่นในช่องเสียงที่ติดตาม**

## ✨ Funktionen / ฟีเจอร์

- 🔍 **Voice Channel Überwachung** / **ติดตามช่องเสียง**
  - Überwacht mehrere Kategorien mit Voice Channels
  - ติดตามหลายหมวดหมู่ที่มีช่องเสียง

- 🎯 **Game Detection** / **ตรวจจับเกม**
  - Erkennt automatisch welche Spiele Nutzer spielen
  - ตรวจจับเกมที่ผู้ใช้กำลังเล่นโดยอัตโนมัติ

- 🏆 **Top 5 Ranking** / **อันดับ 5 อันดับแรก**
  - Zeigt Top 5 Spiele basierend auf Spielerzahl (nicht Zeit!)
  - แสดงเกมยอดนิยม 5 อันดับแรกตามจำนวนผู้เล่น (ไม่ใช่เวลา!)

- 🔗 **Verlinkbare Voice Channels** / **ช่องเสียงที่คลิกได้**
  - Klickbare Links zu Voice Channels wo das Spiel gespielt wird
  - ลิงก์ที่คลิกได้ไปยังช่องเสียงที่มีการเล่นเกมนั้น

- ⚡ **Real-time Updates** / **อัปเดตแบบเรียลไทม์**
  - Automatische Aktualisierung alle 10 Sekunden
  - อัปเดตอัตโนมัติทุก 10 วินาที
  - Sofortige Updates bei Voice Channel Änderungen
  - อัปเดตทันทีเมื่อมีการเปลี่ยนแปลงในช่องเสียง

- 🇹🇭 **Thailändische Übersetzungen** / **การแปลภาษาไทย**
  - Über 30 beliebte Spiele ins Thailändische übersetzt
  - เกมยอดนิยมกว่า 30 เกมแปลเป็นภาษาไทย

## 🚀 Installation

### 1. Dependencies installieren / ติดตั้ง Dependencies

```bash
npm install
```

### 2. Environment Konfiguration / การตั้งค่า Environment

Kopiere `.env.example` zu `.env` und fülle die Werte aus:
คัดลอก `.env.example` เป็น `.env` และกรอกค่าต่างๆ:

```bash
cp .env.example .env
```

### 3. .env Datei konfigurieren / ตั้งค่าไฟล์ .env

```env
# Discord Bot Token (von Discord Developer Portal)
DISCORD_TOKEN=dein_bot_token_hier

# Server ID (Guild ID) - Rechtsklick auf Server → "ID kopieren"
GUILD_ID=deine_server_id_hier

# Text Channel ID wo die Embed Message gepostet wird
OUTPUT_CHANNEL_ID=deine_channel_id_hier

# Kategorie IDs die überwacht werden sollen (komma-getrennt)
MONITORED_CATEGORY_IDS=kategorie_id_1,kategorie_id_2,kategorie_id_3

# Update Intervall in Sekunden (Standard: 10)
UPDATE_INTERVAL=10
```

### 4. Discord Bot Setup / การตั้งค่าบอทดิสคอร์ด

1. **Bot erstellen / สร้างบอท:**
   - Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
   - ไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
   - Erstelle eine neue Application / สร้าง Application ใหม่
   - Gehe zu "Bot" Section / ไปที่ส่วน "Bot"
   - Kopiere den Bot Token / คัดลอก Bot Token

2. **Bot Permissions / สิทธิ์ของบอท:**
   Der Bot benötigt folgende Permissions:
   บอทต้องการสิทธิ์ดังนี้:
   - `View Channels` / `ดูช่อง`
   - `Send Messages` / `ส่งข้อความ`
   - `Embed Links` / `ฝังลิงก์`
   - `Read Message History` / `อ่านประวัติข้อความ`
   - `Connect` (für Voice Channels) / `เชื่อมต่อ` (สำหรับช่องเสียง)

3. **Bot Intents aktivieren / เปิดใช้งาน Bot Intents:**
   - `Presence Intent` ✅
   - `Server Members Intent` ✅
   - `Message Content Intent` ✅

### 5. IDs herausfinden / หา IDs

**Developer Mode aktivieren / เปิด Developer Mode:**
- Discord Settings → Advanced → Developer Mode ✅

**Server ID (Guild ID):**
- Rechtsklick auf Server Name → "Copy Server ID"
- คลิกขวาที่ชื่อเซิร์ฟเวอร์ → "Copy Server ID"

**Channel ID:**
- Rechtsklick auf Channel → "Copy Channel ID"
- คลิกขวาที่ช่อง → "Copy Channel ID"

**Category ID:**
- Rechtsklick auf Kategorie → "Copy Category ID"
- คลิกขวาที่หมวดหมู่ → "Copy Category ID"

## 🎯 Start / เริ่มต้น

```bash
# Development Mode
npm run dev

# Production Mode
npm start
```

## 🎮 Unterstützte Spiele / เกมที่รองรับ

Der Bot unterstützt automatische Übersetzungen für:
บอทรองรับการแปลอัตโนมัติสำหรับ:

- **VALORANT** → วาโลแรนต์
- **Fortnite** → ฟอร์ทไนท์
- **League of Legends** → ลีกออฟเลเจนด์
- **Counter-Strike 2** → เคาน์เตอร์-สไตรค์ 2
- **Apex Legends** → เอเพ็กซ์ เลเจนด์
- **Minecraft** → ไมน์คราฟต์
- **Call of Duty** → คอลออฟดิวตี้
- **Overwatch 2** → โอเวอร์วอทช์ 2
- **Genshin Impact** → เกนชินอิมแพ็ค
- **PUBG** → พับจี
- Und viele weitere... / และอื่นๆ อีกมาก...

## 📊 Embed Message Beispiel / ตัวอย่าง Embed Message

```
🎮 TOP 5 เกมที่ได้รับความนิยมในวอยซ์แชท
รายการเกมยอดนิยมที่สมาชิกกำลังเล่นอยู่ในขณะนี้

🥇 วาโลแรนต์ (20 คน)
ช่องเสียง: #valorant-1 • #valorant-2 • #gaming-general
จำนวนผู้เล่น: 20 คน
จำนวนช่อง: 3 ช่อง

🥈 ฟอร์ทไนท์ (15 คน)
ช่องเสียง: #fortnite-squad • #battle-royale
จำนวนผู้เล่น: 15 คน
จำนวนช่อง: 2 ช่อง

🥉 ลีกออฟเลเจนด์ (10 คน)
ช่องเสียง: #lol-ranked
จำนวนผู้เล่น: 10 คน
จำนวนช่อง: 1 ช่อง

📊 สถิติรวม
รวมผู้เล่น: 45 คน
รวมเกม: 3 เกม

อัปเดตทุก 10 วินาที • สร้างโดย Thai Game Tracker Bot
```

## ⚙️ Konfiguration / การตั้งค่า

### Update Intervall ändern / เปลี่ยนช่วงเวลาอัปเดต

```env
UPDATE_INTERVAL=5  # Aktualisiert alle 5 Sekunden / อัปเดตทุก 5 วินาที
```

### Neue Spiel-Übersetzungen hinzufügen / เพิ่มการแปลเกมใหม่

Bearbeite die `gameTranslations` Object in `bot.js`:
แก้ไข Object `gameTranslations` ใน `bot.js`:

```javascript
const gameTranslations = {
    'Dein Spiel': 'การแปลภาษาไทย',
    // ... weitere Übersetzungen
};
```

## 🔧 Troubleshooting / การแก้ไขปัญหา

### Bot startet nicht / บอทไม่เริ่มทำงาน

1. **Token überprüfen / ตรวจสอบ Token:**
   ```
   ❌ ไม่พบเซิร์ฟเวอร์ที่กำหนด
   ```
   → Überprüfe `GUILD_ID` in `.env` / ตรวจสอบ `GUILD_ID` ใน `.env`

2. **Permissions überprüfen / ตรวจสอบสิทธิ์:**
   ```
   ❌ ไม่พบช่องข้อความที่กำหนด
   ```
   → Bot braucht Zugriff auf den Channel / บอทต้องการสิทธิ์เข้าถึงช่อง

3. **Kategorie IDs überprüfen / ตรวจสอบ Category IDs:**
   ```
   👁️ ติดตามหมวดหมู่: 0 หมวดหมู่
   ```
   → Überprüfe `MONITORED_CATEGORY_IDS` / ตรวจสอบ `MONITORED_CATEGORY_IDS`

### Keine Spiele erkannt / ไม่มีการตรวจจับเกม

- Nutzer müssen ihren Discord Status öffentlich haben
- ผู้ใช้ต้องตั้งสถานะ Discord เป็นสาธารณะ
- Spiel muss als "Playing" Activity angezeigt werden
- เกมต้องแสดงเป็น "Playing" Activity

## 📝 Logs / บันทึก

Der Bot zeigt detaillierte Logs:
บอทแสดงบันทึกโดยละเอียด:

```
🚀 Thai-Game-Bot#1234 พร้อมใช้งานแล้ว!
📋 เชื่อมต่อกับเซิร์ฟเวอร์: Mein Thai Server
📝 ช่องข้อความ: game-tracker
👁️ ติดตามหมวดหมู่: 3 หมวดหมู่
🕐 เริ่มการอัปเดตอัตโนมัติทุก 10 วินาที
🔄 กำลังอัปเดตข้อมูลเกม...
✅ ส่งข้อความใหม่สำเร็จ
```

## 📄 Lizenz / ใบอนุญาต

MIT License - Du kannst den Code frei verwenden und modifizieren!
MIT License - คุณสามารถใช้และแก้ไขโค้ดได้อย่างอิสระ!

## 🤝 Support / การสนับสนุน

Bei Fragen oder Problemen erstelle ein Issue im Repository.
หากมีคำถามหรือปัญหา ให้สร้าง Issue ใน Repository

---

**Gemacht mit ❤️ für die Thai Gaming Community**
**สร้างด้วย ❤️ สำหรับชุมชนเกมเมอร์ไทย**
