FROM node:8
WORKDIR /home/node/app
EXPOSE 8080
COPY package.json /home/node/app
COPY ./html/ /home/node/app/html/
RUN npm install
COPY server.js /home/node/app 
COPY wait-for-it.sh /home/node/app 
COPY client_id.json /home/node/app
