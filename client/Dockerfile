FROM node:18-alpine
WORKDIR /client/
COPY public/ /client/public
COPY src/ /client/src
COPY .env /client/
COPY jsconfig /client/
COPY package.json /client/
COPY tailwind.config.js /client/
RUN npm install
CMD ["npm", "start"]