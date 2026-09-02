FROM nginx:latest

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf

COPY static/ /usr/share/nginx/html/static/