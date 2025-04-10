from node:lts-alpine

workdir app/

RUN chmod +x ./setup

expose 8080

cmd [ "sh", "./setup" ]