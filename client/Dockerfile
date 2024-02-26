FROM node:18
WORKDIR /app
COPY client/package.json client/package-lock.json ./
COPY client/. ./
RUN npm install --quiet --no-progress
EXPOSE 3000
CMD ["npm", "start"]