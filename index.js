const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json()); // 🔥 Required for POST /send-message

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

// 🔁 Send incoming WhatsApp messages to n8n webhook
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

// ✅ POST endpoint to send WhatsApp message via API
app.post('/send-message', async (req, res) => {
  const { to, message } = req.body;

  try {
    const sentMsg = await client.sendMessage(to, message);
    return res.status(200).json({ success: true, id: sentMsg.id._serialized });
  } catch (error) {
    console.error('Send message error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

client.initialize();
