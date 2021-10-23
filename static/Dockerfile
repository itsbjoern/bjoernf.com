FROM nginx:alpine
RUN apk add rsync
WORKDIR /static
COPY ./start.sh ./start.sh
COPY ./static_gzip.conf /etc/nginx/conf.d/gzip.conf
CMD ["./start.sh"]
