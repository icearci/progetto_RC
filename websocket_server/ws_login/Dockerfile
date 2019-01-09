FROM node:8
WORKDIR /home/node/app
EXPOSE 8082
COPY package.json /home/node/app
RUN npm install
COPY ws_login.js /home/node/app 
