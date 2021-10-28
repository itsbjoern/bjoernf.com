# syntax=docker/dockerfile:1
FROM python:3.8-alpine
RUN apk --no-cache add gcc musl-dev libffi-dev jpeg-dev zlib-dev rsync
RUN python3 -m pip install --upgrade pip
WORKDIR /image-server
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY server server
COPY start.sh start.sh
COPY images images
CMD ["./start.sh"]
