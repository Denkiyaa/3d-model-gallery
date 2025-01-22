// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Global hata yakalama
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// CORS ayarları
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://craftedfromfilament.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// MongoDB bağlantı durumu kontrolü
let isConnected = false;

// MongoDB Şema
const ScoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    highScore: { type: Number, required: true, default: 0 },
    lastPlayed: { type: Date, default: Date.now }
}, { collection: 'scores' });

const Score = mongoose.model('Score', ScoreSchema);

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://denkiya:1327@http://84.247.173.242:27017/gamedb?authSource=gamedb';

console.log('MongoDB bağlantısı başlatılıyor...');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    family: 4
}).then(() => {
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı');
}).catch((err) => {
    isConnected = false;
    console.error('MongoDB bağlantı hatası:', {
        message: err.message,
        code: err.code,
        name: err.name
    });
});

// Bağlantı durumunu izle
mongoose.connection.on('connecting', () => {
    console.log('MongoDB bağlanıyor...');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB bağlandı');
    isConnected = true;
});

mongoose.connection.on('disconnecting', () => {
    console.log('MongoDB bağlantısı kesiliyor...');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
    isConnected = false;
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
    isConnected = false;
});

// Önce spesifik route'ları tanımlayalım
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public/manifest.json'));
});

// API route'u başına log ekle
app.use((req, res, next) => {
    console.log('Gelen istek:', {
        method: req.method,
        url: req.url,
        body: req.body
    });
    next();
});

// API route'larını ortada tut
app.use('/api/*', (req, res, next) => {
    if (!isConnected) {
        return res.status(500).json({ 
            error: 'Veritabanı bağlantısı aktif değil',
            details: 'MongoDB bağlantısı kurulamadı'
        });
    }
    next();
});

// API route'ları MongoDB ile güncellenmiş hali
app.get('/api/leaderboard', async (req, res) => {
    console.log('Leaderboard isteği alındı');
    try {
        const scores = await Score.find()
            .sort({ highScore: -1 })
            .limit(10)
            .select('nickname highScore lastPlayed -_id')
            .lean();

        console.log('Skorlar bulundu:', scores);
        res.json(scores);
    } catch (error) {
        console.error('Leaderboard hatası:', error);
        res.status(500).json({ 
            error: 'Leaderboard alınamadı',
            details: error.message 
        });
    }
});

app.post('/api/login', async (req, res) => {
    console.log('Login isteği geldi:', req.body);
    const { nickname } = req.body;
    try {
        let player = await Score.findOne({ nickname });
        if (!player) {
            player = new Score({
                nickname,
                highScore: 0,
                lastPlayed: new Date()
            });
            console.log('Yeni oyuncu oluşturuluyor:', player);
            await player.save();
        }
        console.log('Login başarılı:', player);
        res.json(player);
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.post('/api/score', async (req, res) => {
    console.log('Score route çalıştı');
    console.log('Gelen veri:', req.body);
    
    try {
        const { nickname, score } = req.body;
        
        if (!nickname || score === undefined) {
            throw new Error('Eksik veri');
        }

        // Mevcut oyuncuyu bul veya yeni oluştur
        let player = await Score.findOne({ nickname });
        console.log('Bulunan oyuncu:', player);
        
        if (!player) {
            // Yeni oyuncu
            player = new Score({
                nickname,
                highScore: score,
                lastPlayed: new Date()
            });
            console.log('Yeni oyuncu oluşturuluyor:', player);
        } else if (score > player.highScore) {
            // Yüksek skor güncelleme
            console.log(`Skor güncelleniyor: ${player.highScore} -> ${score}`);
            player.highScore = score;
            player.lastPlayed = new Date();
        }

        // Kaydet
        await player.save();
        console.log('Oyuncu kaydedildi:', player);

        res.json({ 
            success: true, 
            score: player 
        });
    } catch (error) {
        console.error('Score route hatası:', error);
        res.status(500).json({ error: error.message });
    }
});

// Statik dosya servis ayarları
// Önce spesifik route'lar
app.use('/game', express.static(path.join(__dirname, 'public/game')));
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// Sonra genel public klasörü
app.use(express.static(path.join(__dirname, 'public')));

// Oyun route'u - her zaman index.html'i serve et
app.get('/game/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game/index.html'));
});

// 5. Catch-all route
app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint bulunamadı' });
    }
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Test fonksiyonu ekle
app.post('/api/test-write', async (req, res) => {
    try {
        // Test verisi oluştur
        const testScore = new Score({
            nickname: 'test_api',
            highScore: 999,
            lastPlayed: new Date()
        });

        // Kaydetmeyi dene
        const savedScore = await testScore.save();
        console.log('Test yazma başarılı:', savedScore);

        res.json({ 
            success: true, 
            message: 'Test yazma başarılı',
            score: savedScore 
        });
    } catch (error) {
        console.error('Test yazma hatası:', {
            message: error.message,
            stack: error.stack,
            mongoState: mongoose.connection.readyState
        });
        
        res.status(500).json({ 
            error: 'Test yazma başarısız',
            details: error.message,
            connected: isConnected
        });
    }
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
