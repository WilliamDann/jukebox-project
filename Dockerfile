from node:lts-alpine

workdir app/
copy . .
expose 8080

cmd [ "./setup" ]