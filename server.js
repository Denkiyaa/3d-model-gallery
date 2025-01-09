// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'public/game')));

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

// Önce spesifik route'ları tanımlayalım
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/x-icon');
    res.sendFile(path.join(__dirname, 'public/favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'public/manifest.json'));
});

// API route'ları
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

// En son catch-all route'u ekleyelim
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/game/index.html'));
});

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
