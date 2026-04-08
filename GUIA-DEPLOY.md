# 📦 Guia Completo - Deploy da API WhatsApp

Siga estes passos **na ordem** para ter sua API rodando grátis.

---

## 📋 O que você precisa

1. ✅ Conta no GitHub (para salvar o código)
2. ✅ Conta no Render.com (hospedagem grátis)
3. ✅ Seu n8n já rodando
4. ⏱️ Tempo: ~15 minutos

---

## 🚀 PASSO 1: Subir código no GitHub

### Opção A: Usando Git no terminal
```bash
# Na pasta whatsapp-api
git init
git add .
git commit -m "API WhatsApp bot ofertas"

# Crie um repo novo no GitHub e:
git remote add origin https://github.com/SEU_USUARIO/whatsapp-api.git
git push -u origin main
```

### Opção B: GitHub Desktop (mais fácil)
1. Baixe https://desktop.github.com
2. File → Add Local Repository → Selecione a pasta `whatsapp-api`
3. Clique em Publish Repository
4. Nome: `whatsapp-api`, Público

---

## 🚀 PASSO 2: Deploy no Render

1. **Acesse** https://render.com e faça login com GitHub

2. **Clique em New +** → **Web Service**

3. **Conecte o repositório**:
   - "Connect a repository"
   - Selecione `whatsapp-api`

4. **Preencha**:
   ```
   Name: whatsapp-ofertas-api
   Region: US East (pense em NYC)
   Branch: main
   Root Directory: whatsapp-api
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Escolha o plano**:
   - **Free** (grátis, mas "dorme" após inatividade)
   - OU **Starter** ($7/mês, sempre ativo)

6. **Variáveis de Ambiente** (Environment Variables):
   ```
   PORT=3000
   N8N_WEBHOOK_URL=https://n8neditor.arck1pro.shop/webhook/whatsapp-received
   AUTH_TOKEN=ofertas_bot_token_2026
   ```

7. **Clique em "Create Web Service"**

8. **Aguarde** ~2-5 minutos até ficar verde ✅

---

## 🚀 PASSO 3: Manter a API ativa (se usar plano Free)

O Render Free "dorme" após 15 min sem uso. Para evitar:

### Opção 1: UptimeRobot (grátis)
1. Acesse https://uptimerobot.com
2. Crie conta grátis
3. Add New Monitor
4. Tipo: **HTTP(s)**
5. URL: `https://whatsapp-ofertas-api.onrender.com/status`
6. Interval: **5 minutes**
7. Criar monitor

### Opção 2: Upgrade para Starter ($7/mês)
- Sempre ativo
- Sem necessidade de UptimeRobot

---

## 🚀 PASSO 4: Conectar ao WhatsApp

1. **Veja os logs no Render**:
   - Vá na dashboard do serviço
   - Clique em **Logs**

2. **Procure o QR Code** nos logs (aparece em texto)

3. **Escaneie com seu celular**:
   - WhatsApp → Aparelhos conectados → Conectar aparelho
   - Escaneie o QR Code

4. **Aguarde** "✅ WhatsApp conectado!"

---

## 🚀 PASSO 5: Pegar ID do Grupo WhatsApp

1. No WhatsApp, entre no grupo de ofertas (ou crie um)

2. Envie uma mensagem no grupo

3. **Veja os logs da API** no Render

4. Procure por algo como:
   ```
   📨 Mensagem de 5511999999999: teste
   ```

5. O ID do grupo tem formato: `123456789-abcxyz@g.us`

### Método alternativo:
Use este endpoint para listar grupos:
```bash
curl https://whatsapp-ofertas-api.onrender.com/list-groups \
  -H "Authorization: Bearer ofertas_bot_token_2026"
```

---

## 🚀 PASSO 6: Integrar com n8n

### Criar HTTP Request no n8n:

1. No seu workflow de ofertas, adicione um nó **HTTP Request**

2. Configure:
   ```
   Method: POST
   URL: https://whatsapp-ofertas-api.onrender.com/send-group

   Headers:
     Authorization: Bearer ofertas_bot_token_2026
     Content-Type: application/json

   Body (JSON):
   {
     "groupId": "SEU_GRUPO_ID@g.us",
     "message": "🔥 OFERTA: Produto X de R$100 por R$50!"
   }
   ```

3. **Teste** o nó

4. **Salve** o workflow

---

## ✅ Teste Final

1. No n8n, execute o workflow

2. **Verifique no Render**:
   - Logs devem mostrar "✅ Mensagem enviada para grupo..."

3. **Verifique no WhatsApp**:
   - A mensagem deve aparecer no grupo

---

## 🆘 Solução de Problemas

| Problema | Solução |
|----------|---------|
| API não conecta | Veja logs, reconecte QR Code |
| Mensagem não chega | Verifique ID do grupo (@g.us) |
| Erro 401 | Token errado no header |
| API "dormindo" | Configure UptimeRobot |
| Erro no n8n | Teste URL no navegador primeiro |

---

## 📊 URLs Úteis

- **Status da API**: `https://whatsapp-ofertas-api.onrender.com/status`
- **Logs no Render**: Dashboard → Logs
- **Seu n8n**: https://n8neditor.arck1pro.shop

---

## 💰 Custos

| Serviço | Custo |
|---------|-------|
| Render Free | R$ 0 (dorme) |
| Render Starter | ~R$ 35/mês |
| UptimeRobot | R$ 0 |
| **Total** | **R$ 0 - 35/mês** |

---

**Próximo passo**: Depois de rodando, me avise que te ajudo a configurar os disparos automáticos! 🚀
