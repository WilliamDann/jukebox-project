from node:lts-alpine

workdir app/
expose 8080

cmd npm i && npm run start