FROM node:23

WORKDIR /app

COPY . /app

RUN npm install

CMD ["npm", "run", "deploy"]