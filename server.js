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

// Skor şeması
const ScoreSchema = new mongoose.Schema({
    nickname: { 
        type: String, 
        required: true,
        trim: true
    },
    score: { 
        type: Number, 
        required: true,
        min: 0
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
}, { 
    collection: 'scores',
    timestamps: true
});

// Skor modelini oluşturmadan önce index ekle
ScoreSchema.index({ score: -1 });
const Score = mongoose.model('Score', ScoreSchema);

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://admin:1327@vmi2186126.contaboserver.net:27017/admin';

// Bağlantı durumunu global olarak takip et
let isConnected = false;

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then(async () => {
    isConnected = true;
    console.log('MongoDB bağlantısı başarılı');
    
    // Admin veritabanından gamedb'ye geç
    await mongoose.connection.db.admin().command({ ping: 1 });
    await mongoose.connection.useDb('gamedb');
    
    // Koleksiyon kontrolü
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Mevcut koleksiyonlar:', collections.map(c => c.name));
    
    if (!collections.some(col => col.name === 'scores')) {
        await mongoose.connection.db.createCollection('scores');
        console.log('scores koleksiyonu oluşturuldu');
    }
})
.catch((err) => {
    isConnected = false;
    console.error('MongoDB bağlantı hatası:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        state: mongoose.connection.readyState
    });
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose bağlantısı başarılı');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose bağlantısı kesildi');
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

        // Yeni skor dokümanı oluştur
        const newScore = new Score({
            nickname: nickname,
            score: score,
            date: new Date()
        });

        // Kaydet
        const savedScore = await newScore.save({ w: 1 });
        console.log('Kaydedilen skor:', savedScore);

        res.json({ 
            success: true, 
            score: savedScore 
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
        // Bağlantı kontrolü
        if (!isConnected || mongoose.connection.readyState !== 1) {
            console.error('Veritabanı bağlantı durumu:', {
                isConnected,
                readyState: mongoose.connection.readyState,
                db: mongoose.connection.db?.databaseName
            });
            throw new Error('Veritabanı bağlantısı aktif değil');
        }

        // Koleksiyon kontrolü
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Mevcut koleksiyonlar:', collections.map(c => c.name));

        // En yüksek 10 skoru getir
        const scores = await Score.find()
            .sort({ score: -1 })
            .limit(10)
            .lean()
            .exec();

        console.log('Bulunan skorlar:', scores);
        res.json(scores || []);
    } catch (error) {
        console.error('Leaderboard hatası:', {
            message: error.message,
            stack: error.stack,
            mongoState: mongoose.connection.readyState,
            mongoError: mongoose.connection.error,
            collections: await mongoose.connection.db?.listCollections().toArray()
        });

        res.status(500).json({ 
            error: 'Leaderboard alınamadı',
            details: error.message
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

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
