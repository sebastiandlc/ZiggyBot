FROM node:16.10-alpine3.11

RUN mkdir /ZiggyBot

COPY . /ZiggyBot

WORKDIR /ZiggyBot

RUN npm install

CMD ["node", "index.js"]
