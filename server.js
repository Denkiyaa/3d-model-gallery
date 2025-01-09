// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://craftedfromfilament.com'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game', express.static(path.join(__dirname, 'public/game')));
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://denkiya:1327@vmi2186126.contaboserver.net:27017/gamedb?authSource=gamedb';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Test amaçlı bir skor ekleyelim
    return Score.create({
        nickname: 'test',
        score: 100,
        date: new Date()
    });
})
.then(() => {
    console.log('Test skoru başarıyla eklendi');
})
.catch((err) => {
    console.error('MongoDB hatası:', err);
});

// Skor şeması
const ScoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    score: { type: Number, required: true },
    date: { type: Date, default: Date.now }
}, { collection: 'scores' });

const Score = mongoose.model('Score', ScoreSchema);

// Önce spesifik route'ları tanımlayalım
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public/manifest.json'));
});

// API route'ları MongoDB ile güncellenmiş hali
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
    try {
        console.log('Gelen skor verisi:', req.body);

        const { nickname, score } = req.body;
        
        if (!nickname || !score) {
            throw new Error('Nickname ve score zorunludur');
        }

        // Mevcut en yüksek skoru kontrol et
        let existingScore = await Score.findOne({ nickname });
        console.log('Mevcut skor:', existingScore);
        
        let savedScore;
        if (!existingScore) {
            // Yeni oyuncu
            savedScore = await Score.create({
                nickname,
                score,
                date: new Date()
            });
            console.log('Yeni skor kaydedildi:', savedScore);
        } else if (score > existingScore.score) {
            // Mevcut skordan daha yüksek
            existingScore.score = score;
            existingScore.date = new Date();
            savedScore = await existingScore.save();
            console.log('Skor güncellendi:', savedScore);
        } else {
            savedScore = existingScore;
            console.log('Mevcut skor daha yüksek, güncelleme yapılmadı');
        }

        res.json({ 
            success: true, 
            score: savedScore,
            message: 'Skor başarıyla kaydedildi'
        });
    } catch (error) {
        console.error('Skor kaydetme hatası:', error);
        res.status(500).json({ 
            error: 'Skor kaydedilemedi', 
            details: error.message,
            stack: error.stack 
        });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10);
        console.log('Leaderboard skorları:', scores); // Debug için
        res.json(scores);
    } catch (error) {
        console.error('Leaderboard hatası:', error);
        res.status(500).json({ error: 'Leaderboard alınamadı' });
    }
});

// Oyun route'u
app.get('/game/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game/index.html'));
});

// React uygulaması için route'lar
app.get('/*', (req, res) => {
    if (!req.path.startsWith('/game') && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public/index.html'));
    }
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
