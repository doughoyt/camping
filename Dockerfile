FROM node:16-alpine

ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Get required libraries (excluding dev-only)
RUN npm ci --omit=dev

# Bundle app source
#  Make sure .dockerignore exludes any ENV/sensitive data or installed node module folders
COPY --chown=node:node . .

VOLUME /usr/src/app/config

USER node
CMD [ "node", "-r", "dotenv/config", "src/app.mjs" ]