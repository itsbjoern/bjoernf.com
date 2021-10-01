# syntax=docker/dockerfile:1
FROM python:3.8-alpine
RUN apk --no-cache add gcc musl-dev libffi-dev
WORKDIR /api
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY blogapi blogapi
RUN mkdir -p /api/blogapi/uploads
CMD ["python", "-m", "blogapi"]
