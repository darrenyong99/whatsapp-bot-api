const express = require('express');
const qrcode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = null;

const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', async (qr) => {
    console.log('QR RECEIVED');
    qrCodeData = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('authenticated', () => {
    console.log('Authenticated');
});

client.on('auth_failure', () => {
    console.error('Auth failed');
});

client.initialize();

app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.send(`<h2>Scan QR Code:</h2><img src="${qrCodeData}" />`);
    } else {
        res.send('<h3>QR not generated yet. Refresh in a few seconds.</h3>');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
