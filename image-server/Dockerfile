# syntax=docker/dockerfile:1
FROM bjornf-api-base
WORKDIR /image-server
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY server server
COPY start.sh start.sh
COPY images images
CMD ["./start.sh"]
