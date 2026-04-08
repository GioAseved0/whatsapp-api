# 🚀 Deploy no Railway - Passo a Passo

O Railway é **mais fácil** que o Render e não "dorme".

---

## 📋 O que você precisa

1. Conta no GitHub
2. Conta no Railway (entra com GitHub)
3. Código no GitHub

---

## 📦 PASSO 1: Subir código no GitHub

Se ainda não subiu:

```bash
# Na pasta whatsapp-api
git init
git add .
git commit -m "API WhatsApp bot ofertas"

# Crie um repo no GitHub e rode:
git remote add origin https://github.com/SEU_USUARIO/whatsapp-api.git
git branch -M main
git push -u origin main
```

Ou use o **GitHub Desktop** (mais fácil):
1. Baixe https://desktop.github.com
2. File → Add Local Repository → pasta `whatsapp-api`
3. Publish Repository

---

## 🚀 PASSO 2: Criar projeto no Railway

1. **Acesse** https://railway.app
2. **Login com GitHub**
3. Clique em **"New Project"**
4. Escolha **"Deploy from GitHub repo"**
5. Selecione o repo `whatsapp-api`

---

## ⚙️ PASSO 3: Configurar

Na página do projeto:

### 1. Variáveis de Ambiente (Variables)
Clique em **"Variables"** → **"New Variable"**:

```
PORT=3000
N8N_WEBHOOK_URL=https://n8neditor.arck1pro.shop/webhook/whatsapp-received
AUTH_TOKEN=ofertas_bot_token_2026
```

### 2. Build Settings
Clique em **"Settings"**:

- **Root Directory**: `whatsapp-api`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

---

## 🎁 Bônus: $5 de crédito grátis

O Railway dá $5 grátis pra começar (não pede cartão!).

Para ativar:
1. Vá em **Settings** (do projeto)
2. **Billing**
3. Adicione um método de pagamento (opcional, mas libera mais recursos)

---

## 🔄 PASSO 4: Deploy automático

Assim que você conectar o repo, o Railway já começa o deploy!

1. Veja o **Deploy Log** - mostra o progresso
2. Quando ficar verde ✅, tá no ar!
3. Copie a URL (ex: `whatsapp-api-production.up.railway.app`)

---

## 📱 PASSO 5: Conectar ao WhatsApp

1. Vá em **"Deployments"** → **"View Logs"**
2. Procure o **QR Code** nos logs (vai aparecer em texto)
3. Escaneie com seu WhatsApp:
   - WhatsApp → Aparelhos conectados → Conectar aparelho
   - Aponte pro QR Code na tela

4. Aguarde: **"✅ WhatsApp conectado!"**

---

## 🔗 PASSO 6: Pegar a URL da API

No Railway, copie a URL do serviço (ex: `https://whatsapp-api-production.up.railway.app`)

**Teste a URL:**
```bash
curl https://whatsapp-api-production.up.railway.app/status
```

Deve retornar:
```json
{"status":"connected","phoneNumber":"5511999999999","connected":true}
```

---

## 📍 PASSO 7: Pegar ID do Grupo

```bash
curl https://whatsapp-api-production.up.railway.app/list-groups \
  -H "Authorization: Bearer ofertas_bot_token_2026"
```

Resposta:
```json
{
  "success": true,
  "groups": [
    {"id": "123456789-abc@g.us", "name": "Ofertas Imperdíveis", "participants": 45}
  ]
}
```

**Copie o ID do grupo!**

---

## 🔧 PASSO 8: Integrar com n8n

No seu workflow do n8n:

### Nó HTTP Request:
```
Method: POST
URL: https://SEU-PROJETO.up.railway.app/send-group

Headers:
  Authorization: Bearer ofertas_bot_token_2026
  Content-Type: application/json

Body (JSON):
{
  "groupId": "123456789-abc@g.us",
  "message": "🔥 OFERTA: Produto X de R$100 por R$50!"
}
```

---

## ✅ Teste Final

1. Execute o workflow no n8n
2. Veja os logs no Railway
3. Mensagem deve aparecer no WhatsApp!

---

## 💰 Custos Railway

| Uso | Custo |
|-----|-------|
| Até $5/mês | **Grátis** (crédito inicial) |
| Depois | $5/mês (~R$ 25) |

O crédito de $5 dura **meses** pra esse tipo de API (baixo uso).

---

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Build falha | Veja logs, verifique package.json |
| QR Code não aparece | Veja logs completos |
| 401 Não autorizado | Token errado |
| Grupo não recebe | ID do grupo errado (precisa @g.us) |

---

## 📊 URLs Úteis

- **Railway Dashboard**: https://railway.app
- **Sua API**: `https://SEU-PROJETO.up.railway.app/status`
- **Logs**: Railway → Deployments → View Logs
- **n8n**: https://n8neditor.arck1pro.shop

---

**Dúvidas?** Os logs no Railway mostram tudo que tá acontecendo!
