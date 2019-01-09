FROM node:8
WORKDIR /home/node/app
EXPOSE 8084
COPY package.json /home/node/app
RUN npm install
COPY ws_profilo.js /home/node/app 
