const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const app = express();

let latestQR = null;

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu"
    ],
    executablePath: '/usr/bin/chromium' // Point to system Chromium
  }
});

client.on('qr', qr => {
  latestQR = qr;
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.initialize();

app.get('/qr', (req, res) => {
  if (latestQR) {
    res.send(`<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${latestQR}" />`);
  } else {
    res.send('QR code not generated yet. Please wait...');
  }
});

app.listen(3000, () => {
  console.log('QR server running at http://localhost:3000');
});
