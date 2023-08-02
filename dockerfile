FROM node:18-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts

COPY . .

EXPOSE 3000

CMD ["node", "./src/index.js"]
