const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const N8N_WEBHOOK_URL = 'http://115.132.39.121:5678/webhook/whatsapp-in';

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
  console.log('✅ WhatsApp bot is ready!');
});

// 🔁 Send incoming messages to n8n webhook
client.on('message', async (message) => {
  console.log(`📥 Incoming message from ${message.from}: ${message.body}`);
  try {
    const payload = {
      from: message.from,
      body: message.body,
      timestamp: message.timestamp
    };
    console.log('📤 Sending to n8n webhook:', payload);

    await axios.post(N8N_WEBHOOK_URL, payload);

    console.log('✅ Message forwarded to n8n webhook');
  } catch (error) {
    console.error('❌ Failed to send message to n8n webhook:', error.message);
  }
});

// ✅ Receive reply message from n8n and send via WhatsApp
app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;

  console.log('📨 Received POST /send-message with:', req.body);

  if (!to || !message) {
    console.warn('⚠️ Missing "to" or "message" in body');
    return res.status(400).json({ error: 'Missing "to" or "message" in body' });
  }

  try {
    await client.sendMessage(to, message);
    console.log(`✅ Sent reply to ${to}: ${message}`);
    res.json({ status: 'success', to, message });
  } catch (err) {
    console.error('❌ Failed to send message:', err?.message || err);
    res.status(500).json({ status: 'error', error: err?.message || 'Unknown error' });
  }
});

// Root check
app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
  console.log(`🚀 Express server listening on http://localhost:${port}`);
});

client.initialize();
