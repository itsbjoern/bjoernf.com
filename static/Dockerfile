FROM nginx:alpine
RUN apk add rsync
WORKDIR /static
COPY gzip.conf /etc/nginx/conf.d/gzip.conf
CMD ["nginx", "-g", "daemon off;"]
