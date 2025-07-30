const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Replace with your actual n8n webhook URL
const N8N_WEBHOOK_URL = 'https://your-n8n-domain/webhook/whatsapp-in';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox']
  }
});

client.on('qr', (qr) => {
  console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
  console.log(`Message from ${message.from}: ${message.body}`);

  try {
    await axios.post(N8N_WEBHOOK_URL, {
      from: message.from,
      body: message.body,
      timestamp: message.timestamp
    });
  } catch (error) {
    console.error('Failed to send message to n8n webhook:', error.message);
  }
});

client.initialize();

app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
