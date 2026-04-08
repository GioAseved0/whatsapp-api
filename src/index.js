const express = require('express');
const cors = require('cors');
const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'default-token';

// Estado da conexão
let sock;
let connectionState = 'disconnected';
let phoneNumber = null;

// Logger
const logger = pino({ level: 'info' });

// Função para conectar ao WhatsApp
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('\n=== QR CODE DO WHATSAPP ===');
            console.log('Escaneie este QR Code:');
            console.log(qr);
            console.log('========================\n');
            connectionState = 'qr_ready';
        }

        if (connection === 'close') {
            connectionState = 'disconnected';
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            connectionState = 'connected';
            const user = sock.user;
            phoneNumber = user?.id?.split('@')[0];
            console.log('✅ WhatsApp conectado! Número:', phoneNumber);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const fromNumber = msg.key.remoteJid?.split('@')[0];
        const messageText = msg.conversation || msg.message?.extendedTextMessage?.text || '';

        console.log(`📨 Mensagem de ${fromNumber}: ${messageText}`);

        // Envia para o n8n
        if (N8N_WEBHOOK_URL && messageText) {
            try {
                await axios.post(N8N_WEBHOOK_URL, {
                    from: fromNumber,
                    message: messageText,
                    timestamp: new Date().toISOString()
                });
                console.log('✅ Mensagem enviada para n8n');
            } catch (error) {
                console.error('❌ Erro ao enviar para n8n:', error.message);
            }
        }
    });
}

// Middleware de autenticação
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token !== AUTH_TOKEN) {
        return res.status(401).json({ error: 'Não autorizado' });
    }
    next();
}

// API Routes
app.get('/status', (req, res) => {
    res.json({
        status: connectionState,
        phoneNumber: phoneNumber,
        connected: connectionState === 'connected'
    });
});

app.post('/send', authMiddleware, async (req, res) => {
    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ error: 'Campos "to" e "message" são obrigatórios' });
    }

    if (connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text: message });

        console.log(`✅ Mensagem enviada para ${to}`);
        res.json({ success: true, to });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/send-group', authMiddleware, async (req, res) => {
    const { groupId, message } = req.body;

    if (!groupId || !message) {
        return res.status(400).json({ error: 'Campos "groupId" e "message" são obrigatórios' });
    }

    if (connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const jid = groupId.includes('@') ? groupId : `${groupId}@g.us`;

        await sock.sendMessage(jid, { text: message });

        console.log(`✅ Mensagem enviada para grupo ${groupId}`);
        res.json({ success: true, groupId });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/qr', (req, res) => {
    res.json({ status: connectionState, message: 'QR Code será exibido no terminal' });
});

app.get('/list-groups', authMiddleware, async (req, res) => {
    if (connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const groups = await sock.groupFetchAllParticipating();
        const groupList = Object.values(groups).map(g => ({
            id: g.id,
            name: g.subject,
            participants: g.participants?.length || 0
        }));

        res.json({ success: true, groups: groupList });
    } catch (error) {
        console.error('❌ Erro ao listar grupos:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    connectToWhatsApp();
});
