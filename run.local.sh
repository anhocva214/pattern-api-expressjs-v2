#!/bin/bash
docker image rm api:latest
docker build -t api:latest -f production.dockerfile .
docker rm -f api
docker run -it -d --name api --restart always api:latest
docker system prune -f