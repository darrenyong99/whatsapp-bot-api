const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser'); // ✅ Needed to parse JSON body

const app = express();
const port = 3000;

// ✅ Parse JSON body from POST requests
app.use(bodyParser.json());

// ✅ Your n8n Webhook URL:
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
  console.log('WhatsApp bot is ready!');
});

// 🔁 Send incoming messages to n8n webhook
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

// ✅ NEW: Receive reply message from n8n and send via WhatsApp
app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" in body' });
  }

  try {
    await client.sendMessage(to, message);
    console.log(`✅ Sent reply to ${to}: ${message}`);
    res.json({ status: 'success', to, message });
  } catch (err) {
    console.error('❌ Failed to send message:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Root check
app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

client.initialize();
