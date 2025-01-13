// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

<<<<<<< HEAD
<<<<<<< HEAD
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

=======
app.use(cors());
>>>>>>> d756bf6e02cc61c29851f813be5bb5671d5aac8d
app.use(express.json());
app.use(express.static('public'));

<<<<<<< HEAD
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
const MONGODB_URI = 'mongodb://denkiya:1327@localhost:27017/gamedb?authSource=gamedb';

console.log('MongoDB bağlantısı başlatılıyor...');

mongoose.connect(MONGODB_URI, {
    family: 4,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
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

// Bağlantı durumu middleware
app.use('/api/*', (req, res, next) => {
    if (!isConnected) {
        return res.status(503).json({
            error: 'Veritabanı bağlantısı aktif değil',
            details: 'Lütfen daha sonra tekrar deneyin'
        });
    }
    next();
});

// API routes
app.post('/api/login', async (req, res) => {
    try {
        console.log('Login isteği:', req.body);
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
            console.log('Yeni oyuncu oluşturuldu:', player);
        }
        res.json(player);
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası', details: error.message });
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
=======
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

// Skorları oku
function readScores() {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data).scores;
    } catch (error) {
        return [];
    }
}

// Skorları kaydet
function writeScores(scores) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify({ scores }, null, 2));
}

// Yeni oyuncu/skor kaydet
app.post('/api/login', (req, res) => {
    const { nickname } = req.body;
    const scores = readScores();
    const player = scores.find(p => p.nickname === nickname) || {
        nickname,
        highScore: 0,
        lastPlayed: new Date()
    };
    
    if (!scores.find(p => p.nickname === nickname)) {
        scores.push(player);
        writeScores(scores);
>>>>>>> d756bf6e02cc61c29851f813be5bb5671d5aac8d
=======
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

// Skorları oku
function readScores() {
    try {
        const data = fs.readFileSync(SCORES_FILE, 'utf8');
        return JSON.parse(data).scores;
    } catch (error) {
        return [];
    }
}

// Skorları kaydet
function writeScores(scores) {
    fs.writeFileSync(SCORES_FILE, JSON.stringify({ scores }, null, 2));
}

// Yeni oyuncu/skor kaydet
app.post('/api/login', (req, res) => {
    const { nickname } = req.body;
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
});

// Skor güncelle
app.post('/api/score', (req, res) => {
    const { nickname, score } = req.body;
    const scores = readScores();
    const player = scores.find(p => p.nickname === nickname);
    
    if (player && score > player.highScore) {
        player.highScore = score;
        player.lastPlayed = new Date();
        writeScores(scores);
>>>>>>> d756bf6e02cc61c29851f813be5bb5671d5aac8d
    }
    
    res.json(player);
});

<<<<<<< HEAD
<<<<<<< HEAD
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

// Statik dosya servis öncesi loglama
app.use((req, res, next) => {
    console.log('İstek:', {
        method: req.method,
        url: req.url,
        headers: req.headers
    });
    next();
});

// Statik dosyalar
app.use(express.static('public'));

// Catch-all route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Sunucu hatası:', err);
    res.status(500).json({
        error: 'Sunucu hatası',
        details: err.message
    });
});

// Port ayarı
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
=======
// Skor güncelle
app.post('/api/score', (req, res) => {
    const { nickname, score } = req.body;
    const scores = readScores();
    const player = scores.find(p => p.nickname === nickname);
    
    if (player && score > player.highScore) {
        player.highScore = score;
        player.lastPlayed = new Date();
        writeScores(scores);
    }
    
    res.json(player);
});

// Liderlik tablosu
app.get('/api/leaderboard', (req, res) => {
    const scores = readScores()
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 10);
    res.json(scores);
});

const PORT = 3000;
app.listen(PORT, () => {
>>>>>>> d756bf6e02cc61c29851f813be5bb5671d5aac8d
=======
// Liderlik tablosu
app.get('/api/leaderboard', (req, res) => {
    const scores = readScores()
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 10);
    res.json(scores);
});

const PORT = 3000;
app.listen(PORT, () => {
>>>>>>> d756bf6e02cc61c29851f813be5bb5671d5aac8d
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM sinyali alındı. Sunucu kapatılıyor...');
    server.close(() => {
        console.log('Sunucu kapatıldı');
        mongoose.connection.close(false, () => {
            console.log('MongoDB bağlantısı kapatıldı');
            process.exit(0);
        });
    });
});
