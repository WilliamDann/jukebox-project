FROM node:lts-alpine

WORKDIR app/
EXPOSE 8080

CMD npm i && npm run start