FROM node:22.0.0-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "run", "dev"]