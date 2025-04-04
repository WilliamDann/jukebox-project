from node:lts-alpine

workdir app/
expose 8080

cmd [ "./setup" ]