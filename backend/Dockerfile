FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm i --omit=dev

COPY server.js ./

ENV PORT=6000
EXPOSE 6000

CMD ["node", "server.js"]