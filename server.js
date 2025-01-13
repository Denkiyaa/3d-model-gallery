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
        'http://127.0.0.1:3000',
        'https://craftedfromfilament.com',
        'http://craftedfromfilament.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// CORS Pre-flight için OPTIONS request handler
app.options('*', cors());

// Her request için CORS header'larını ekle
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

app.use(express.json());

// Manifest ve favicon için özel route'lar
app.get('/manifest.json', cors(), (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// MongoDB Şema
const ScoreSchema = new mongoose.Schema({
    nickname: { type: String, required: true },
    highScore: { type: Number, required: true, default: 0 },
    lastPlayed: { type: Date, default: Date.now }
}, { collection: 'scores' });

const Score = mongoose.model('Score', ScoreSchema);

// MongoDB bağlantısı
const MONGODB_URI = 'mongodb://denkiya:1327@37.60.242.70:27017/gamedb?authSource=gamedb';

console.log('MongoDB bağlantısı başlatılıyor...');
console.log('Bağlantı URI:', MONGODB_URI);

mongoose.connect(MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Test sorgusu
    return Score.findOne().exec();
}).then(result => {
    console.log('Test sorgusu sonucu:', result ? 'Veri var' : 'Veri yok');
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', {
        message: err.message,
        code: err.code,
        name: err.name,
        state: mongoose.connection.readyState
    });
    console.log('Dosya tabanlı sisteme geçiliyor...');
});

// MongoDB bağlantı durumunu izle
mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
});

// Dosya tabanlı yedek sistem
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

function readScores() {
    try {
        if (!fs.existsSync(SCORES_FILE)) {
            fs.writeFileSync(SCORES_FILE, JSON.stringify({ scores: [] }));
        }
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data).scores;
    } catch (error) {
        console.error('Dosya okuma hatası:', error);
        return [];
    }
}

function writeScores(scores) {
    try {
        fs.writeFileSync(SCORES_FILE, JSON.stringify({ scores }, null, 2));
    } catch (error) {
        console.error('Dosya yazma hatası:', error);
    }
}

// API routes
app.post('/api/login', async (req, res) => {
    try {
        const { nickname } = req.body;
        if (mongoose.connection.readyState === 1) {
            // MongoDB bağlıysa
            let player = await Score.findOne({ nickname });
            if (!player) {
                player = new Score({ nickname, highScore: 0 });
                await player.save();
            }
            res.json(player);
        } else {
            // Dosya tabanlı sistem
            const scores = readScores();
            const player = scores.find(p => p.nickname === nickname) || {
                nickname,
                highScore: 0,
                lastPlayed: new Date()
            };
            if (!scores.find(p => p.nickname === nickname)) {
                scores.push(player);
                writeScores(scores);
            }
            res.json(player);
        }
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Benzer şekilde diğer route'ları da güncelle...
app.post('/api/score', async (req, res) => {
    try {
        const { nickname, score } = req.body;
        if (mongoose.connection.readyState === 1) {
            let player = await Score.findOne({ nickname });
            if (!player) {
                player = new Score({ nickname, highScore: score });
            } else if (score > player.highScore) {
                player.highScore = score;
                player.lastPlayed = new Date();
            }
            await player.save();
            res.json(player);
        } else {
            const scores = readScores();
            const player = scores.find(p => p.nickname === nickname);
            if (player && score > player.highScore) {
                player.highScore = score;
                player.lastPlayed = new Date();
                writeScores(scores);
            }
            res.json(player);
        }
    } catch (error) {
        console.error('Score güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const scores = await Score.find()
                .sort({ highScore: -1 })
                .limit(10)
                .select('nickname highScore lastPlayed -_id');
            res.json(scores);
        } else {
            const scores = readScores()
                .sort((a, b) => b.highScore - a.highScore)
                .slice(0, 10);
            res.json(scores);
        }
    } catch (error) {
        console.error('Leaderboard hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Statik dosyalar - sıralama önemli
app.use('/game', express.static(path.join(__dirname, 'public/game')));
app.use(express.static('public'));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
