FROM nginx:alpine
RUN apk add rsync
WORKDIR /static
COPY . .
CMD ["./start.sh"]
