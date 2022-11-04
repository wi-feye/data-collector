FROM node:16

# Create app directory
WORKDIR /app

ENV NODE_ENV=production

# Install app dependencies
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "./src/server.js" ]