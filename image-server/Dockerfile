# syntax=docker/dockerfile:1
FROM bjornf-api-base
WORKDIR /image-server
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY server server
CMD ["python", "-m", "server"]
