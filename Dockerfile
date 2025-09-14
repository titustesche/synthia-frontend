FROM nginx:latest

LABEL authors="Titus Tesche"

COPY . /usr/share/nginx/html

EXPOSE 80