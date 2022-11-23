FROM node:16

WORKDIR /app
COPY ["package.json", "./"]
RUN ["npm", "install"]
COPY . .
EXPOSE 10005
CMD  ["npm", "start"]