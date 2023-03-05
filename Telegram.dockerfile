FROM node:18-alpine

ENV SERVER_MODE=production
ENV BOT_TOKEN=<Enter_your_bot_token_here>
ENV CHAT_ID=<Enter_your_chat_id_here>

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

CMD [ "npm", "start" ]