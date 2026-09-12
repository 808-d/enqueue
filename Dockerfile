FROM golang:1.26


COPY .  /app/
WORKDIR /app
RUN go mod download

CMD ["go", "run", "cmd/main.go"]
