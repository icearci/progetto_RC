FROM node:8
WORKDIR /home/node/app
EXPOSE 8087
COPY package.json /home/node/app
RUN npm install
COPY ws_gmail.js /home/node/app 
