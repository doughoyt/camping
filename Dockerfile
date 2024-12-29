FROM node:16-alpine

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --omit=dev

# Bundle app source
COPY --chown=node:node . .

VOLUME /usr/src/app/config

USER node
CMD [ "node", "-r", "dotenv/config", "src/app.mjs" ]