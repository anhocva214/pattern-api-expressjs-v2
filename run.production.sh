#!/bin/bash
docker image rm api:latest
docker build -t api:latest -f production.dockerfile .
docker rm -f api
docker run -it -d --name api --restart always --network apps --link nginx-proxy --link letsencrypt-nginx-proxy --env TZ=Asia/Ho_Chi_Minh -e VIRTUAL_HOST="api.domain.com" -e VIRTUAL_PORT=9002 -e LETSENCRYPT_HOST="api.domain.com" -e LETSENCRYPT_EMAIL="email@gmail.com" api:latest
docker system prune -f