// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Express ayarları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Karakter kodlaması için
app.use((req, res, next) => {
    res.charset = 'utf-8';
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

// CORS ayarları
app.use(cors({
    origin: true, // Tüm originlere izin ver
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Pre-flight istekleri için
app.options('*', cors());

// Manifest için özel CORS ayarı
app.get('/manifest.json', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
});

// API routes için CORS kontrolü
app.use('/api/*', (req, res, next) => {
    const origin = req.headers.origin;
    // Tek bir origin header'ı gönder
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
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

mongoose.connect(MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    directConnection: true  // Direkt sunucuya bağlan
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
    // Bağlantıyı test et
    return mongoose.connection.db.admin().ping();
}).then(() => {
    console.log('MongoDB ping başarılı');
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', {
        message: err.message,
        code: err.code,
        name: err.name,
        stack: err.stack
    });
});

// Bağlantı durumunu izle
mongoose.connection.on('connected', () => {
    console.log('MongoDB bağlandı');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
});

// API routes için middleware
app.use('/api/*', async (req, res, next) => {
    try {
        // MongoDB bağlantı durumunu kontrol et
        if (mongoose.connection.readyState !== 1) {
            // Yeniden bağlanmayı dene
            await mongoose.connect(MONGODB_URI);
        }
        next();
    } catch (error) {
        console.error('API isteği sırasında MongoDB hatası:', error);
        return res.status(503).json({
            error: 'Veritabanı bağlantısı aktif değil',
            details: error.message
        });
    }
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

// Statik dosyalar için route'lar - sıralama önemli
app.use('/', express.static(path.join(__dirname, 'build'))); // React build en üstte
app.use('/game', express.static(path.join(__dirname, 'public/game')));
app.use(express.static('public'));

// Catch-all route - en sonda olmalı
app.get('*', (req, res) => {
    // API istekleri için 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint bulunamadı' });
    }
    
    // Game sayfası için
    if (req.path.startsWith('/game')) {
        return res.sendFile(path.join(__dirname, 'public/game/index.html'));
    }
    
    // Ana sayfa için React build'i
    try {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    } catch (err) {
        console.error('Build dosyası bulunamadı:', err);
        // Fallback olarak public/index.html'i kullan
        res.sendFile(path.join(__dirname, 'public/index.html'));
    }
});

// Hata yakalama middleware'i ekleyelim
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
