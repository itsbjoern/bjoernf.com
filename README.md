# Blog

## Install

### nginx proxy + acme encrypt
compose.yml
```
---
version: "2.1"
services:
  nginx:
    image: nginxproxy/nginx-proxy
    container_name: nginx-proxy
    ports:
      - 80:80
      - 443:443
    volumes:
      - certs:/etc/nginx/certs
      - vhost:/etc/nginx/vhost.d
      - html:/usr/share/nginx/html
      - /var/run/docker.sock:/tmp/docker.sock:ro
    restart: unless-stopped
  acme:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    depends_on:
      - nginx
    volumes_from:
      - nginx
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - acme:/etc/acme.sh
    environment:
      DEFAULT_EMAIL: 05exhaust-beds@icloud.com
    restart: unless-stopped

volumes:
  certs: {}
  vhost: {}
  html: {}
  acme: {}
```
