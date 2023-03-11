FROM mcr.microsoft.com/playwright:v1.31.2-focal

ENV DEBIAN_FRONTEND=noninteractive
ENV SERVER_MODE=true
ENV BOT_TOKEN=
ENV CHAT_ID=

# Set work directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Bundle app source
COPY . .

# Run
CMD [ "npm", "run", "telegrambot" ]