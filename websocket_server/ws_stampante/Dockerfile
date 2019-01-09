FROM node:8
WORKDIR /home/node/app
EXPOSE 8085
COPY package.json /home/node/app
RUN npm install
COPY ws_stampante.js /home/node/app 
