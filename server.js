// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:4000',
        'https://craftedfromfilament.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game', express.static(path.join(__dirname, 'public/game')));
app.use('/models', express.static(path.join(__dirname, 'public/models')));

// Skor şeması
const ScoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    highScore: { type: Number, required: true },
    lastPlayed: { type: Date, default: Date.now }
}, { collection: 'scores' });

const Score = mongoose.model('Score', ScoreSchema);

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://denkiya:1327@craftedfromfilament.com:27017/gamedb?authSource=gamedb';

console.log('MongoDB bağlantı denemesi başlıyor...');

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    w: 'majority'
}).then(() => {
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı');
    
    // Test bağlantısı
    return Score.findOne().exec();
}).then((testResult) => {
    console.log('Test sorgusu sonucu:', testResult ? 'Veri bulundu' : 'Veri bulunamadı');
}).catch((err) => {
    isConnected = false;
    console.error('MongoDB bağlantı hatası detayları:', {
        message: err.message,
        code: err.code,
        name: err.name,
        errno: err.errno,
        syscall: err.syscall,
        hostname: err.hostname,
        state: mongoose.connection.readyState
    });
});

// Bağlantı durumunu izle
mongoose.connection.on('connecting', () => {
    console.log('MongoDB bağlantı kuruluyor...');
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB bağlandı');
});

mongoose.connection.on('disconnecting', () => {
    console.log('MongoDB bağlantısı kesiliyor...');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', {
        message: err.message,
        code: err.code,
        name: err.name
    });
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

// API route'ları MongoDB ile güncellenmiş hali
app.post('/api/login', async (req, res) => {
    console.log('Login isteği geldi:', req.body);
    const { nickname } = req.body;
    
    if (!isConnected) {
        console.error('MongoDB bağlantısı yok!');
        return res.status(500).json({ 
            error: 'Veritabanı bağlantısı kurulamadı',
            connected: false 
        });
    }

    try {
        let player = await Score.findOne({ nickname });
        console.log('Oyuncu arama sonucu:', player);
        
        if (!player) {
            console.log('Yeni oyuncu oluşturuluyor...');
            player = new Score({
                nickname,
                highScore: 0,
                lastPlayed: new Date()
            });
            await player.save();
            console.log('Yeni oyuncu kaydedildi:', player);
        }
        
        res.json(player);
    } catch (error) {
        console.error('Login işlem hatası:', {
            message: error.message,
            code: error.code,
            name: error.name,
            stack: error.stack
        });
        res.status(500).json({ 
            error: 'Sunucu hatası',
            details: error.message 
        });
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

app.get('/api/leaderboard', async (req, res) => {
    console.log('Leaderboard isteği geldi');
    try {
        if (!isConnected) {
            console.log('MongoDB bağlantı durumu:', {
                state: mongoose.connection.readyState,
                uri: MONGODB_URI
            });
            throw new Error('Veritabanı bağlantısı aktif değil');
        }

        console.log('Leaderboard sorgusu yapılıyor...');
        const scores = await Score.find()
            .sort({ highScore: -1 })
            .limit(10)
            .select('nickname highScore lastPlayed -_id')
            .lean();

        console.log('Bulunan skorlar:', scores);
        res.json(scores);
    } catch (error) {
        console.error('Leaderboard hatası:', {
            message: error.message,
            stack: error.stack,
            mongoState: mongoose.connection.readyState
        });
        res.status(500).json({ 
            error: 'Leaderboard alınamadı',
            details: error.message,
            connected: isConnected
        });
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
