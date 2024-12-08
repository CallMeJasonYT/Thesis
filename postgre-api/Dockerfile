FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 3030

CMD ["yarn", "start"]
