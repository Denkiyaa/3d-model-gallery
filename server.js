// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

app.use(cors({
    origin: ['http://localhost:3000', 'https://craftedfromfilament.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game', express.static(path.join(__dirname, 'public/game')));

// MongoDB bağlantı URL'i
const MONGODB_URI = 'mongodb://denkiya:1327@vmi2186126.contaboserver.net:27017/gamedb';

// MongoDB bağlantısı
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB bağlantısı başarılı');
})
.catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

// Skor şeması
const ScoreSchema = new mongoose.Schema({
    nickname: String,
    highScore: Number,
    lastPlayed: { type: Date, default: Date.now }
});

const Score = mongoose.model('Score', ScoreSchema);

// Skorları oku (MongoDB versiyonu)
async function readScores() {
    try {
        return await Score.find().sort({ highScore: -1 }).limit(10);
    } catch (error) {
        console.error('Skor okuma hatası:', error);
        return [];
    }
}

// Skorları kaydet (MongoDB versiyonu)
async function writeScore(playerData) {
    try {
        const { nickname, highScore } = playerData;
        await Score.findOneAndUpdate(
            { nickname },
            { 
                nickname,
                highScore,
                lastPlayed: new Date()
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Skor kaydetme hatası:', error);
    }
}

// Önce spesifik route'ları tanımlayalım
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public/manifest.json'));
});

// API route'ları
app.post('/api/login', async (req, res) => {
    const { nickname } = req.body;
    try {
        let player = await Score.findOne({ nickname });
        if (!player) {
            player = new Score({
                nickname,
                highScore: 0
            });
            await player.save();
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.post('/api/score', async (req, res) => {
    const { nickname, score } = req.body;
    try {
        const player = await Score.findOne({ nickname });
        if (player && score > player.highScore) {
            player.highScore = score;
            player.lastPlayed = new Date();
            await player.save();
        }
        res.json(player);
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ highScore: -1 })
            .limit(10);
        res.json(scores);
    } catch (error) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Oyun route'u
app.get('/game/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game/index.html'));
});

// React uygulaması için tüm diğer route'lar
app.get('/*', (req, res) => {
    if (!req.path.startsWith('/game')) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    }
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
