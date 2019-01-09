FROM node:8
WORKDIR /home/node/app
EXPOSE 8083
COPY package.json /home/node/app
RUN npm install
COPY ws_register.js /home/node/app 
