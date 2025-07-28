const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = 3000;

let lastQR = null;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

client.on('qr', (qr) => {
    lastQR = qr;
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (message.body === 'ping') {
        message.reply('pong');
    }
});

client.initialize();

app.get('/qr', (req, res) => {
    if (lastQR) {
        res.send(`<h1>Scan this QR</h1><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(lastQR)}" />`);
    } else {
        res.send('QR not generated yet. Please wait.');
    }
});

app.listen(port, () => {
    console.log(`QR server running at http://localhost:${port}`);
});
