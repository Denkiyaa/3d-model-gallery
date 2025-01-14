module.exports = {
  apps: [{
    name: "craftedfromfilament",
    script: "server.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    watch: false,
    instances: 1,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}; 