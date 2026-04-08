FROM node:18-alpine

# Instala git (necessário para algumas dependências do Baileys)
RUN apk add --no-cache git

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
