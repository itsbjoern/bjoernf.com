# Blog

## nginx proxy + acme encrypt
```
  sudo docker-compose -f proxy.yml up
```

## Blog

```
  sudo docker-compose rm -f; sudo docker volume prune -f; sudo docker-compose -f docker-compose.yml -f prod.yml up -d --build
```
