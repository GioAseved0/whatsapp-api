# 📱 WhatsApp API para Bot de Ofertas

API simples usando **Baileys** para enviar/receber mensagens do WhatsApp.

---

## 🚀 Deploy Grátis no Render

### Passo 1: Criar conta no Render
1. Acesse https://render.com
2. Faça login com GitHub
3. Clique em **New +** → **Web Service**

### Passo 2: Conectar seu repositório
1. Conecte sua conta do GitHub
2. Selecione o repositório com este código

### Passo 3: Configurar
- **Name**: `whatsapp-ofertas-api`
- **Region**: US East (mais próximo do Brasil)
- **Branch**: main
- **Root Directory**: `whatsapp-api`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Passo 4: Variáveis de Ambiente
Adicione estas variáveis:
```
PORT=3000
N8N_WEBHOOK_URL=https://n8neditor.arck1pro.shop/webhook/whatsapp-received
AUTH_TOKEN=seu_token_secreto_aqui
```

### Passo 5: Deploy!
Clique em **Create Web Service**

> ⚠️ **Importante**: O plano free do Render "dorme" após 15 min de inatividade. Para manter sempre ativo, use um serviço como [UptimeRobot](https://uptimerobot.com) para pingar a API a cada 5 min.

---

## 🖥️ Rodando Localmente (para testes)

```bash
cd whatsapp-api
npm install
npm start
```

1. Escaneie o QR Code no terminal
2. API estará em `http://localhost:3000`

---

## 📡 Endpoints da API

### GET `/status`
Verifica status da conexão.
```bash
curl http://localhost:3000/status
```

### POST `/send`
Envia mensagem para um número.
```bash
curl -X POST http://localhost:3000/send \
  -H "Authorization: Bearer seu_token_secreto_aqui" \
  -H "Content-Type: application/json" \
  -d '{"to": "5511999999999", "message": "Olá!"}'
```

### POST `/send-group`
Envia mensagem para grupo.
```bash
curl -X POST http://localhost:3000/send-group \
  -H "Authorization: Bearer seu_token_secreto_aqui" \
  -H "Content-Type: application/json" \
  -d '{"groupId": "123456789@g.us", "message": "Oferta do dia!"}'
```

---

## 🔧 Integrando com n8n

### 1. No n8n, crie um webhook
- Método: POST
- Path: `whatsapp-received`
- Copie a URL

### 2. No código, atualize `.env`
```
N8N_WEBHOOK_URL=https://n8neditor.arck1pro.shop/webhook/whatsapp-received
```

### 3. Para enviar mensagens do n8n
Use o nó **HTTP Request**:
- Method: POST
- URL: `https://sua-api.onrender.com/send-group`
- Headers:
  - `Authorization: Bearer seu_token_secreto_aqui`
  - `Content-Type: application/json`
- Body:
```json
{
  "groupId": "SEU_GRUPO_ID@g.us",
  "message": "🔥 OFERTA RELÂMPAGO!"
}
```

---

## 📍 Como pegar o ID do grupo

1. Envie uma mensagem no grupo
2. Veja o log da API - vai mostrar o ID
3. Ou use este truque:
   - Adicione um nó HTTP Request no n8n
   - Faça GET em `/status` após conectar
   - Os logs mostrarão os IDs

Formato: `123456789-abcxyz@g.us`

---

## 🔐 Segurança

- Defina um `AUTH_TOKEN` forte
- Use HTTPS em produção
- Não compartilhe as credenciais

---

## 🆘 Problemas Comuns

### "WhatsApp não conectado"
- Escaneie o QR Code no terminal/logs

### "401 Não autorizado"
- Verifique o token no header

### API saindo do ar (Render)
- Configure monitoramento no UptimeRobot

---

**Dúvidas? Veja os logs no Render!**
