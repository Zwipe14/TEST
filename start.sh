#!/bin/bash

echo "🎮 Thai Voice Game Tracker Bot Starter"
echo "======================================="

# Prüfe ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo "❌ Node.js ist nicht installiert!"
    echo "📥 Bitte installiere Node.js von: https://nodejs.org/"
    exit 1
fi

# Prüfe ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo "❌ npm ist nicht installiert!"
    exit 1
fi

echo "✅ Node.js Version: $(node --version)"
echo "✅ npm Version: $(npm --version)"

# Prüfe ob package.json existiert
if [ ! -f "package.json" ]; then
    echo "❌ package.json nicht gefunden!"
    echo "📁 Stelle sicher, dass du im richtigen Verzeichnis bist."
    exit 1
fi

# Prüfe ob .env existiert
if [ ! -f ".env" ]; then
    echo "⚠️  .env Datei nicht gefunden!"
    echo "📝 Kopiere .env.example zu .env und konfiguriere sie:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    exit 1
fi

# Installiere Dependencies falls node_modules nicht existiert
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Installation fehlgeschlagen!"
        exit 1
    fi
    echo "✅ Dependencies installiert!"
fi

echo ""
echo "🚀 Starte Bot..."
echo "💡 Zum Beenden drücke Ctrl+C"
echo ""

# Starte den Bot
npm start