FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run db:generate && npm run build
ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 3001
CMD ["sh","-c","npm run db:migrate && npm start"]
