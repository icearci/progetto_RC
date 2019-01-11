FROM nginx
COPY ./conf/nginx.conf /etc/nginx
COPY load-balancer.conf /etc/nginx/conf.d
COPY ./keys /etc/nginx/keys
COPY ./wait-for-it.sh /usr/share/nginx/
COPY ./html/ /etc/nginx/html/html
EXPOSE 80
EXPOSE 443
