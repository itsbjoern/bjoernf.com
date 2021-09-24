# Blog

## Install

### nginx proxy + acme encrypt
compose.yml
```
---
version: "2.1"
services:
  nginx-proxy:
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
    network_mode: bridge
  nginx-proxy-acme:
    image: nginxproxy/acme-companion
    container_name: nginx-proxy-acme
    volumes_from:
      - nginx-proxy
    volumes:
      - certs:/etc/nginx/certs:rw
      - acme:/etc/acme.sh
      - /var/run/docker.sock:/var/run/docker.sock:ro
    network_mode: bridge
    environment:
      DEFAULT_EMAIL: 05exhaust-beds@icloud.com
    restart: unless-stopped

volumes:
  conf:
  vhost:
  html:
  dhparam:
  certs:
  acme:
```

### Create

```
  sudo docker-compose rm -f; sudo docker volume prune -f; sudo docker-compose -f docker-compose.yml -f prod.yml up -d --build
```