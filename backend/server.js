const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/castle_defense', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Player model
const Player = mongoose.model('Player', {
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

// Routes
app.post('/api/login', async (req, res) => {
    try {
        const { nickname } = req.body;
        let player = await Player.findOne({ nickname });
        
        if (!player) {
            player = new Player({ nickname });
            await player.save();
        }
        
        res.json(player);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/score', async (req, res) => {
    try {
        const { nickname, score } = req.body;
        const player = await Player.findOne({ nickname });
        
        if (score > player.highScore) {
            player.highScore = score;
        }
        
        player.lastPlayed = new Date();
        await player.save();
        
        res.json(player);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const topPlayers = await Player.find()
            .sort({ highScore: -1 })
            .limit(10);
        res.json(topPlayers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 