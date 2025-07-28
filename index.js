import qrcode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('📱 Scan the QR code above to authenticate WhatsApp');
});

client.on('ready', () => {
    console.log('✅ WhatsApp bot is ready!');
});

client.on('message', msg => {
    if (msg.body.toLowerCase() === 'hi') {
        msg.reply('Hello! This is an automated response 🤖');
    }
});

client.initialize();
