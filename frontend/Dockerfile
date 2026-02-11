# Node.js imajı
FROM node:18-alpine

WORKDIR /app

# Paketleri yükle
COPY package*.json ./
RUN npm install

# Kodları kopyala
COPY . .

EXPOSE 3000

# React'i başlat
CMD ["npm", "start"]