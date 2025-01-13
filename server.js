// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// CORS ayarları
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'http://127.0.0.1:4000',
        'https://craftedfromfilament.com'
    ],
    credentials: true
}));

app.use(express.json());

// MongoDB Şema
const ScoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    highScore: { type: Number, required: true, default: 0 },
    lastPlayed: { type: Date, default: Date.now }
}, { collection: 'scores' });

const Score = mongoose.model('Score', ScoreSchema);

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://denkiya:1327@localhost:27017/gamedb?authSource=gamedb';

mongoose.connect(MONGODB_URI, {
    family: 4
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

// API routes
app.post('/api/login', async (req, res) => {
    try {
        const { nickname } = req.body;
        if (!nickname) {
            return res.status(400).json({ error: 'Nickname gerekli' });
        }

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
        console.error('Login hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.post('/api/score', async (req, res) => {
    try {
        const { nickname, score } = req.body;
        if (!nickname || score === undefined) {
            return res.status(400).json({ error: 'Nickname ve score gerekli' });
        }

        let player = await Score.findOne({ nickname });
        if (!player) {
            player = new Score({
                nickname,
                highScore: score
            });
        } else if (score > player.highScore) {
            player.highScore = score;
            player.lastPlayed = new Date();
        }

        await player.save();
        res.json(player);
    } catch (error) {
        console.error('Score güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ highScore: -1 })
            .limit(10)
            .select('nickname highScore lastPlayed -_id');
        res.json(scores);
    } catch (error) {
        console.error('Leaderboard hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Statik dosyalar
app.use(express.static('public'));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Port ayarı
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
