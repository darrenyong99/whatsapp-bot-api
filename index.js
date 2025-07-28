const { Client } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');

const app = express();
const port = 3000;

let qrCodeString = '';

const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox'],
    },
    authStrategy: new require('whatsapp-web.js').LocalAuth()
});

client.on('qr', (qr) => {
    qrCodeString = qr;
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
});

client.initialize();

// Serve QR code as image
app.get('/qr', async (req, res) => {
    if (!qrCodeString) return res.send('QR not yet generated. Please wait...');
    const qrImage = await qrcode.toDataURL(qrCodeString);
    const html = `
        <html>
        <body style="text-align:center;">
            <h2>Scan QR with WhatsApp</h2>
            <img src="${qrImage}" />
        </body>
        </html>`;
    res.send(html);
});

app.listen(port, () => {
    console.log(`🚀 Visit http://localhost:${port}/qr to scan QR`);
});
