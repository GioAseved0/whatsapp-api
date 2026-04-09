const express = require('express');
const cors = require('cors');
const venom = require('venom-bot');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'default-token';

// Estado da conexão
let client = null;
let connectionState = 'disconnected';
let phoneNumber = null;

// Criar cliente WhatsApp
async function startWhatsApp() {
    console.log('🔄 Iniciando WhatsApp...');

    try {
        client = await venom.create({
            session: 'ofertas',
            headless: false,  // Abre navegador visível
            logQR: true,
            catchQR: (base64Qr, asciiQR) => {
                console.log('\n=== QR CODE ===');
                console.log(asciiQR);
                console.log('===============\n');
            },
            statusFind: (status) => {
                console.log('📡 Status:', status);
                if (status === 'connected') {
                    connectionState = 'connected';
                }
            },
            browserArgs: [
                '--no-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        client.onMessage(async (message) => {
            if (message.isGroupMsg || message.fromMe) return;

            const fromNumber = message.from.split('@')[0];
            const messageText = message.body;

            console.log(`📨 Mensagem de ${fromNumber}: ${messageText}`);

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

        console.log('✅ WhatsApp pronto para conectar!');

    } catch (error) {
        console.error('❌ Erro ao iniciar WhatsApp:', error.message);
        connectionState = 'error';
    }
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

    if (!client || connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
        await client.sendText(jid, message);

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

    if (!client || connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const jid = groupId.includes('@') ? groupId : `${groupId}@g.us`;
        await client.sendText(jid, message);

        console.log(`✅ Mensagem enviada para grupo ${groupId}`);
        res.json({ success: true, groupId });
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/list-groups', authMiddleware, async (req, res) => {
    if (!client || connectionState !== 'connected') {
        return res.status(503).json({ error: 'WhatsApp não conectado' });
    }

    try {
        const groups = await client.getAllGroups(false);
        const groupList = groups.map(g => ({
            id: g.id._serialized,
            name: g.name,
            participants: g.groupMetadata?.participants?.length || 0
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
    startWhatsApp();
});
