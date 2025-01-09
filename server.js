// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/leaderboard', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB bağlantısı başarılı');
    
    // Test verisi ekle
    const testPlayer = new Player({
        nickname: "TestPlayer",
        highScore: 100,
        lastPlayed: new Date()
    });
    
    testPlayer.save()
        .then(() => console.log('Test verisi eklendi'))
        .catch(err => {
            if(err.code !== 11000) { // 11000: duplicate key error
                console.error('Test veri ekleme hatası:', err);
            }
        });
        
}).catch((err) => {
    console.error('MongoDB bağlantı hatası:', err);
});

// Player Schema
const playerSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    highScore: {
        type: Number,
        default: 0
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    }
});

// Player Model
const Player = mongoose.model('Player', playerSchema);

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { nickname } = req.body;
        
        // Oyuncuyu bul veya oluştur
        let player = await Player.findOne({ nickname });
        
        if (!player) {
            player = new Player({ nickname });
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
        
        // Oyuncuyu bul ve skoru güncelle
        const player = await Player.findOne({ nickname });
        
        if (player && score > player.highScore) {
            player.highScore = score;
            player.lastPlayed = new Date();
            await player.save();
        }
        
        res.json(player);
    } catch (error) {
        console.error('Skor güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        // En yüksek 10 skoru getir
        const topPlayers = await Player
            .find()
            .sort({ highScore: -1 })
            .limit(10);
        
        res.json(topPlayers);
    } catch (error) {
        console.error('Leaderboard hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

const PORT = 3000;
const IP = '0.0.0.0'; // Tüm IP'lerden erişime izin ver

app.listen(PORT, IP, () => {
    console.log(`Server running on port ${PORT}`);
});
