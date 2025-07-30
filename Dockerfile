FROM node:18-slim

# =================== Dockerfile ===================
FROM node:18-bullseye

# Install dependencies for Puppeteer (Chrome headless)
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm install
COPY . .

# Use a non-root user (optional but safer)
RUN groupadd -r bot && useradd -r -g bot bot
USER bot

# Start the bot
CMD ["node", "index.js"]

