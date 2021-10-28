# syntax=docker/dockerfile:1
FROM bjornf-api-base
WORKDIR /api
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt
COPY blogapi blogapi
CMD ["python", "-m", "blogapi"]
